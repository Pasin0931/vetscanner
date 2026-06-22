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


def delete_image(public_id: str):
    return cloudinary.uploader.destroy(public_id)