from fastapi import APIRouter
from fastapi import File
from fastapi import UploadFile

from cloudinary_api.service import (
    delete_image,
    upload_image,
)

router = APIRouter(
    prefix="/upload",
    tags=["Upload"]
)


@router.post("/")
async def upload(file: UploadFile = File(...)):
    result = upload_image(file.file)

    return {
        "success": True,
        "data": result
    }


@router.delete("/{public_id}")
async def remove(public_id: str):
    result = delete_image(public_id)

    return {
        "success": True,
        "data": result
    }