from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db

router = APIRouter(prefix="/system", tags=["System & Utilities"])

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "SmartStay Dynamic Hotel Pricing Engine",
        "engine_type": "Rule-Based Dynamic Pricing (No ML)",
        "version": "1.0.0"
    }

@router.get("/demo-credentials")
def get_credentials():
    return {
        "admin": {
            "email": "admin@smartstay.com",
            "password": "admin123",
            "role": "ADMIN"
        },
        "customer": {
            "email": "customer@smartstay.com",
            "password": "customer123",
            "role": "CUSTOMER"
        }
    }
