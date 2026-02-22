from sqlalchemy import Column, Integer, String, Text, ForeignKey, Enum, DateTime, Boolean, Float, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base

class UserRole(str, enum.Enum):
    FARMER = "farmer"
    OFFICER = "officer"
    ADMIN = "admin"

class ApplicationStatus(str, enum.Enum):
    PENDING = "pending"
    PROVISIONALLY_APPROVED = "provisionally_approved"
    WAITING = "waiting"
    APPROVED = "approved"
    REJECTED = "rejected"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    phone_number = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(Enum(UserRole), default=UserRole.FARMER)
    
    applications = relationship("Application", back_populates="farmer")
    notifications = relationship("Notification", back_populates="user")

class Scheme(Base):
    __tablename__ = "schemes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    eligibility_criteria = Column(Text)
    required_documents = Column(String) # Comma-separated list
    total_quota = Column(Integer, default=100)
    max_income = Column(Integer, nullable=True) # Eligibility: max income
    max_land_size = Column(Float, nullable=True) # Eligibility: max land size
    deadline = Column(String)
    allocation_done = Column(Boolean, default=False)
    district_quotas = Column(Text) # Store as JSON string
    reservations = Column(Text) # Store as JSON string
    created_at = Column(String, server_default=func.now())

    applications = relationship("Application", back_populates="scheme")

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(String, unique=True, index=True) # Unique generated ID
    farmer_id = Column(Integer, ForeignKey("users.id"))
    scheme_id = Column(Integer, ForeignKey("schemes.id"))
    status = Column(Enum(ApplicationStatus), default=ApplicationStatus.PENDING)
    
    # Applicant Details
    applicant_name = Column(String)
    aadhaar_number = Column(String)
    income = Column(Integer)
    land_size = Column(Float)
    district = Column(String)
    category = Column(String)
    impact_score = Column(Float, default=0.0)
    
    # Document paths
    document_7_12 = Column(String)
    income_certificate = Column(String)
    ration_card = Column(String)
    
    created_at = Column(String, server_default=func.now())
    updated_at = Column(String, onupdate=func.now())

    # AI Validation
    ai_validation_status = Column(String, default="PENDING") # PENDING, VALID, FLAGGED
    ai_validation_report = Column(JSON, nullable=True) # Extracted data & confidence

    farmer = relationship("User", back_populates="applications")
    scheme = relationship("Scheme", back_populates="applications")

    @property
    def scheme_title(self):
        return self.scheme.title if self.scheme else "General Support Scheme"

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    message = Column(Text)
    is_read = Column(Boolean, default=False)
    created_at = Column(String, server_default=func.now())

    user = relationship("User", back_populates="notifications")

class SMSLog(Base):
    __tablename__ = "sms_logs"

    id = Column(Integer, primary_key=True, index=True)
    phone_number = Column(String, index=True)
    message = Column(Text)
    sent_at = Column(String, server_default=func.now())
