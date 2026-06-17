from fastapi import APIRouter
from fastapi import File
from fastapi import UploadFile, Depends, HTTPException
from sqlalchemy.orm import Session

from cloudinary_api.service import (
    delete_image,
    upload_image,
)
from database import get_db
from model import Images

router = APIRouter(
    prefix="/upload",
    tags=["Upload"]
)


@router.post("/")
async def upload(pet_id: int, type: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    allowed = {"PROFILE", "MEDICAL_RECORD", "XRAY", "LAB_RESULT"}
    if type not in allowed:
        raise HTTPException(status_code=400, detail=f"type must be one of {', '.join(allowed)}")

    result = upload_image(file.file)

    img = Images(
        image_url=result.get("url"),
        pet_id=pet_id,
        public_id=result.get("public_id"),
        type=type,
    )
    db.add(img)
    db.commit()
    db.refresh(img)

    return {
        "success": True,
        "data": {
            "url": result.get("url"),
            "public_id": result.get("public_id"),
            "id": img.id,
            "type": img.type,
            "pet_id": img.pet_id,
        }
    }


@router.delete("/{public_id}")
async def remove(public_id: str):
    result = delete_image(public_id)

    return {
        "success": True,
        "data": result
    }