from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import base
from pydantic import BaseModel

class Users(base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, nullable=False, unique=True)
    password = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    name = Column(String)
    provider = Column(String)
    provider_id = Column(String)
    patients = relationship("Patients", back_populates="patient_of")

class Patients(base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    breed = Column(String, nullable=True)
    age = Column(Integer, nullable=True)
    weight = Column(Float, nullable=True)
    gender = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    species = Column(String, nullable=False)
    patient_portrait = Column(String, nullable=True)
    status = Column(String, nullable=True)         
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    patient_of = relationship("Users", back_populates="patients")
    scan_logs = relationship("Scan_Logs", back_populates="patient")

class Scan_Logs(base):
    __tablename__ = "scan_logs"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    xray_image = Column(String, nullable=False)
    result = Column(Text, nullable=True)                           # Scan result
    confidence_score = Column(Float, nullable=True)
    model_version = Column(String, nullable=True)                  # such as yolov8-v1.0
    status = Column(String, nullable=False, default="processing")  # completed / failed
    pdf_report = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    patient = relationship("Patients", back_populates="scan_logs")


class Images(base):
    __tablename__ = "images"

    id = Column(Integer, primary_key=True, index=True)
    image_url = Column(String, nullable=False)
    pet_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    public_id = Column(String, nullable=False)
    type = Column(String, nullable=False)  # PROFILE | MEDICAL_RECORD | XRAY | LAB_RESULT
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

class UserSession(base):
    __tablename__ = "sessions"

    id = Column(String, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    expires_at = Column(DateTime)

class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str

class LoginRequest(BaseModel):
    email: str
    password: str
    remember_me: bool = False