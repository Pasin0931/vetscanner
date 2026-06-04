from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

from database import base, SessionLocal, engine
import model
from auth.auth_router import router

print(base.metadata.tables.keys())

base.metadata.create_all(bind=engine)


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_current_user():
    return {"id": 1}

# Auth ========================================================================================================================================================
app.include_router(
    router,
    prefix="/auth",
    tags=["Auth"]
)
@app.post("/auth/login")
def user_login():
    return {"message": "login"}

@app.post("/auth/register")
def user_registration():
    return {"message": "register"}

@app.post("/auth/logout")
def user_logout():
    return {"message": "logout"}

# admin authority (delete later when finished)
@app.delete("/auth/login")
def nuke_users():
    return {"message": "user nuked"}

# Patients ========================================================================================================================================================
@app.get("/patients")
def get_all_patients(current_user=Depends(get_current_user)):
    return {"message": f"Return all patients for user id {current_user['id']}"}

@app.get("/patients/{patient_id}")
def get_patient(patient_id: int, current_user=Depends(get_current_user)):
    return {"message": f"Return patient {patient_id} for user id {current_user['id']}"}

@app.post("/patients")
def create_patient(current_user=Depends(get_current_user)):
    return {"message": f"Create patient for user id {current_user['id']}"}

@app.put("/patients/{patient_id}")
def edit_patient(patient_id: int, current_user=Depends(get_current_user)):
    return {"message": f"Update patient id {patient_id} if belongs to user id {current_user['id']}"}

@app.delete("/patients/{patient_id}")
def delete_patient(patient_id: int, current_user=Depends(get_current_user)):
    return {"message": f"Delete patient id {patient_id} from user id {current_user['id']}"}

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