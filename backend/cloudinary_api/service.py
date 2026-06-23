import io
import cloudinary.uploader


def upload_image(file):
    result = cloudinary.uploader.upload(
        file,
        folder="my-project"
    )

    return {
        "url": result["secure_url"],
        "public_id": result["public_id"]
    }


def upload_pdf(file_bytes: bytes, filename: str):
    file_obj = io.BytesIO(file_bytes)

    result = cloudinary.uploader.upload(
        file_obj,
        folder="vetscanner-reports",
        resource_type="raw",
        public_id=filename,
        overwrite=True,
    )

    return {
        "url": result["secure_url"],
        "public_id": result["public_id"]
    }


def delete_image(public_id: str):
    return cloudinary.uploader.destroy(public_id)


def delete_pdf(public_id: str):
    return cloudinary.uploader.destroy(public_id, resource_type="raw")