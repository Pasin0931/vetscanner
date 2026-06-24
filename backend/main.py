from fastapi import FastAPI, Depends, HTTPException, Request, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import text
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response

from database import base, SessionLocal, engine, get_db
from auth.auth_router import router
from starlette.middleware.sessions import SessionMiddleware
from auth.auth_dependency import get_current_user
import os
from dotenv import load_dotenv

from model import Users, Patients, Scan_Logs, Images

from scan_lib import process_slide, generate_pdf_report
import shutil
import tempfile
import json

from cloudinary_api import config
from cloudinary_api.upload import router as upload_router
from cloudinary_api.service import delete_image, upload_pdf, delete_pdf

load_dotenv()


base.metadata.create_all(bind=engine)

ALLOWed_FILE_TYPE = [".svs", ".tiff", ".tif", ".ndpi"]


app = FastAPI()

app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv("SESSION_SECRET_KEY"),
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router)


# Auth ========================================================================================================================================================
app.include_router(
    router,
    prefix="/auth",
    tags=["Auth"]
)
# @app.post("/auth/login")
# def user_login():
#     return {"message": "login"}

# @app.post("/auth/register")
# def user_registration():
#     return {"message": "register"}

# @app.post("/auth/logout")
# def user_logout():
#     return {"message": "logout"}

# # admin authority (delete later when finished)
# @app.delete("/auth/login")
# def nuke_users():
#     return {"message": "user nuked"}

# Patients ========================================================================================================================================================
@app.get("/patients")
def get_all_patients(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Patients).filter(Patients.user_id == current_user.id).order_by(Patients.id).all()

@app.get("/patients/{patient_id}")
def get_patient(patient_id: int, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    patient = db.query(Patients).filter(
        Patients.id == patient_id,
        Patients.user_id == current_user.id
    ).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient

@app.post("/patients")
def create_patient(name_: str, breed_: str, age_: int, weight_: float, gender_: str, description_: str, species_: str, potrait_: str, status_: str, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    new_patient = Patients(
        name=name_,
        breed=breed_,
        age=age_,
        weight=weight_,
        gender=gender_,
        description=description_,
        species=species_,
        patient_portrait=potrait_,
        status=status_,
        user_id=current_user.id
    )
    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)
    return {"message": "patients added to db", "id": new_patient.id}

@app.put("/patients/{patient_id}")
def edit_patient(name_: str, breed_: str, age_: int, weight_: float, gender_: str, description_: str, species_: str, potrait_: str, status_: str, patient_id: int, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    this_ = db.query(Patients).filter(Patients.user_id == current_user.id, Patients.id == patient_id).first()
    if not this_:
        raise HTTPException(status_code=404, detail="Patient not found")
    this_.name = name_
    this_.breed = breed_
    this_.age = age_
    this_.weight = weight_
    this_.gender = gender_
    this_.description = description_
    this_.species = species_
    this_.patient_portrait = potrait_
    this_.status = status_
    db.commit()
    return {"message": "patient updated"}

@app.delete("/patients/{patient_id}")
def delete_patient(patient_id: int, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    this_ = db.query(Patients).filter(Patients.user_id == current_user.id, Patients.id == patient_id).first()
    if not this_:
        raise HTTPException(status_code=404, detail="Patient not found")

    images = db.query(Images).filter(Images.pet_id == patient_id).all()
    for img in images:
        delete_image(img.public_id)
        db.delete(img)

    db.query(Scan_Logs).filter(Scan_Logs.patient_id == patient_id).delete()

    db.delete(this_)
    db.commit()
    return {"message": "patient deleted"}

@app.delete("/patients")
def nuke_patients(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    this_ = db.query(Patients).filter(Patients.user_id == current_user.id).all()
    if not this_:
        raise HTTPException(status_code=404, detail="No patients")

    patient_ids = [i.id for i in this_]

    images = db.query(Images).filter(Images.pet_id.in_(patient_ids)).all()
    for img in images:
        delete_image(img.public_id)

    db.query(Images).filter(Images.pet_id.in_(patient_ids)).delete(synchronize_session=False)
    db.query(Scan_Logs).filter(Scan_Logs.patient_id.in_(patient_ids)).delete(synchronize_session=False)
    db.query(Patients).filter(Patients.user_id == current_user.id).delete(synchronize_session=False)
    
    db.execute(text("ALTER SEQUENCE patients_id_seq RESTART WITH 1"))
    db.commit()
    return {"message": "patients nuked"}

# History Logs ========================================================================================================================================================
@app.get("/histories")
def get_all_logs(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    logs = (
        db.query(Scan_Logs)
        .join(Patients, Scan_Logs.patient_id == Patients.id)
        .filter(Patients.user_id == current_user.id)
        .all()
    )

    return [{"id": log.id,
             "patient_id": log.patient_id,
             "patient": log.patient.name,
             "result": json.loads(log.result),
             "pdf_report": log.pdf_report,
             "created_at": log.created_at } for log in logs]

@app.get("/histories/{history_id}")
def get_history(history_id: int, current_user=Depends(get_current_user)):
    return {"message": f"Return history {history_id} if belongs to user id {current_user['id']}"}

@app.get("/histories/patient/{patient_id}")
def get_patient_histories(patient_id: int, current_user=Depends(get_current_user)):
    return {"message": f"Return all histories for patient id {patient_id} of user id {current_user['id']}"}

@app.post("/histories/upload")
def upload_scan(current_user=Depends(get_current_user)):
    return {"message": f"Upload scan into db"}

@app.delete("/histories/{history_id}")
def delete_history(history_id: int, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    log = (
        db.query(Scan_Logs)
        .join(Patients, Scan_Logs.patient_id == Patients.id)
        .filter(Patients.user_id == current_user.id, Scan_Logs.id == history_id)
        .first()
    )

    if not log:
        raise HTTPException(status_code=404, detail="Current history not found")

    # Cloudinary Deletion        
    if log.pdf_report:
        try: 
            public_id = log.pdf_report.split("/upload/")[1].split("/", 1)[1]
            public_id = "vetscanner-reports/" + public_id.rsplit(".", 1)[0]
            delete_pdf(public_id)
        except:
            raise HTTPException(status_code=404, detail="Failed to retrieve files from cloudinary")                    

    # Log Deletion
    db.delete(log)
    db.commit()

    return {"message": "patient deleted"}

@app.delete("/histories")
def nuke_history(current_user=Depends(get_current_user), db: Session = Depends(get_db)):    
    logs = (
        db.query(Scan_Logs)
        .join(Patients, Scan_Logs.patient_id == Patients.id)
        .filter(Patients.user_id == current_user.id)
        .all()
    )

    if not logs:
        raise HTTPException(status_code=404, detail="No past history")
    
    # Cloudinary Deletion    
    for i in logs:
        if i.pdf_report:
            try: 
                public_id = i.pdf_report.split("/upload/")[1].split("/", 1)[1]
                public_id = "vetscanner-reports/" + public_id.rsplit(".", 1)[0]
                delete_pdf(public_id)
            except:
                raise HTTPException(status_code=404, detail="Failed to retrieve files from cloudinary")                    

    # Logs Deletion
    log_ids = [i.id for i in logs]
    db.query(Scan_Logs).filter( Scan_Logs.id.in_(log_ids)).delete(synchronize_session=False)
    db.commit()

    return {"message": f"Nuke history logs db"}

# Reports load process ============================================================================
@app.post("/scan/model")
async def scan_slide(file: UploadFile = File(...), patient_id: int = Form(...), current_user=Depends(get_current_user), db: Session = Depends(get_db)):

    patient = db.query(Patients).filter(Patients.id == patient_id, Patients.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found !")
 
    # validate file type
    i, ext = os.path.splitext(file.filename.lower())
    if ext not in ALLOWed_FILE_TYPE:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Allowed: {' '.join(ALLOWed_FILE_TYPE)}"
        )
 
    # crash mid-scan still leaves a record rather than all gone
    scan_log = Scan_Logs(
        patient_id=patient_id,
        xray_image="",  # filled in with the annotated thumbnail after processing
        status="processing",
        model_version="UNet_resnet18_512_2 + efficientnet_1024_0",
    )
    db.add(scan_log)
    db.commit()
    db.refresh(scan_log)
 
    # Stream the upload to a temp file on disk rather than buffering in memory
    tmp_dir = tempfile.gettempdir()
    tmp_path = os.path.join(tmp_dir, f"scan_{scan_log.id}{ext}")
 
    try:
        with open(tmp_path, "wb") as out_file:
            shutil.copyfileobj(file.file, out_file)
 
        # Run the actual segmentation + classification pipeline
        # This is synchronous and will block for some minutes on large slides
        result = process_slide(tmp_path)
 
        # report break down
        scan_log.xray_image = result["thumbnail"]  # annotated thumbnail, base64
        scan_log.result = json.dumps({
            "tumor_detected": result["tumor_detected"],
            "diagnosis": result["diagnosis"],
            "tumor_tile_count": result["tumor_tile_count"],
            # "vote_breakdown": result.get("vote_breakdown"),
            "message": result["message"],
        })
        scan_log.confidence_score = result["confidence_score"]
        scan_log.status = "completed"
        db.commit()
 
        # Build pdf file
        # Its never written to disk or saved in the database, ( IMPLEMENT )
        pdf_bytes = generate_pdf_report(result, patient.name, scan_log.id)
 
        filename = f"scan_report_{patient.name}_{scan_log.id}"
 
        pdf_upload = upload_pdf(pdf_bytes, filename)
        scan_log.pdf_report = pdf_upload["url"]
        db.commit()
 
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}.pdf"'
            }
        )
 
    except Exception as e:
        scan_log.status = "failed"
        db.commit()
        raise HTTPException(status_code=500, detail=f"Scan processing failed: {str(e)}")
 
    finally:
        # discard .svs file after finished
        if os.path.exists(tmp_path):
            os.remove(tmp_path)