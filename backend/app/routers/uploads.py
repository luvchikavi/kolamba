"""Uploads router - file upload handling with Cloudinary."""

import logging

import cloudinary
import cloudinary.uploader
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from pydantic import BaseModel
from typing import Optional

from app.config import get_settings
from app.models.user import User
from app.routers.auth import get_current_active_user

settings = get_settings()
router = APIRouter()
logger = logging.getLogger("kolamba.uploads")

# Configure Cloudinary
if settings.cloudinary_cloud_name and settings.cloudinary_api_key and settings.cloudinary_api_secret:
    cloudinary.config(
        cloud_name=settings.cloudinary_cloud_name,
        api_key=settings.cloudinary_api_key,
        api_secret=settings.cloudinary_api_secret,
        secure=True,
    )
    logger.info("Cloudinary configured (cloud=%s)", settings.cloudinary_cloud_name)
elif settings.cloudinary_cloud_name:
    logger.warning("Cloudinary partially configured — missing api_key or api_secret")


class UploadResponse(BaseModel):
    """Response for file upload."""
    url: str
    public_id: str
    resource_type: str


class MultiUploadResponse(BaseModel):
    """Response for multiple file uploads."""
    urls: list[str]
    count: int


def is_cloudinary_configured() -> bool:
    """Check if Cloudinary is properly configured."""
    return bool(
        settings.cloudinary_cloud_name
        and settings.cloudinary_api_key
        and settings.cloudinary_api_secret
    )


@router.post("/image", response_model=UploadResponse)
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
):
    """Upload a single image (profile photo, portfolio image)."""
    if not is_cloudinary_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="File upload service not configured",
        )

    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed: {', '.join(allowed_types)}",
        )

    # Validate file size (max 10MB)
    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File too large. Maximum size is 10MB",
        )

    try:
        # Upload to Cloudinary
        result = cloudinary.uploader.upload(
            contents,
            folder=f"kolamba/artists/{current_user.id}",
            resource_type="image",
            transformation=[
                {"width": 1200, "height": 1200, "crop": "limit"},
                {"quality": "auto:good"},
                {"fetch_format": "auto"},
            ],
        )

        return UploadResponse(
            url=result["secure_url"],
            public_id=result["public_id"],
            resource_type="image",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Upload failed: {str(e)}",
        )


@router.post("/video", response_model=UploadResponse)
async def upload_video(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
):
    """Upload a video clip."""
    if not is_cloudinary_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="File upload service not configured",
        )

    # Validate file type
    allowed_types = ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed: {', '.join(allowed_types)}",
        )

    # Validate file size (max 100MB for videos)
    contents = await file.read()
    if len(contents) > 100 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File too large. Maximum size is 100MB",
        )

    try:
        # Upload to Cloudinary
        result = cloudinary.uploader.upload(
            contents,
            folder=f"kolamba/artists/{current_user.id}/videos",
            resource_type="video",
            eager=[
                {"streaming_profile": "hd", "format": "m3u8"},
            ],
            eager_async=True,
        )

        return UploadResponse(
            url=result["secure_url"],
            public_id=result["public_id"],
            resource_type="video",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Upload failed: {str(e)}",
        )


@router.post("/images", response_model=MultiUploadResponse)
async def upload_multiple_images(
    files: list[UploadFile] = File(...),
    current_user: User = Depends(get_current_active_user),
):
    """Upload multiple images at once (max 10)."""
    if not is_cloudinary_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="File upload service not configured",
        )

    if len(files) > 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 10 files allowed per upload",
        )

    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    urls = []

    for file in files:
        if file.content_type not in allowed_types:
            continue  # Skip invalid files

        contents = await file.read()
        if len(contents) > 10 * 1024 * 1024:
            continue  # Skip files that are too large

        try:
            result = cloudinary.uploader.upload(
                contents,
                folder=f"kolamba/artists/{current_user.id}/portfolio",
                resource_type="image",
                transformation=[
                    {"width": 1200, "height": 1200, "crop": "limit"},
                    {"quality": "auto:good"},
                ],
            )
            urls.append(result["secure_url"])
        except Exception:
            continue  # Skip failed uploads

    return MultiUploadResponse(urls=urls, count=len(urls))


@router.delete("/{public_id:path}")
async def delete_upload(
    public_id: str,
    current_user: User = Depends(get_current_active_user),
):
    """Delete an uploaded file."""
    if not is_cloudinary_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="File upload service not configured",
        )

    # Verify the file belongs to this user (check folder structure)
    if f"kolamba/artists/{current_user.id}" not in public_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own files",
        )

    try:
        result = cloudinary.uploader.destroy(public_id)
        return {"status": "deleted", "result": result}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Delete failed: {str(e)}",
        )


@router.get("/status")
async def upload_status():
    """Check if upload service is configured and available."""
    return {
        "configured": is_cloudinary_configured(),
        "service": "cloudinary" if is_cloudinary_configured() else None,
    }


@router.post("/public/image", response_model=UploadResponse)
async def upload_image_public(
    file: UploadFile = File(...),
):
    """Upload a single image for registration (no auth required).

    This endpoint is used during artist registration before the user has an account.
    Files are stored in a temporary folder and can be associated with the artist later.
    """
    if not is_cloudinary_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="File upload service not configured",
        )

    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed: {', '.join(allowed_types)}",
        )

    # Validate file size (max 10MB)
    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File too large. Maximum size is 10MB",
        )

    try:
        # Upload to Cloudinary in a registration folder
        import uuid
        upload_id = str(uuid.uuid4())[:8]
        result = cloudinary.uploader.upload(
            contents,
            folder=f"kolamba/registration/{upload_id}",
            resource_type="image",
            transformation=[
                {"width": 1200, "height": 1200, "crop": "limit"},
                {"quality": "auto:good"},
                {"fetch_format": "auto"},
            ],
        )

        return UploadResponse(
            url=result["secure_url"],
            public_id=result["public_id"],
            resource_type="image",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Upload failed: {str(e)}",
        )
