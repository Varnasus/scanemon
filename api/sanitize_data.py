#!/usr/bin/env python3
"""
Data sanitization script to remove null bytes and problematic characters
"""

import json
import re
import sqlite3
import os
from pathlib import Path


def sanitize_string(value):
    """Remove null bytes and problematic characters from a string"""
    if not isinstance(value, str):
        return value
    
    # Remove null bytes and control characters
    sanitized = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', value)
    
    # Remove Unicode escape sequences
    sanitized = re.sub(r'\\u0000', '', sanitized)
    
    return sanitized.strip()


def sanitize_json_file(file_path):
    """Sanitize a JSON file"""
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return
    
    print(f"Sanitizing {file_path}...")
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Create backup
        backup_path = f"{file_path}.backup"
        with open(backup_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        # Sanitize the data recursively
        sanitized_data = sanitize_json_recursive(data)
        
        # Write sanitized data
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(sanitized_data, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Sanitized {file_path} (backup saved to {backup_path})")
        
    except Exception as e:
        print(f"❌ Error sanitizing {file_path}: {e}")


def sanitize_json_recursive(obj):
    """Recursively sanitize JSON data"""
    if isinstance(obj, dict):
        return {key: sanitize_json_recursive(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [sanitize_json_recursive(item) for item in obj]
    elif isinstance(obj, str):
        return sanitize_string(obj)
    else:
        return obj


def sanitize_sqlite_database(db_path):
    """Sanitize SQLite database"""
    if not os.path.exists(db_path):
        print(f"Database not found: {db_path}")
        return
    
    print(f"Sanitizing SQLite database: {db_path}")
    
    # Create backup
    backup_path = f"{db_path}.backup"
    import shutil
    shutil.copy2(db_path, backup_path)
    print(f"Backup created: {backup_path}")
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Get all tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        
        for table in tables:
            table_name = table[0]
            print(f"Sanitizing table: {table_name}")
            
            # Get table schema
            cursor.execute(f"PRAGMA table_info({table_name})")
            columns = cursor.fetchall()
            
            # Get all data
            cursor.execute(f"SELECT * FROM {table_name}")
            rows = cursor.fetchall()
            
            # Sanitize each row
            for row in rows:
                sanitized_row = []
                for i, value in enumerate(row):
                    if isinstance(value, str):
                        sanitized_value = sanitize_string(value)
                        if sanitized_value != value:
                            # Update the value in the database
                            placeholders = ', '.join(['?' for _ in row])
                            update_sql = f"UPDATE {table_name} SET {columns[i][1]} = ? WHERE rowid = ?"
                            cursor.execute(update_sql, (sanitized_value, row[0]))
                conn.commit()
        
        conn.close()
        print(f"✅ Sanitized SQLite database: {db_path}")
        
    except Exception as e:
        print(f"❌ Error sanitizing database {db_path}: {e}")


def main():
    """Main sanitization function"""
    print("🧹 Data Sanitization Script")
    print("=" * 40)
    
    # Sanitize JSON files
    json_files = [
        "migration_data.json",
        "scan_history.json"
    ]
    
    for json_file in json_files:
        if os.path.exists(json_file):
            sanitize_json_file(json_file)
    
    # Sanitize SQLite database
    db_files = [
        "scanemon.db"
    ]
    
    for db_file in db_files:
        if os.path.exists(db_file):
            sanitize_sqlite_database(db_file)
    
    print("\n✅ Data sanitization completed!")


if __name__ == "__main__":
    main() 