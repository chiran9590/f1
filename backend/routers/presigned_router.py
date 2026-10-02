"""
Presigned URL Router for HealthMaps Backend
Handles Cloudflare R2 presigned URL generation for uploads and downloads
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi.responses import JSONResponse
from typing import Optional, List, Dict, Any
import uuid
from datetime import datetime, timedelta
import logging

from ..services.cloudflare_service import CloudflareR2Service
from ..services.supabase_service import SupabaseService
from ..models.presigned_models import (
    PresignedUploadRequest,
    PresignedUploadResponse,
    PresignedDownloadRequest,
    PresignedDownloadResponse,
    BatchPresignedRequest,
    BatchPresignedResponse
)
from ..utils.auth_utils import get_current_user
from ..config.settings import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/presigned", tags=["presigned"])

# Initialize services
cloudflare_service = CloudflareR2Service()
supabase_service = SupabaseService()


@router.post("/upload", response_model=PresignedUploadResponse)
async def get_presigned_upload_url(
    request: PresignedUploadRequest,
    user_id: str = Depends(get_current_user)
):
    """
    Generate presigned URL for file upload to Cloudflare R2
    """
    try:
        # Validate file size
        if request.file_size > settings.max_file_size:
            raise HTTPException(
                status_code=400,
                detail=f"File size exceeds maximum limit of {settings.max_file_size} bytes"
            )
        
        # Validate content type
        if request.content_type not in settings.allowed_content_types:
            raise HTTPException(
                status_code=400,
                detail=f"Content type {request.content_type} not allowed"
            )
        
        # Generate unique file key
        timestamp = datetime.now().strftime('%Y/%m/%d')
        file_key = f"tiles/{user_id}/{timestamp}/{uuid.uuid4()}_{request.filename}"
        
        # Get presigned URL
        presigned_url = await cloudflare_service.get_presigned_upload_url(
            file_key=file_key,
            content_type=request.content_type,
            file_size=request.file_size,
            expires_in=request.expires_in or settings.default_presigned_expiry
        )
        
        if not presigned_url.success:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to generate presigned URL: {presigned_url.error}"
            )
        
        # Generate public URL for download
        public_url = cloudflare_service.get_public_url(file_key)
        
        return PresignedUploadResponse(
            success=True,
            upload_url=presigned_url.url,
            file_key=file_key,
            public_url=public_url,
            expires_in=presigned_url.expires_in,
            headers=presigned_url.headers,
            message="Presigned upload URL generated successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Presigned upload URL error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate presigned upload URL: {str(e)}"
        )


@router.post("/download", response_model=PresignedDownloadResponse)
async def get_presigned_download_url(
    request: PresignedDownloadRequest,
    user_id: str = Depends(get_current_user)
):
    """
    Generate presigned URL for file download from Cloudflare R2
    """
    try:
        # Verify user has access to the file
        if request.tile_id:
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
            
            # Extract file key from tile URL
            if request.file_key is None:
                file_key = cloudflare_service.extract_file_key_from_url(tile["cloudflare_url"])
            else:
                file_key = request.file_key
        else:
            # Direct file key access - verify ownership
            file_key = request.file_key
            if not file_key.startswith(f"tiles/{user_id}/"):
                raise HTTPException(
                    status_code=403,
                    detail="Access denied"
                )
        
        if not file_key:
            raise HTTPException(
                status_code=400,
                detail="File key is required"
            )
        
        # Get presigned download URL
        presigned_url = await cloudflare_service.get_presigned_download_url(
            file_key=file_key,
            expires_in=request.expires_in or settings.default_presigned_expiry
        )
        
        if not presigned_url.success:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to generate presigned download URL: {presigned_url.error}"
            )
        
        return PresignedDownloadResponse(
            success=True,
            download_url=presigned_url.url,
            file_key=file_key,
            expires_in=presigned_url.expires_in,
            filename=request.filename,
            message="Presigned download URL generated successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Presigned download URL error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate presigned download URL: {str(e)}"
        )


@router.post("/batch/upload", response_model=BatchPresignedResponse)
async def get_batch_presigned_upload_urls(
    request: BatchPresignedRequest,
    user_id: str = Depends(get_current_user)
):
    """
    Generate multiple presigned upload URLs for batch uploads
    """
    try:
        if len(request.files) > settings.max_batch_size:
            raise HTTPException(
                status_code=400,
                detail=f"Maximum batch size is {settings.max_batch_size} files"
            )
        
        upload_urls = []
        failed_files = []
        
        timestamp = datetime.now().strftime('%Y/%m/%d')
        
        for file_info in request.files:
            try:
                # Validate file
                if file_info.file_size > settings.max_file_size:
                    failed_files.append({
                        "filename": file_info.filename,
                        "error": f"File size exceeds maximum limit of {settings.max_file_size} bytes"
                    })
                    continue
                
                if file_info.content_type not in settings.allowed_content_types:
                    failed_files.append({
                        "filename": file_info.filename,
                        "error": f"Content type {file_info.content_type} not allowed"
                    })
                    continue
                
                # Generate file key and presigned URL
                file_key = f"tiles/{user_id}/{timestamp}/{uuid.uuid4()}_{file_info.filename}"
                
                presigned_result = await cloudflare_service.get_presigned_upload_url(
                    file_key=file_key,
                    content_type=file_info.content_type,
                    file_size=file_info.file_size,
                    expires_in=request.expires_in or settings.default_presigned_expiry
                )
                
                if presigned_result.success:
                    upload_urls.append({
                        "filename": file_info.filename,
                        "file_key": file_key,
                        "upload_url": presigned_result.url,
                        "public_url": cloudflare_service.get_public_url(file_key),
                        "expires_in": presigned_result.expires_in,
                        "headers": presigned_result.headers
                    })
                else:
                    failed_files.append({
                        "filename": file_info.filename,
                        "error": presigned_result.error
                    })
                    
            except Exception as e:
                failed_files.append({
                    "filename": file_info.filename,
                    "error": str(e)
                })
        
        return BatchPresignedResponse(
            success=len(upload_urls) > 0,
            upload_urls=upload_urls,
            failed_files=failed_files,
            total_files=len(request.files),
            successful_uploads=len(upload_urls),
            failed_uploads=len(failed_files),
            message=f"Generated {len(upload_urls)} presigned URLs successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Batch presigned upload URLs error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate batch presigned URLs: {str(e)}"
        )


@router.get("/public/{file_key:path}")
async def get_public_url_info(
    file_key: str,
    user_id: str = Depends(get_current_user)
):
    """
    Get public URL information for a file key
    """
    try:
        # Verify user has access to the file
        if not file_key.startswith(f"tiles/{user_id}/"):
            raise HTTPException(
                status_code=403,
                detail="Access denied"
            )
        
        public_url = cloudflare_service.get_public_url(file_key)
        
        return {
            "success": True,
            "file_key": file_key,
            "public_url": public_url,
            "message": "Public URL retrieved successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Public URL info error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get public URL info: {str(e)}"
        )


@router.delete("/file/{file_key:path}")
async def delete_file(
    file_key: str,
    user_id: str = Depends(get_current_user)
):
    """
    Delete a file from Cloudflare R2
    """
    try:
        # Verify user has access to the file
        if not file_key.startswith(f"tiles/{user_id}/"):
            raise HTTPException(
                status_code=403,
                detail="Access denied"
            )
        
        # Check if file is associated with any tile
        tiles = await supabase_service.get_tiles_by_file_key(file_key)
        if tiles:
            raise HTTPException(
                status_code=400,
                detail="Cannot delete file associated with existing tiles. Delete tiles first."
            )
        
        # Delete from Cloudflare R2
        delete_result = await cloudflare_service.delete_file(file_key)
        
        if not delete_result.success:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to delete file: {delete_result.error}"
            )
        
        return {
            "success": True,
            "file_key": file_key,
            "message": "File deleted successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"File deletion error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete file: {str(e)}"
        )


@router.get("/list")
async def list_user_files(
    prefix: Optional[str] = Query(None, description="File prefix to filter"),
    limit: Optional[int] = Query(100, description="Maximum number of files to return"),
    user_id: str = Depends(get_current_user)
):
    """
    List files for the current user
    """
    try:
        # Default prefix to user's directory
        if prefix is None:
            prefix = f"tiles/{user_id}/"
        elif not prefix.startswith(f"tiles/{user_id}/"):
            prefix = f"tiles/{user_id}/{prefix}"
        
        # List files from Cloudflare R2
        list_result = await cloudflare_service.list_files(
            prefix=prefix,
            limit=limit or 100
        )
        
        if not list_result.success:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to list files: {list_result.error}"
            )
        
        # Get tile associations for files
        file_keys = [file["key"] for file in list_result.files]
        tile_associations = await supabase_service.get_tiles_by_file_keys(file_keys)
        
        # Combine file info with tile info
        files_with_tiles = []
        for file_info in list_result.files:
            file_key = file_info["key"]
            associated_tiles = [tile for tile in tile_associations if tile.get("file_key") == file_key]
            
            files_with_tiles.append({
                **file_info,
                "associated_tiles": len(associated_tiles),
                "tile_names": [tile["tile_name"] for tile in associated_tiles]
            })
        
        return {
            "success": True,
            "files": files_with_tiles,
            "total_files": len(files_with_tiles),
            "prefix": prefix,
            "message": f"Listed {len(files_with_tiles)} files successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"File listing error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to list files: {str(e)}"
        )


@router.post("/verify")
async def verify_file_access(
    file_key: str,
    user_id: str = Depends(get_current_user)
):
    """
    Verify if user has access to a file and get file info
    """
    try:
        # Verify user has access to the file
        if not file_key.startswith(f"tiles/{user_id}/"):
            raise HTTPException(
                status_code=403,
                detail="Access denied"
            )
        
        # Get file info from Cloudflare R2
        file_info = await cloudflare_service.get_file_info(file_key)
        
        if not file_info.success:
            raise HTTPException(
                status_code=404,
                detail=f"File not found: {file_info.error}"
            )
        
        # Check tile associations
        tiles = await supabase_service.get_tiles_by_file_key(file_key)
        
        return {
            "success": True,
            "file_key": file_key,
            "file_info": file_info.data,
            "associated_tiles": len(tiles),
            "tile_names": [tile["tile_name"] for tile in tiles],
            "public_url": cloudflare_service.get_public_url(file_key),
            "message": "File access verified successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"File verification error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to verify file access: {str(e)}"
        )


@router.get("/usage")
async def get_storage_usage(
    user_id: str = Depends(get_current_user)
):
    """
    Get storage usage statistics for the user
    """
    try:
        # Get all user files
        prefix = f"tiles/{user_id}/"
        list_result = await cloudflare_service.list_files(
            prefix=prefix,
            limit=10000  # Large limit to get all files
        )
        
        if not list_result.success:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to list files: {list_result.error}"
            )
        
        # Calculate usage statistics
        total_files = len(list_result.files)
        total_size = sum(file["size"] for file in list_result.files)
        
        # Group by file type
        file_types = {}
        for file in list_result.files:
            content_type = file.get("content_type", "unknown")
            file_types[content_type] = file_types.get(content_type, 0) + file["size"]
        
        # Get tile statistics
        user_tiles = await supabase_service.get_tiles_for_client(user_id)
        analyzed_tiles = len([t for t in user_tiles if t["analysis_status"] == "completed"])
        
        return {
            "success": True,
            "usage": {
                "total_files": total_files,
                "total_size_bytes": total_size,
                "total_size_mb": round(total_size / (1024 * 1024), 2),
                "total_tiles": len(user_tiles),
                "analyzed_tiles": analyzed_tiles,
                "file_types": file_types,
                "storage_limit_mb": settings.user_storage_limit_mb,
                "storage_used_percentage": round((total_size / (1024 * 1024)) / settings.user_storage_limit_mb * 100, 2)
            },
            "message": "Storage usage retrieved successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Storage usage error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get storage usage: {str(e)}"
        )
