"""
Analysis Router for HealthMaps Backend
Handles ML analysis requests, job status, and results
"""

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from fastapi.responses import JSONResponse
from typing import Optional, List, Dict, Any
import uuid
import json
from datetime import datetime
import logging

from ..services.ml_analysis_service import MLAnalysisService
from ..services.supabase_service import SupabaseService
from ..services.cloudflare_service import CloudflareR2Service
from ..models.analysis_models import (
    AnalysisRequest,
    AnalysisResponse,
    JobStatusResponse,
    BatchAnalysisRequest,
    AnalysisResultsResponse
)
from ..utils.auth_utils import get_current_user
from ..config.settings import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/analysis", tags=["analysis"])

# Initialize services
ml_service = MLAnalysisService()
supabase_service = SupabaseService()
cloudflare_service = CloudflareR2Service()


@router.post("/instant", response_model=AnalysisResponse)
async def instant_analysis(
    image_url: str,
    club_id: Optional[str] = None,
    tile_name: Optional[str] = None,
    user_id: str = Depends(get_current_user)
):
    """
    Perform instant analysis on an image
    """
    try:
        # Validate image URL
        if not image_url:
            raise HTTPException(
                status_code=400,
                detail="Image URL is required"
            )
        
        # Trigger instant analysis
        analysis_result = await ml_service.perform_instant_analysis(
            image_url=image_url,
            club_id=club_id,
            tile_name=tile_name
        )
        
        if not analysis_result.success:
            raise HTTPException(
                status_code=500,
                detail=f"Analysis failed: {analysis_result.error}"
            )
        
        return AnalysisResponse(
            success=True,
            analysis_id=analysis_result.analysis_id,
            health_score=analysis_result.data.get("health_score"),
            class_breakdown=analysis_result.data.get("class_breakdown", {}),
            overlay_url=analysis_result.data.get("overlay_url"),
            status="completed",
            message="Instant analysis completed successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Instant analysis error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Instant analysis failed: {str(e)}"
        )


@router.post("/orthomosaic", response_model=AnalysisResponse)
async def orthomosaic_analysis(
    image_urls: List[str],
    club_id: Optional[str] = None,
    tile_name: Optional[str] = None,
    user_id: str = Depends(get_current_user),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    """
    Perform orthomosaic analysis on multiple images
    """
    try:
        if len(image_urls) < 2:
            raise HTTPException(
                status_code=400,
                detail="At least 2 images required for orthomosaic analysis"
            )
        
        if len(image_urls) > settings.max_orthomosaic_images:
            raise HTTPException(
                status_code=400,
                detail=f"Maximum {settings.max_orthomosaic_images} images allowed"
            )
        
        # Trigger orthomosaic analysis
        analysis_result = await ml_service.perform_orthomosaic_analysis(
            image_urls=image_urls,
            club_id=club_id,
            tile_name=tile_name
        )
        
        if not analysis_result.success:
            raise HTTPException(
                status_code=500,
                detail=f"Orthomosaic analysis failed: {analysis_result.error}"
            )
        
        # Create analysis job record
        job_data = {
            "id": str(uuid.uuid4()),
            "job_type": "orthomosaic",
            "job_id": analysis_result.analysis_id,
            "status": "processing",
            "started_at": datetime.utcnow().isoformat(),
            "result_data": {
                "image_urls": image_urls,
                "club_id": club_id,
                "tile_name": tile_name
            }
        }
        
        job_record = await supabase_service.create_analysis_job(job_data)
        
        if not job_record:
            raise HTTPException(
                status_code=500,
                detail="Failed to create analysis job record"
            )
        
        return AnalysisResponse(
            success=True,
            analysis_id=analysis_result.analysis_id,
            job_id=job_record["id"],
            status="processing",
            message="Orthomosaic analysis started. Use job ID to check status."
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Orthomosaic analysis error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Orthomosaic analysis failed: {str(e)}"
        )


@router.get("/job/{job_id}", response_model=JobStatusResponse)
async def get_job_status(
    job_id: str,
    user_id: str = Depends(get_current_user)
):
    """
    Get status of an analysis job
    """
    try:
        # Get job from database
        job = await supabase_service.get_analysis_job(job_id)
        if not job:
            raise HTTPException(
                status_code=404,
                detail="Job not found"
            )
        
        # Verify user access (check if user owns the associated tile)
        if job.get("tile_id"):
            tile = await supabase_service.get_tile(job["tile_id"])
            if not tile or tile["client_user_id"] != user_id:
                raise HTTPException(
                    status_code=403,
                    detail="Access denied"
                )
        
        # Check status with ML service
        ml_status = await ml_service.get_job_status(job["job_id"])
        
        # Update job status if changed
        if ml_status.status != job["status"]:
            updates = {
                "status": ml_status.status,
                "updated_at": datetime.utcnow().isoformat()
            }
            
            if ml_status.status == "completed":
                updates["completed_at"] = datetime.utcnow().isoformat()
                updates["result_data"] = ml_status.result_data
            elif ml_status.status == "failed":
                updates["error_message"] = ml_status.error_message
            
            await supabase_service.update_analysis_job(job_id, updates)
            job.update(updates)
        
        return JobStatusResponse(
            success=True,
            job_id=job_id,
            status=job["status"],
            started_at=job.get("started_at"),
            completed_at=job.get("completed_at"),
            error_message=job.get("error_message"),
            result_data=job.get("result_data", {}),
            progress=ml_status.progress
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Job status error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Job status check failed: {str(e)}"
        )


@router.get("/results/{analysis_id}", response_model=AnalysisResultsResponse)
async def get_analysis_results(
    analysis_id: str,
    user_id: str = Depends(get_current_user)
):
    """
    Get detailed analysis results
    """
    try:
        # Get analysis results from ML service
        results = await ml_service.get_analysis_results(analysis_id)
        
        if not results.success:
            raise HTTPException(
                status_code=404,
                detail=f"Analysis results not found: {results.error}"
            )
        
        # Verify user access if associated with a tile
        if results.data.get("tile_id"):
            tile = await supabase_service.get_tile(results.data["tile_id"])
            if not tile or tile["client_user_id"] != user_id:
                raise HTTPException(
                    status_code=403,
                    detail="Access denied"
                )
        
        return AnalysisResultsResponse(
            success=True,
            analysis_id=analysis_id,
            health_score=results.data.get("health_score"),
            class_breakdown=results.data.get("class_breakdown", {}),
            overlay_url=results.data.get("overlay_url"),
            detailed_results=results.data.get("detailed_results", {}),
            created_at=results.data.get("created_at"),
            completed_at=results.data.get("completed_at")
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Analysis results error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get analysis results: {str(e)}"
        )


@router.post("/batch", response_model=Dict[str, Any])
async def batch_analysis(
    request: BatchAnalysisRequest,
    user_id: str = Depends(get_current_user),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    """
    Trigger batch analysis for multiple tiles
    """
    try:
        if len(request.tile_ids) > settings.max_batch_analysis:
            raise HTTPException(
                status_code=400,
                detail=f"Maximum {settings.max_batch_analysis} tiles allowed per batch"
            )
        
        # Verify user owns all tiles
        tiles = []
        for tile_id in request.tile_ids:
            tile = await supabase_service.get_tile(tile_id)
            if not tile or tile["client_user_id"] != user_id:
                raise HTTPException(
                    status_code=403,
                    detail=f"Access denied for tile {tile_id}"
                )
            tiles.append(tile)
        
        # Create batch job
        batch_id = str(uuid.uuid4())
        batch_data = {
            "id": batch_id,
            "job_type": "batch_analysis",
            "status": "processing",
            "started_at": datetime.utcnow().isoformat(),
            "result_data": {
                "tile_ids": request.tile_ids,
                "analysis_type": request.analysis_type or "health"
            }
        }
        
        batch_record = await supabase_service.create_analysis_job(batch_data)
        
        if not batch_record:
            raise HTTPException(
                status_code=500,
                detail="Failed to create batch analysis job"
            )
        
        # Trigger batch analysis in background
        background_tasks.add_task(
            process_batch_analysis,
            batch_id=batch_id,
            tile_ids=request.tile_ids,
            analysis_type=request.analysis_type or "health",
            user_id=user_id
        )
        
        return {
            "success": True,
            "batch_id": batch_id,
            "total_tiles": len(request.tile_ids),
            "status": "processing",
            "message": f"Batch analysis started for {len(request.tile_ids)} tiles"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Batch analysis error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Batch analysis failed: {str(e)}"
        )


@router.get("/batch/{batch_id}")
async def get_batch_status(
    batch_id: str,
    user_id: str = Depends(get_current_user)
):
    """
    Get batch analysis status
    """
    try:
        batch_job = await supabase_service.get_analysis_job(batch_id)
        if not batch_job:
            raise HTTPException(
                status_code=404,
                detail="Batch job not found"
            )
        
        # Get individual tile statuses
        tile_ids = batch_job["result_data"].get("tile_ids", [])
        tiles = []
        completed_count = 0
        failed_count = 0
        processing_count = 0
        
        for tile_id in tile_ids:
            tile = await supabase_service.get_tile(tile_id)
            if tile:
                tiles.append({
                    "tile_id": tile_id,
                    "tile_name": tile["tile_name"],
                    "status": tile["analysis_status"],
                    "health_score": tile.get("health_score"),
                    "analysis_completed_at": tile.get("analysis_completed_at"),
                    "analysis_error": tile.get("analysis_error")
                })
                
                if tile["analysis_status"] == "completed":
                    completed_count += 1
                elif tile["analysis_status"] == "failed":
                    failed_count += 1
                elif tile["analysis_status"] == "processing":
                    processing_count += 1
        
        return {
            "success": True,
            "batch_id": batch_id,
            "status": batch_job["status"],
            "started_at": batch_job.get("started_at"),
            "completed_at": batch_job.get("completed_at"),
            "total_tiles": len(tile_ids),
            "completed_tiles": completed_count,
            "failed_tiles": failed_count,
            "processing_tiles": processing_count,
            "tiles": tiles
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Batch status error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Batch status check failed: {str(e)}"
        )


@router.post("/reanalyze/{tile_id}")
async def reanalyze_tile(
    tile_id: str,
    analysis_type: Optional[str] = "health",
    user_id: str = Depends(get_current_user)
):
    """
    Re-analyze a tile with updated parameters
    """
    try:
        # Verify tile ownership
        tile = await supabase_service.get_tile(tile_id)
        if not tile:
            raise HTTPException(
                status_code=404,
                detail="Tile not found"
            )
        
        if tile["client_user_id"] != user_id:
            raise HTTPException(
                status_code=403,
                detail="Access denied"
            )
        
        # Update tile status
        await supabase_service.update_tile(
            tile_id=tile_id,
            updates={
                "analysis_status": "processing",
                "analysis_started_at": datetime.utcnow().isoformat(),
                "analysis_error": None
            }
        )
        
        # Trigger re-analysis
        analysis_result = await ml_service.analyze_tile(
            tile_id=tile_id,
            image_url=tile["cloudflare_url"],
            analysis_type=analysis_type
        )
        
        if not analysis_result.success:
            await supabase_service.update_tile(
                tile_id=tile_id,
                updates={
                    "analysis_status": "failed",
                    "analysis_error": analysis_result.error
                }
            )
            raise HTTPException(
                status_code=500,
                detail=f"Re-analysis failed: {analysis_result.error}"
            )
        
        # Update with new results
        await supabase_service.update_tile(
            tile_id=tile_id,
            updates={
                "analysis_status": "completed",
                "analysis_completed_at": datetime.utcnow().isoformat(),
                "health_score": analysis_result.data.get("health_score"),
                "class_breakdown": analysis_result.data.get("class_breakdown", {}),
                "overlay_cloudflare_url": analysis_result.data.get("overlay_url")
            }
        )
        
        return {
            "success": True,
            "tile_id": tile_id,
            "analysis_id": analysis_result.analysis_id,
            "health_score": analysis_result.data.get("health_score"),
            "message": "Re-analysis completed successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Re-analysis error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Re-analysis failed: {str(e)}"
        )


@router.delete("/job/{job_id}")
async def cancel_analysis_job(
    job_id: str,
    user_id: str = Depends(get_current_user)
):
    """
    Cancel an ongoing analysis job
    """
    try:
        job = await supabase_service.get_analysis_job(job_id)
        if not job:
            raise HTTPException(
                status_code=404,
                detail="Job not found"
            )
        
        # Verify user access
        if job.get("tile_id"):
            tile = await supabase_service.get_tile(job["tile_id"])
            if not tile or tile["client_user_id"] != user_id:
                raise HTTPException(
                    status_code=403,
                    detail="Access denied"
                )
        
        if job["status"] not in ["pending", "processing"]:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot cancel job in {job['status']} status"
            )
        
        # Cancel with ML service
        cancel_result = await ml_service.cancel_job(job["job_id"])
        
        if cancel_result.success:
            # Update job status
            await supabase_service.update_analysis_job(
                job_id=job_id,
                updates={
                    "status": "cancelled",
                    "updated_at": datetime.utcnow().isoformat()
                }
            )
            
            # Update associated tile if exists
            if job.get("tile_id"):
                await supabase_service.update_tile(
                    tile_id=job["tile_id"],
                    updates={
                        "analysis_status": "cancelled"
                    }
                )
        
        return {
            "success": cancel_result.success,
            "message": "Job cancelled successfully" if cancel_result.success else f"Failed to cancel job: {cancel_result.error}"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Job cancellation error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Job cancellation failed: {str(e)}"
        )


# Background task function
async def process_batch_analysis(batch_id: str, tile_ids: List[str], analysis_type: str, user_id: str):
    """
    Background task to process batch analysis
    """
    try:
        completed_count = 0
        failed_count = 0
        
        for tile_id in tile_ids:
            try:
                tile = await supabase_service.get_tile(tile_id)
                if not tile:
                    failed_count += 1
                    continue
                
                # Update tile status
                await supabase_service.update_tile(
                    tile_id=tile_id,
                    updates={
                        "analysis_status": "processing",
                        "analysis_started_at": datetime.utcnow().isoformat()
                    }
                )
                
                # Trigger analysis
                analysis_result = await ml_service.analyze_tile(
                    tile_id=tile_id,
                    image_url=tile["cloudflare_url"],
                    analysis_type=analysis_type
                )
                
                if analysis_result.success:
                    await supabase_service.update_tile(
                        tile_id=tile_id,
                        updates={
                            "analysis_status": "completed",
                            "analysis_completed_at": datetime.utcnow().isoformat(),
                            "health_score": analysis_result.data.get("health_score"),
                            "class_breakdown": analysis_result.data.get("class_breakdown", {}),
                            "overlay_cloudflare_url": analysis_result.data.get("overlay_url")
                        }
                    )
                    completed_count += 1
                else:
                    await supabase_service.update_tile(
                        tile_id=tile_id,
                        updates={
                            "analysis_status": "failed",
                            "analysis_error": analysis_result.error
                        }
                    )
                    failed_count += 1
                    
            except Exception as e:
                logger.error(f"Error in batch analysis for tile {tile_id}: {str(e)}")
                failed_count += 1
        
        # Update batch job status
        await supabase_service.update_analysis_job(
            batch_id=batch_id,
            updates={
                "status": "completed",
                "completed_at": datetime.utcnow().isoformat(),
                "result_data": {
                    "tile_ids": tile_ids,
                    "analysis_type": analysis_type,
                    "completed_count": completed_count,
                    "failed_count": failed_count
                }
            }
        )
        
    except Exception as e:
        logger.error(f"Batch analysis background task error: {str(e)}")
        await supabase_service.update_analysis_job(
            batch_id=batch_id,
            updates={
                "status": "failed",
                "error_message": str(e)
            }
        )
