import sqlite3
import os

db_path = 'farmer_support.db'
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check if columns exist
    cursor.execute("PRAGMA table_info(schemes)")
    columns = [row[1] for row in cursor.fetchall()]
    
    if 'max_income' not in columns:
        print("Adding max_income column...")
        cursor.execute("ALTER TABLE schemes ADD COLUMN max_income INTEGER")
        
    if 'max_land_size' not in columns:
        print("Adding max_land_size column...")
        cursor.execute("ALTER TABLE schemes ADD COLUMN max_land_size FLOAT")
        
    # Seed data
    from datetime import datetime
    print("Re-seeding test data...")
    
    # Clear existing data to avoid format errors
    cursor.execute("DELETE FROM schemes")
    
    # Insert Primary Scheme
    cursor.execute("""
    INSERT INTO schemes (id, title, description, eligibility_criteria, required_documents, total_quota, deadline, max_income, max_land_size, district_quotas, reservations, allocation_done, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        1,
        'PM-Kisan Vulnerable Support 2026',
        'Direct financial aid targeted at small-scale farmers.',
        'Income <= 2L, Land <= 5 Acres',
        '7/12, Income',
        1000,
        datetime(2026, 6, 30, 0, 0, 0),
        200000,
        5.0,
        '{"Pune": 500, "Nagpur": 300, "Nashik": 200}',
        '{"scPercentage": 15, "stPercentage": 7.5}',
        0,
        datetime.now()
    ))
    
    # Insert Second Scheme
    cursor.execute("""
    INSERT INTO schemes (title, description, eligibility_criteria, required_documents, total_quota, deadline, max_income, max_land_size, district_quotas, reservations, allocation_done, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        'Small Farmer Land Support', 
        'Grants for irrigation systems for small-scale farmers.', 
        'Income < 1.5L, Land < 3 Acres', 
        '7/12, Income', 
        50, 
        datetime(2026, 12, 31, 23, 59, 59), 
        150000, 
        3.0, 
        '{"Pune": 20, "Nagpur": 20, "Nashik": 10}', 
        '{"scPercentage": 10, "stPercentage": 10}',
        0,
        datetime.now()
    ))
        
    conn.commit()
    conn.close()
    print("Database migrated and updated successfully.")
else:
    print("Database file not found.")
