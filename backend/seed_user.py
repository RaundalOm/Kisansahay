import sqlite3
import os
import sys

# Add the current directory to sys.path to import app modules
sys.path.append(os.getcwd())

from app import auth, models
from app.database import SessionLocal

def seed_test_user():
    db = SessionLocal()
    try:
        phone = "1234567890"
        print(f"Checking for user: {phone}")
        db_user = db.query(models.User).filter(models.User.phone_number == phone).first()
        if not db_user:
            print(f"Seeding test farmer: {phone}")
            hashed_pwd = auth.get_password_hash("password123")
            new_user = models.User(
                full_name="Test Farmer",
                phone_number=phone,
                hashed_password=hashed_pwd,
                role=models.UserRole.FARMER
            )
            db.add(new_user)
            db.commit()
            print(f"Test farmer {phone} seeded successfully.")
        else:
            print(f"Test farmer {phone} already exists.")
    except Exception as e:
        print(f"Error seeding user: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_test_user()
