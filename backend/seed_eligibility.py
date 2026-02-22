import sqlite3
import os

db_path = 'farmer_support.db'
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Update first scheme with strict criteria
    cursor.execute("UPDATE schemes SET max_income = 200000, max_land_size = 5.0 WHERE id = 1")
    
    # Add a second scheme with different criteria if needed
    cursor.execute("SELECT COUNT(*) FROM schemes")
    count = cursor.fetchone()[0]
    if count < 2:
        cursor.execute("""
        INSERT INTO schemes (title, description, eligibility_criteria, required_documents, total_quota, deadline, max_income, max_land_size, district_quotas, reservations)
        VALUES ('Small Farmer Land Support', 'Grants for irrigation systems for small-scale farmers.', 'Income < 1.5L, Land < 3 Acres', '7/12, Income', 50, '2026-12-31', 150000, 3.0, '{"Pune": 20, "Nagpur": 20, "Nashik": 10}', '{"scPercentage": 10, "stPercentage": 10}')
        """)
        
    conn.commit()
    conn.close()
    print("Database updated successfully.")
else:
    print("Database file not found.")
