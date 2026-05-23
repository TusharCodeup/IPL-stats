import sqlite3
import os
from pathlib import Path

# Resolve path relative to backend directory
DB_PATH = Path(__file__).resolve().parent / "app" / "ipl_platform.db"

def run_migration():
    print(f"Connecting to database at: {DB_PATH}")
    if not DB_PATH.exists():
        print("Database file does not exist yet. Uvicorn will create it automatically on start.")
        return
        
    conn = sqlite3.connect(str(DB_PATH))
    cursor = conn.cursor()
    
    # 1. Alter users table
    columns_to_add = [
        ("full_name", "VARCHAR"),
        ("credits", "INTEGER DEFAULT 5 NOT NULL"),
        ("subscription", "VARCHAR DEFAULT 'free' NOT NULL")
    ]
    
    # Check existing columns in users table
    cursor.execute("PRAGMA table_info(users)")
    existing_columns = [col[1] for col in cursor.fetchall()]
    
    for col_name, col_type in columns_to_add:
        if col_name not in existing_columns:
            print(f"Adding column '{col_name}' ({col_type}) to 'users' table...")
            cursor.execute(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}")
        else:
            print(f"Column '{col_name}' already exists in 'users' table.")
            
    # 2. Create billing_transactions table if not exists
    print("Ensuring 'billing_transactions' table exists...")
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS billing_transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        order_id VARCHAR NOT NULL UNIQUE,
        payment_id VARCHAR,
        amount FLOAT NOT NULL,
        currency VARCHAR NOT NULL DEFAULT 'INR',
        status VARCHAR NOT NULL DEFAULT 'created',
        plan_name VARCHAR NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """)
    
    conn.commit()
    conn.close()
    print("Migration completed successfully.")

if __name__ == "__main__":
    run_migration()
