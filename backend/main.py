from fastapi import FastAPI, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from sqlalchemy import text
from fastapi.middleware.cors import CORSMiddleware

from database import base, SessionLocal, engine, get_db
from auth.auth_router import router
from starlette.middleware.sessions import SessionMiddleware
from auth.auth_dependency import get_current_user
import os
from dotenv import load_dotenv

from model import Users, Patients, Scan_Logs

load_dotenv()

print(base.metadata.tables.keys())

base.metadata.create_all(bind=engine)


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
    return db.query(Patients).filter(Patients.user_id == current_user.id).all()

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
    db.add(Patients(
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
    ))
    db.commit()
    return {"message": "patients added to db"}

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
    
    db.delete(this_)
    db.commit()
    return {"message": "patient deleted"}

@app.delete("/patients")
def nuke_patients(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    this_ = db.query(Patients).all()
    if not this_:
        raise HTTPException(status_code=404, detail="No patients")
    
    db.query(Patients).delete()
    db.execute(text("ALTER SEQUENCE patients_id_seq RESTART WITH 1"))
    db.commit()
    return {"message": "patients nuked"}

# History Logs ========================================================================================================================================================
@app.get("/histories")
def get_all_logs(current_user=Depends(get_current_user)):
    return {"message": f"Return all histories for user id {current_user['id']}"}

@app.get("/histories/{history_id}")
def get_history(history_id: int, current_user=Depends(get_current_user)):
    return {"message": f"Return history {history_id} if belongs to user id {current_user['id']}"}

@app.get("/histories/patient/{patient_id}")
def get_patient_histories(patient_id: int, current_user=Depends(get_current_user)):
    return {"message": f"Return all histories for patient id {patient_id} of user id {current_user['id']}"}

@app.post("/histories/upload")
def upload_scan(current_user=Depends(get_current_user)):
    return {"message": f"Upload scan into db"}

# admin authority (delete later when finished)
@app.delete("/histories")
def nuke_scan(current_user=Depends(get_current_user)):
    return {"message": f"Nuke history db"}

# Reports load process ============================================================================
@app.post("/reports/generate/{scan_id}")
def generate_report(scan_id: int, current_user=Depends(get_current_user)):
    return {"message": f"Generate report for scan patient {scan_id} of user {current_user['id']}"}