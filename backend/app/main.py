from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import List
import uuid
import os
import json

from app import models, schemas, auth, database
from app.database import engine, get_db
from app.services.ai_validator import validate_documents
from app.services.sms import send_sms

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Farmer Support System API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3005",
        "http://localhost:3300",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3005",
        "http://127.0.0.1:3300",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.staticfiles import StaticFiles

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Create uploads directory if not exists
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/health")
def health_check():
    return {"status": "ok"}

# --- AUTH ENDPOINTS ---

@app.post("/register", response_model=schemas.User)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    print(f"REGISTRATION ATTEMPT FOR: {user.phone_number}")
    db_user = db.query(models.User).filter(models.User.phone_number == user.phone_number).first()
    if db_user:
        print(f"REGISTRATION FAILED: {user.phone_number} already exists")
        raise HTTPException(status_code=400, detail="Phone number already registered")
    
    hashed_pwd = auth.get_password_hash(user.password)
    new_user = models.User(
        full_name=user.full_name,
        phone_number=user.phone_number,
        hashed_password=hashed_pwd,
        role=user.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    print(f"REGISTRATION SUCCESSFUL: {user.phone_number}")
    msg = f"Welcome {new_user.full_name}! Your identity as a {new_user.role} has been registered on SmartAgriAI."
    send_sms(new_user.phone_number, msg)
    db.add(models.SMSLog(phone_number=new_user.phone_number, message=msg))
    db.commit()
    return new_user

@app.post("/token", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.phone_number == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect phone number or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = auth.create_access_token(data={"sub": user.phone_number})
    return {"access_token": access_token, "token_type": "bearer"}

# --- HELPERS ---

# --- HELPERS ---

def calculate_impact_score(income: int, land_size: float, category: str) -> float:
    # Mirroring frontend logic in calculator.ts
    MAX_INCOME = 200000
    MAX_LAND_SIZE = 5
    
    # Weights
    CATEGORY_WEIGHTS = {
        'SC': 1.5,
        'ST': 1.5,
        'General': 1.0,
    }
    
    # Normalized scores (0-50 each, higher is better/more needy)
    income_score = (1 - min(income, MAX_INCOME) / MAX_INCOME) * 50
    land_score = (1 - min(land_size, MAX_LAND_SIZE) / MAX_LAND_SIZE) * 50
    
    base_score = float(income_score + land_score or 0.0)
    multiplier = float(CATEGORY_WEIGHTS.get(category, 1.0))
    
    final_score = float(base_score * multiplier)
    # Using format to avoid round() overload confusion in some linters
    return float(f"{final_score:.2f}")

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = auth.jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        phone_number: str = payload.get("sub")
        if phone_number is None:
            raise credentials_exception
    except Exception:
        raise credentials_exception
    
    user = db.query(models.User).filter(models.User.phone_number == phone_number).first()
    if user is None:
        raise credentials_exception
    return user

def check_admin(user: models.User):
    if user.role not in [models.UserRole.ADMIN, models.UserRole.OFFICER]:
        raise HTTPException(status_code=403, detail="Not enough permissions")

@app.get("/users/me", response_model=schemas.User)
async def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

# --- SCHEME ENDPOINTS ---

@app.post("/schemes", response_model=schemas.Scheme)
def create_scheme(scheme: schemas.SchemeCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    check_admin(current_user)
    db_scheme = models.Scheme(**scheme.model_dump())
    db.add(db_scheme)
    db.commit()
    db.refresh(db_scheme)
    return db_scheme

@app.get("/schemes", response_model=List[schemas.Scheme])
def list_schemes(db: Session = Depends(get_db)):
    return db.query(models.Scheme).all()

@app.post("/schemes/eligible", response_model=List[schemas.Scheme])
def get_eligible_schemes(check: schemas.EligibilityCheck, db: Session = Depends(get_db)):
    schemes = db.query(models.Scheme).all()
    eligible = []
    
    for s in schemes:
        # Check income (if specified)
        if s.max_income is not None and check.income > s.max_income:
            continue
        
        # Check land size (if specified)
        if s.max_land_size is not None and check.land_size > s.max_land_size:
            continue
            
        # Check district (if specified in quotas)
        import json
        quotas = s.district_quotas
        if quotas and isinstance(quotas, str):
            try:
                quotas = json.loads(quotas)
            except:
                pass
                
        if quotas and isinstance(quotas, dict) and check.district not in quotas:
            continue
            
        eligible.append(s)
        
    return eligible

@app.post("/schemes/{scheme_id}/allocate")
def trigger_allocation(scheme_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    check_admin(current_user)
    scheme = db.query(models.Scheme).filter(models.Scheme.id == scheme_id).first()
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")
    
    if scheme.allocation_done:
        raise HTTPException(status_code=400, detail="Allocation already processed and locked")

    apps = db.query(models.Application).filter(
        models.Application.scheme_id == scheme_id,
        models.Application.status == models.ApplicationStatus.PENDING
    ).all()

    # Backend implementation of the allocation algorithm
    # Parse JSON fields since they are stored as Text
    try:
        district_quotas: dict = json.loads(scheme.district_quotas) if scheme.district_quotas else {}
        reservations: dict = json.loads(scheme.reservations) if scheme.reservations else {"scPercentage": 0, "stPercentage": 0}
    except Exception:
        district_quotas: dict = {}
        reservations: dict = {"scPercentage": 0, "stPercentage": 0}

    for district, total_seats in district_quotas.items():
        district_apps = [a for a in apps if a.district == district]
        district_apps.sort(key=lambda x: x.impact_score, reverse=True)

        allocated_ids = set()
        rem_seats = total_seats

        # 1. Reservations
        # Category-wise loops to avoid nonlocal if it's causing lint issues
        for cat_name, key in [('SC', 'scPercentage'), ('ST', 'stPercentage')]:
            perc = reservations.get(key, 0)
            seats_to_fill = int((perc / 100) * total_seats)
            filled = 0
            for app in district_apps:
                if filled >= seats_to_fill or rem_seats <= 0: break
                if app.category == cat_name and app.id not in allocated_ids:
                    app.status = models.ApplicationStatus.PROVISIONALLY_APPROVED
                    allocated_ids.add(app.id)
                    rem_seats -= 1
                    filled += 1

        # 2. Merit-Based Fill
        for app in district_apps:
            if rem_seats <= 0: break
            if app.id not in allocated_ids:
                app.status = models.ApplicationStatus.PROVISIONALLY_APPROVED
                allocated_ids.add(app.id)
                rem_seats -= 1

        # 3. Waitlist
        for app in district_apps:
            if app.id not in allocated_ids:
                app.status = models.ApplicationStatus.WAITING

    scheme.allocation_done = True
    db.commit()
    return {"message": f"Allocation processed for {scheme.title}"}

# --- APPLICATION ENDPOINTS ---

@app.post("/apply/{scheme_id}", response_model=schemas.Application)
def apply_to_scheme(
    scheme_id: int,
    application_data: schemas.ApplicationCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    scheme = db.query(models.Scheme).filter(models.Scheme.id == scheme_id).first()
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")
    
    # Check if already applied
    existing = db.query(models.Application).filter(
        models.Application.farmer_id == current_user.id,
        models.Application.scheme_id == scheme_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already applied to this scheme")

    # AUTO-CALCULATE SCORE IN BACKEND
    score = calculate_impact_score(
        application_data.income,
        application_data.land_size,
        application_data.category
    )

    application_id = f"APP-{uuid.uuid4().hex[:8].upper()}"
    new_app = models.Application(
        application_id=application_id,
        farmer_id=current_user.id,
        scheme_id=scheme_id,
        status=models.ApplicationStatus.PENDING,
        applicant_name=application_data.applicant_name,
        aadhaar_number=application_data.aadhaar_number,
        income=application_data.income,
        land_size=application_data.land_size,
        district=application_data.district,
        category=application_data.category,
        impact_score=score
    )
    db.add(new_app)
    
    # Notification
    notification = models.Notification(
        user_id=current_user.id,
        message=f"Your application for {scheme.title} has been submitted. ID: {application_id}"
    )
    db.add(notification)
    
    # NEW: Pending Documents Notification
    doc_notification = models.Notification(
        user_id=current_user.id,
        message=f"Action Required: Please upload required documents for your application {application_id} to proceed with verification."
    )
    db.add(doc_notification)
    
    # Send SMS (Service)
    msg = f"Your application {application_id} is received."
    send_sms(current_user.phone_number, msg)
    db.add(models.SMSLog(phone_number=current_user.phone_number, message=msg))
    
    db.commit()
    db.refresh(new_app)
    return new_app

@app.post("/applications/{application_id}/upload")
async def upload_documents(
    application_id: str,
    doc_7_12: UploadFile = File(None),
    income_cert: UploadFile = File(None),
    ration_card: UploadFile = File(None),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    app_record = db.query(models.Application).filter(models.Application.application_id == application_id).first()
    if not app_record:
        raise HTTPException(status_code=404, detail="Application not found")
    
    if app_record.farmer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    upload_dir = f"uploads/{application_id}"
    os.makedirs(upload_dir, exist_ok=True)

    if doc_7_12:
        path = f"{upload_dir}/7_12_{doc_7_12.filename}"
        with open(path, "wb") as buffer:
            buffer.write(await doc_7_12.read())
        app_record.document_7_12 = path

    if income_cert:
        path = f"{upload_dir}/income_{income_cert.filename}"
        with open(path, "wb") as buffer:
            buffer.write(await income_cert.read())
        app_record.income_certificate = path

    if ration_card:
        path = f"{upload_dir}/ration_{ration_card.filename}"
        with open(path, "wb") as buffer:
            buffer.write(await ration_card.read())
        app_record.ration_card = path

    # AI VALIDATION TRIGGER
    doc_paths = {}
    if app_record.document_7_12: doc_paths["document_7_12"] = app_record.document_7_12
    if app_record.income_certificate: doc_paths["income_certificate"] = app_record.income_certificate
    if app_record.ration_card: doc_paths["ration_card"] = app_record.ration_card
    
    # Convert app record to dict for validator
    app_data = {
        "applicant_name": app_record.applicant_name,
        "income": app_record.income,
        "land_size": app_record.land_size,
        "district": app_record.district,
        "category": app_record.category
    }
    
    ai_result = validate_documents(app_data, doc_paths)
    app_record.ai_validation_status = ai_result["status"]
    app_record.ai_validation_report = ai_result["report"]

    db.commit()
    return {
        "message": "Documents uploaded and AI validation complete",
        "ai_status": ai_result["status"]
    }

# --- DASHBOARD ENDPOINTS ---

@app.get("/farmer/dashboard", response_model=List[schemas.Application])
def farmer_dashboard(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(models.Application).filter(models.Application.farmer_id == current_user.id).all()

@app.get("/farmer/notifications", response_model=List[schemas.Notification])
def get_notifications(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(models.Notification).filter(models.Notification.user_id == current_user.id).order_by(models.Notification.created_at.desc()).all()

@app.get("/admin/applications", response_model=List[schemas.Application])
def admin_dashboard(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    check_admin(current_user)
    return db.query(models.Application).all()

@app.post("/admin/applications/{application_id}/status")
def update_application_status(
    application_id: str,
    new_status: models.ApplicationStatus,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    check_admin(current_user)
    app_record = db.query(models.Application).filter(models.Application.application_id == application_id).first()
    if not app_record:
        raise HTTPException(status_code=404, detail="Application not found")
    
    old_status = app_record.status
    app_record.status = new_status
    
    # Logic: If a PROVISIONALLY_APPROVED application is REJECTED, promote next from WAITING
    if old_status == models.ApplicationStatus.PROVISIONALLY_APPROVED and new_status == models.ApplicationStatus.REJECTED:
        next_candidate = db.query(models.Application).filter(
            models.Application.scheme_id == app_record.scheme_id,
            models.Application.district == app_record.district,
            models.Application.status == models.ApplicationStatus.WAITING
        ).order_by(models.Application.impact_score.desc()).first()
        
        if next_candidate:
            next_candidate.status = models.ApplicationStatus.PROVISIONALLY_APPROVED
            # Add notification for the promoted farmer
            promo_msg = f"Good news! You have been promoted from the waitlist to PROVISIONALLY APPROVED for your application {next_candidate.application_id}."
            db.add(models.Notification(user_id=next_candidate.farmer_id, message=promo_msg))
            
            # SMS for promoted candidate
            farmer_next = db.query(models.User).filter(models.User.id == next_candidate.farmer_id).first()
            if farmer_next:
                send_sms(farmer_next.phone_number, promo_msg)
                db.add(models.SMSLog(phone_number=farmer_next.phone_number, message=promo_msg))

    # Notification for the current applicant
    if new_status == models.ApplicationStatus.APPROVED:
        message = f"Congratulations! Your application {application_id} has been APPROVED. Benefit disbursement will follow shortly."
    elif new_status == models.ApplicationStatus.REJECTED:
        message = f"Your application {application_id} has been REJECTED after document review. Please check requirements and re-apply if eligible."
    else:
        message = f"Your application {application_id} status has been updated to {new_status}."
    
    db.add(models.Notification(user_id=app_record.farmer_id, message=message))
    
    # Send SMS (Service)
    farmer = db.query(models.User).filter(models.User.id == app_record.farmer_id).first()
    if farmer:
        send_sms(farmer.phone_number, message)
        db.add(models.SMSLog(phone_number=farmer.phone_number, message=message))
    
    db.commit()
    return {"message": f"Status updated to {new_status}"}

@app.get("/admin/sms-logs")
def get_sms_logs(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    check_admin(current_user)
    return db.query(models.SMSLog).order_by(models.SMSLog.sent_at.desc()).all()
