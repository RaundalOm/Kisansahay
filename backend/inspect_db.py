import sqlite3
import os

db_path = 'farmer_support.db'
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='schemes'")
    schema = cursor.fetchone()
    if schema:
        print(f"Schema for 'schemes':\n{schema[0]}")
    else:
        print("Table 'schemes' not found.")
        
    cursor.execute("PRAGMA table_info(schemes)")
    info = cursor.fetchall()
    print("\nColumn info:")
    for col in info:
        print(col)
        
    conn.close()
else:
    print("Database file not found.")
