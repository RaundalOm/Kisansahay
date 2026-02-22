from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from app.models import UserRole, ApplicationStatus

# User Schemas
class UserBase(BaseModel):
    full_name: str
    phone_number: str

class UserCreate(UserBase):
    password: str
    role: UserRole = UserRole.FARMER

class User(UserBase):
    id: int
    role: UserRole
    
    class Config:
        from_attributes = True

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    phone_number: Optional[str] = None

# Scheme Schemas
class SchemeBase(BaseModel):
    title: str
    description: str
    eligibility_criteria: str
    required_documents: str
    total_quota: int = 100
    max_income: Optional[int] = None
    max_land_size: Optional[float] = None
    deadline: str
    allocation_done: bool = False
    district_quotas: Any
    reservations: Any

class SchemeCreate(SchemeBase):
    pass

class Scheme(SchemeBase):
    id: int
    created_at: str

    class Config:
        from_attributes = True

class EligibilityCheck(BaseModel):
    income: int
    land_size: float
    district: str
    category: str

# Application Schemas
class ApplicationBase(BaseModel):
    scheme_id: int
    applicant_name: str
    aadhaar_number: str
    income: int
    land_size: float
    district: str
    category: str
    impact_score: float = 0.0

class ApplicationCreate(ApplicationBase):
    pass

class Application(ApplicationBase):
    id: int
    application_id: str
    farmer_id: int
    status: ApplicationStatus
    impact_score: float
    document_7_12: Optional[str] = None
    income_certificate: Optional[str] = None
    ration_card: Optional[str] = None
    scheme_title: Optional[str] = None
    ai_validation_status: str = "PENDING"
    ai_validation_report: Optional[Dict[str, Any]] = None
    created_at: str
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True

# Notification Schemas
class NotificationBase(BaseModel):
    message: str

class Notification(NotificationBase):
    id: int
    is_read: bool
    created_at: str

    class Config:
        from_attributes = True
