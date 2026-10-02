"""
Upload Router for HealthMaps Backend
Handles file uploads, Cloudflare R2 integration, and ML analysis triggering
"""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends, BackgroundTasks
from fastapi.responses import JSONResponse
from typing import Optional, List, Dict, Any
import uuid
import json
import asyncio
from datetime import datetime
import logging

from ..services.cloudflare_service import CloudflareR2Service
from ..services.ml_analysis_service import MLAnalysisService
from ..services.supabase_service import SupabaseService
from ..models.upload_models import (
    UploadResponse,
    AnalysisRequest,
    AnalysisResponse,
    BatchUploadRequest,
    BatchUploadResponse
)
from ..utils.file_utils import validate_file, get_file_hash
from ..utils.auth_utils import get_current_user
from ..config.settings import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/upload", tags=["upload"])

# Initialize services
cloudflare_service = CloudflareR2Service()
ml_service = MLAnalysisService()
supabase_service = SupabaseService()


@router.post("/single", response_model=UploadResponse)
async def upload_single_file(
    file: UploadFile = File(...),
    club_id: Optional[str] = Form(None),
    tile_name: Optional[str] = Form(None),
    tile_bounds: Optional[str] = Form(None),
    metadata: Optional[str] = Form(None),
    user_id: str = Depends(get_current_user),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    """
    Upload a single file and trigger analysis
    """
    try:
        # Validate file
        validation_result = validate_file(file)
        if not validation_result.is_valid:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file: {', '.join(validation_result.errors)}"
            )
        
        # Generate unique file key
        file_hash = await get_file_hash(file)
        file_key = f"tiles/{user_id}/{datetime.now().strftime('%Y/%m/%d')}/{file_hash}_{file.filename}"
        
        # Get presigned URL from Cloudflare R2
        presigned_url = await cloudflare_service.get_presigned_upload_url(
            file_key=file_key,
            content_type=file.content_type,
            file_size=file.size
        )
        
        # Upload file to Cloudflare R2
        upload_result = await cloudflare_service.upload_file(
            file=file,
            file_key=file_key,
            presigned_url=presigned_url
        )
        
        if not upload_result.success:
            raise HTTPException(
                status_code=500,
                detail=f"Upload failed: {upload_result.error}"
            )
        
        # Parse metadata
        tile_metadata = {}
        if metadata:
            try:
                tile_metadata = json.loads(metadata)
            except json.JSONDecodeError:
                logger.warning(f"Invalid metadata JSON for file {file.filename}")
        
        # Parse tile bounds
        bounds = None
        if tile_bounds:
            try:
                bounds = json.loads(tile_bounds)
                if not isinstance(bounds, list) or len(bounds) != 4:
                    raise ValueError("Bounds must be a list of 4 coordinates")
            except (json.JSONDecodeError, ValueError) as e:
                logger.warning(f"Invalid tile bounds: {e}")
        
        # Create tile record in Supabase
        tile_data = {
            "id": str(uuid.uuid4()),
            "club_id": club_id or "default",
            "client_user_id": user_id,
            "tile_name": tile_name or file.filename,
            "tile_bounds": bounds,
            "cloudflare_url": upload_result.public_url,
            "metadata": tile_metadata,
            "analysis_status": "pending",
            "created_at": datetime.utcnow().isoformat()
        }
        
        tile_record = await supabase_service.create_tile(tile_data)
        
        if not tile_record:
            # Rollback: delete from Cloudflare R2
            await cloudflare_service.delete_file(file_key)
            raise HTTPException(
                status_code=500,
                detail="Failed to create tile record in database"
            )
        
        # Trigger ML analysis in background
        background_tasks.add_task(
            trigger_ml_analysis,
            tile_id=tile_record["id"],
            file_key=file_key,
            user_id=user_id
        )
        
        return UploadResponse(
            success=True,
            tile_id=tile_record["id"],
            file_url=upload_result.public_url,
            analysis_status="pending",
            message="File uploaded successfully. Analysis started."
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Upload error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Upload failed: {str(e)}"
        )


@router.post("/batch", response_model=BatchUploadResponse)
async def upload_batch_files(
    files: List[UploadFile] = File(...),
    club_id: Optional[str] = Form(None),
    session_name: Optional[str] = Form(None),
    metadata: Optional[str] = Form(None),
    user_id: str = Depends(get_current_user),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    """
    Upload multiple files in a batch
    """
    try:
        if len(files) > settings.max_batch_size:
            raise HTTPException(
                status_code=400,
                detail=f"Maximum batch size is {settings.max_batch_size} files"
            )
        
        # Create upload session
        session_id = str(uuid.uuid4())
        session_data = {
            "id": session_id,
            "user_id": user_id,
            "club_id": club_id or "default",
            "session_name": session_name or f"Batch upload {datetime.now().strftime('%Y-%m-%d %H:%M')}",
            "total_files": len(files),
            "uploaded_files": 0,
            "status": "pending",
            "metadata": json.loads(metadata) if metadata else {},
            "created_at": datetime.utcnow().isoformat()
        }
        
        session_record = await supabase_service.create_upload_session(session_data)
        
        if not session_record:
            raise HTTPException(
                status_code=500,
                detail="Failed to create upload session"
            )
        
        # Process files
        upload_results = []
        successful_uploads = 0
        
        for i, file in enumerate(files):
            try:
                # Validate file
                validation_result = validate_file(file)
                if not validation_result.is_valid:
                    upload_results.append({
                        "filename": file.filename,
                        "success": False,
                        "error": f"Invalid file: {', '.join(validation_result.errors)}"
                    })
                    continue
                
                # Generate unique file key
                file_hash = await get_file_hash(file)
                file_key = f"tiles/{user_id}/{datetime.now().strftime('%Y/%m/%d')}/{file_hash}_{file.filename}"
                
                # Get presigned URL and upload
                presigned_url = await cloudflare_service.get_presigned_upload_url(
                    file_key=file_key,
                    content_type=file.content_type,
                    file_size=file.size
                )
                
                upload_result = await cloudflare_service.upload_file(
                    file=file,
                    file_key=file_key,
                    presigned_url=presigned_url
                )
                
                if not upload_result.success:
                    upload_results.append({
                        "filename": file.filename,
                        "success": False,
                        "error": upload_result.error
                    })
                    continue
                
                # Create tile record
                tile_data = {
                    "id": str(uuid.uuid4()),
                    "club_id": club_id or "default",
                    "client_user_id": user_id,
                    "tile_name": file.filename,
                    "cloudflare_url": upload_result.public_url,
                    "upload_session_id": session_id,
                    "analysis_status": "pending",
                    "created_at": datetime.utcnow().isoformat()
                }
                
                tile_record = await supabase_service.create_tile(tile_data)
                
                if tile_record:
                    successful_uploads += 1
                    upload_results.append({
                        "filename": file.filename,
                        "success": True,
                        "tile_id": tile_record["id"],
                        "file_url": upload_result.public_url
                    })
                    
                    # Trigger ML analysis
                    background_tasks.add_task(
                        trigger_ml_analysis,
                        tile_id=tile_record["id"],
                        file_key=file_key,
                        user_id=user_id
                    )
                else:
                    # Rollback: delete from Cloudflare R2
                    await cloudflare_service.delete_file(file_key)
                    upload_results.append({
                        "filename": file.filename,
                        "success": False,
                        "error": "Failed to create tile record"
                    })
                    
            except Exception as e:
                logger.error(f"Error processing file {file.filename}: {str(e)}")
                upload_results.append({
                    "filename": file.filename,
                    "success": False,
                    "error": str(e)
                })
        
        # Update session
        await supabase_service.update_upload_session(
            session_id=session_id,
            updates={
                "uploaded_files": successful_uploads,
                "status": "completed" if successful_uploads == len(files) else "partial"
            }
        )
        
        return BatchUploadResponse(
            success=True,
            session_id=session_id,
            total_files=len(files),
            successful_uploads=successful_uploads,
            failed_uploads=len(files) - successful_uploads,
            results=upload_results,
            message=f"Batch upload completed: {successful_uploads}/{len(files)} files uploaded successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Batch upload error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Batch upload failed: {str(e)}"
        )


@router.post("/analyze", response_model=AnalysisResponse)
async def trigger_analysis(
    request: AnalysisRequest,
    user_id: str = Depends(get_current_user)
):
    """
    Trigger ML analysis for an existing tile
    """
    try:
        # Verify tile ownership
        tile = await supabase_service.get_tile(request.tile_id)
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
            tile_id=request.tile_id,
            updates={
                "analysis_status": "processing",
                "analysis_started_at": datetime.utcnow().isoformat()
            }
        )
        
        # Trigger ML analysis
        analysis_result = await ml_service.analyze_tile(
            tile_id=request.tile_id,
            image_url=tile["cloudflare_url"],
            analysis_type=request.analysis_type or "health"
        )
        
        if not analysis_result.success:
            # Update tile status to failed
            await supabase_service.update_tile(
                tile_id=request.tile_id,
                updates={
                    "analysis_status": "failed",
                    "analysis_error": analysis_result.error
                }
            )
            raise HTTPException(
                status_code=500,
                detail=f"Analysis failed: {analysis_result.error}"
            )
        
        # Update tile with results
        await supabase_service.update_tile(
            tile_id=request.tile_id,
            updates={
                "analysis_status": "completed",
                "analysis_completed_at": datetime.utcnow().isoformat(),
                "health_score": analysis_result.data.get("health_score"),
                "class_breakdown": analysis_result.data.get("class_breakdown", {}),
                "overlay_cloudflare_url": analysis_result.data.get("overlay_url")
            }
        )
        
        return AnalysisResponse(
            success=True,
            tile_id=request.tile_id,
            analysis_id=analysis_result.analysis_id,
            health_score=analysis_result.data.get("health_score"),
            class_breakdown=analysis_result.data.get("class_breakdown", {}),
            overlay_url=analysis_result.data.get("overlay_url"),
            status="completed",
            message="Analysis completed successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Analysis trigger error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Analysis trigger failed: {str(e)}"
        )


@router.get("/status/{tile_id}")
async def get_analysis_status(
    tile_id: str,
    user_id: str = Depends(get_current_user)
):
    """
    Get analysis status for a tile
    """
    try:
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
        
        return {
            "success": True,
            "tile_id": tile_id,
            "analysis_status": tile["analysis_status"],
            "health_score": tile.get("health_score"),
            "analysis_started_at": tile.get("analysis_started_at"),
            "analysis_completed_at": tile.get("analysis_completed_at"),
            "analysis_error": tile.get("analysis_error")
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Status check error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Status check failed: {str(e)}"
        )


@router.get("/session/{session_id}")
async def get_upload_session_status(
    session_id: str,
    user_id: str = Depends(get_current_user)
):
    """
    Get upload session status
    """
    try:
        session = await supabase_service.get_upload_session(session_id)
        if not session:
            raise HTTPException(
                status_code=404,
                detail="Session not found"
            )
        
        if session["user_id"] != user_id:
            raise HTTPException(
                status_code=403,
                detail="Access denied"
            )
        
        # Get session tiles
        tiles = await supabase_service.get_tiles_for_session(session_id)
        
        return {
            "success": True,
            "session": session,
            "tiles": tiles,
            "total_tiles": len(tiles),
            "completed_tiles": len([t for t in tiles if t["analysis_status"] == "completed"]),
            "processing_tiles": len([t for t in tiles if t["analysis_status"] == "processing"]),
            "failed_tiles": len([t for t in tiles if t["analysis_status"] == "failed"])
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Session status error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Session status check failed: {str(e)}"
        )


@router.delete("/tile/{tile_id}")
async def delete_tile(
    tile_id: str,
    user_id: str = Depends(get_current_user)
):
    """
    Delete a tile and its associated files
    """
    try:
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
        
        # Delete from Cloudflare R2
        if tile.get("cloudflare_url"):
            file_key = cloudflare_service.extract_file_key_from_url(tile["cloudflare_url"])
            if file_key:
                await cloudflare_service.delete_file(file_key)
        
        # Delete overlay if exists
        if tile.get("overlay_cloudflare_url"):
            overlay_key = cloudflare_service.extract_file_key_from_url(tile["overlay_cloudflare_url"])
            if overlay_key:
                await cloudflare_service.delete_file(overlay_key)
        
        # Delete from database
        await supabase_service.delete_tile(tile_id)
        
        return {
            "success": True,
            "message": "Tile deleted successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Tile deletion error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Tile deletion failed: {str(e)}"
        )


# Background task function
async def trigger_ml_analysis(tile_id: str, file_key: str, user_id: str):
    """
    Background task to trigger ML analysis
    """
    try:
        # Get tile details
        tile = await supabase_service.get_tile(tile_id)
        if not tile:
            logger.error(f"Tile {tile_id} not found for analysis")
            return
        
        # Update status to processing
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
            analysis_type="health"
        )
        
        if analysis_result.success:
            # Update with results
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
        else:
            # Update with error
            await supabase_service.update_tile(
                tile_id=tile_id,
                updates={
                    "analysis_status": "failed",
                    "analysis_error": analysis_result.error
                }
            )
            
    except Exception as e:
        logger.error(f"Background analysis error for tile {tile_id}: {str(e)}")
        await supabase_service.update_tile(
            tile_id=tile_id,
            updates={
                "analysis_status": "failed",
                "analysis_error": str(e)
            }
        )
