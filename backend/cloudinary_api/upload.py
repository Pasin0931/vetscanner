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
async def upload(
    pet_id: int,
    type: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    allowed = {"PROFILE", "MEDICAL_RECORD", "XRAY", "LAB_RESULT"}

    if type not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"type must be one of {', '.join(allowed)}"
        )


    if type == "PROFILE":
        old_profile = (
            db.query(Images)
            .filter(
                Images.pet_id == pet_id,
                Images.type == "PROFILE"
            )
            .first()
        )

        result = upload_image(file.file)

        if old_profile:
            delete_image(old_profile.public_id)

            old_profile.image_url = result["url"]
            old_profile.public_id = result["public_id"]

            db.commit()
            db.refresh(old_profile)

            return {
                "success": True,
                "data": {
                    "id": old_profile.id,
                    "url": old_profile.image_url,
                    "public_id": old_profile.public_id,
                    "pet_id": old_profile.pet_id,
                    "type": old_profile.type,
                }
            }

        img = Images(
            pet_id=pet_id,
            image_url=result["url"],
            public_id=result["public_id"],
            type="PROFILE",
        )

        db.add(img)
        db.commit()
        db.refresh(img)

        return {
            "success": True,
            "data": {
                "id": img.id,
                "url": img.image_url,
                "public_id": img.public_id,
                "pet_id": img.pet_id,
                "type": img.type,
            }
        }

    result = upload_image(file.file)

    img = Images(
        pet_id=pet_id,
        image_url=result["url"],
        public_id=result["public_id"],
        type=type,
    )

    db.add(img)
    db.commit()
    db.refresh(img)

    return {
        "success": True,
        "data": {
            "id": img.id,
            "url": img.image_url,
            "public_id": img.public_id,
            "pet_id": img.pet_id,
            "type": img.type,
        }
    }


@router.delete("/{public_id}")
async def remove(public_id: str):
    result = delete_image(public_id)

    return {
        "success": True,
        "data": result
    }