"""
Migration utility for transitioning from SQLite to PostgreSQL
"""

import sqlite3
import json
import logging
from pathlib import Path
from typing import Dict, List, Any
from datetime import datetime
import os

logger = logging.getLogger(__name__)

class MigrationUtility:
    """Utility for migrating data from SQLite to PostgreSQL"""
    
    def __init__(self, sqlite_path: str = "scanemon.db", export_path: str = "migration_data.json"):
        self.sqlite_path = sqlite_path
        self.export_path = export_path
        self.sqlite_conn = None
        
    def connect_sqlite(self):
        """Connect to SQLite database"""
        try:
            self.sqlite_conn = sqlite3.connect(self.sqlite_path)
            self.sqlite_conn.row_factory = sqlite3.Row
            logger.info(f"Connected to SQLite database: {self.sqlite_path}")
            return True
        except Exception as e:
            logger.error(f"Failed to connect to SQLite: {e}")
            return False
    
    def get_table_schema(self, table_name: str) -> Dict[str, Any]:
        """Get table schema from SQLite"""
        try:
            cursor = self.sqlite_conn.cursor()
            cursor.execute(f"PRAGMA table_info({table_name})")
            columns = cursor.fetchall()
            
            schema = {
                "table_name": table_name,
                "columns": []
            }
            
            for col in columns:
                schema["columns"].append({
                    "name": col["name"],
                    "type": col["type"],
                    "not_null": bool(col["notnull"]),
                    "primary_key": bool(col["pk"]),
                    "default": col["dflt_value"]
                })
            
            return schema
        except Exception as e:
            logger.error(f"Failed to get schema for {table_name}: {e}")
            return {}
    
    def get_table_data(self, table_name: str) -> List[Dict[str, Any]]:
        """Get all data from a table"""
        try:
            cursor = self.sqlite_conn.cursor()
            cursor.execute(f"SELECT * FROM {table_name}")
            rows = cursor.fetchall()
            
            data = []
            for row in rows:
                # Convert sqlite3.Row to dict
                row_dict = dict(row)
                
                # Handle datetime conversion
                for key, value in row_dict.items():
                    if isinstance(value, str) and key.endswith('_at'):
                        try:
                            # Try to parse as datetime
                            datetime.fromisoformat(value.replace('Z', '+00:00'))
                        except:
                            pass
                
                data.append(row_dict)
            
            logger.info(f"Exported {len(data)} rows from {table_name}")
            return data
        except Exception as e:
            logger.error(f"Failed to get data from {table_name}: {e}")
            return []
    
    def export_all_data(self) -> bool:
        """Export all data from SQLite to JSON"""
        try:
            if not self.connect_sqlite():
                return False
            
            # Get list of tables
            cursor = self.sqlite_conn.cursor()
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
            tables = [row["name"] for row in cursor.fetchall()]
            
            export_data = {
                "export_timestamp": datetime.utcnow().isoformat(),
                "source_database": self.sqlite_path,
                "tables": {}
            }
            
            for table in tables:
                if table.startswith('sqlite_'):
                    continue  # Skip SQLite system tables
                
                schema = self.get_table_schema(table)
                data = self.get_table_data(table)
                
                export_data["tables"][table] = {
                    "schema": schema,
                    "data": data,
                    "row_count": len(data)
                }
            
            # Save to JSON file
            with open(self.export_path, 'w') as f:
                json.dump(export_data, f, indent=2, default=str)
            
            logger.info(f"Exported data to {self.export_path}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to export data: {e}")
            return False
        finally:
            if self.sqlite_conn:
                self.sqlite_conn.close()
    
    def validate_export(self) -> Dict[str, Any]:
        """Validate exported data"""
        try:
            with open(self.export_path, 'r') as f:
                data = json.load(f)
            
            validation = {
                "export_file": self.export_path,
                "export_timestamp": data.get("export_timestamp"),
                "tables": {},
                "total_rows": 0
            }
            
            for table_name, table_data in data.get("tables", {}).items():
                row_count = len(table_data.get("data", []))
                validation["tables"][table_name] = {
                    "row_count": row_count,
                    "has_schema": bool(table_data.get("schema")),
                    "schema_columns": len(table_data.get("schema", {}).get("columns", []))
                }
                validation["total_rows"] += row_count
            
            logger.info(f"Validation complete: {validation['total_rows']} total rows")
            return validation
            
        except Exception as e:
            logger.error(f"Failed to validate export: {e}")
            return {}
    
    def create_migration_script(self, target_db_url: str) -> str:
        """Create SQL migration script for PostgreSQL"""
        try:
            with open(self.export_path, 'r') as f:
                data = json.load(f)
            
            script_lines = [
                "-- Migration script generated by MigrationUtility",
                f"-- Generated: {datetime.utcnow().isoformat()}",
                f"-- Target: {target_db_url}",
                "",
                "BEGIN;",
                ""
            ]
            
            for table_name, table_data in data.get("tables", {}).items():
                schema = table_data.get("schema", {})
                table_data_list = table_data.get("data", [])
                
                if not table_data_list:
                    continue
                
                # Create INSERT statements
                if table_data_list:
                    columns = list(table_data_list[0].keys())
                    script_lines.append(f"-- Inserting {len(table_data_list)} rows into {table_name}")
                    
                    for row in table_data_list:
                        values = []
                        for col in columns:
                            value = row.get(col)
                            if value is None:
                                values.append("NULL")
                            elif isinstance(value, str):
                                # Escape single quotes
                                escaped_value = value.replace("'", "''")
                                values.append(f"'{escaped_value}'")
                            elif isinstance(value, bool):
                                values.append("true" if value else "false")
                            else:
                                values.append(str(value))
                        
                        script_lines.append(
                            f"INSERT INTO {table_name} ({', '.join(columns)}) "
                            f"VALUES ({', '.join(values)});"
                        )
                    
                    script_lines.append("")
            
            script_lines.extend([
                "COMMIT;",
                "",
                "-- Migration completed successfully"
            ])
            
            script_content = "\n".join(script_lines)
            
            # Save script
            script_path = "migration_script.sql"
            with open(script_path, 'w') as f:
                f.write(script_content)
            
            logger.info(f"Migration script created: {script_path}")
            return script_path
            
        except Exception as e:
            logger.error(f"Failed to create migration script: {e}")
            return ""
    
    def backup_sqlite(self) -> str:
        """Create a backup of the SQLite database"""
        try:
            backup_path = f"{self.sqlite_path}.backup.{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            
            if os.path.exists(self.sqlite_path):
                import shutil
                shutil.copy2(self.sqlite_path, backup_path)
                logger.info(f"SQLite backup created: {backup_path}")
                return backup_path
            else:
                logger.warning(f"SQLite database not found: {self.sqlite_path}")
                return ""
                
        except Exception as e:
            logger.error(f"Failed to create backup: {e}")
            return ""

def main():
    """Main migration utility"""
    import argparse
    
    parser = argparse.ArgumentParser(description="SQLite to PostgreSQL Migration Utility")
    parser.add_argument("--sqlite-path", default="scanemon.db", help="Path to SQLite database")
    parser.add_argument("--export-path", default="migration_data.json", help="Path for exported data")
    parser.add_argument("--action", choices=["export", "validate", "backup", "script"], 
                       default="export", help="Action to perform")
    parser.add_argument("--target-db", help="Target PostgreSQL database URL")
    
    args = parser.parse_args()
    
    utility = MigrationUtility(args.sqlite_path, args.export_path)
    
    if args.action == "backup":
        backup_path = utility.backup_sqlite()
        if backup_path:
            print(f"✅ Backup created: {backup_path}")
        else:
            print("❌ Backup failed")
    
    elif args.action == "export":
        if utility.export_all_data():
            print(f"✅ Data exported to: {args.export_path}")
        else:
            print("❌ Export failed")
    
    elif args.action == "validate":
        validation = utility.validate_export()
        if validation:
            print("✅ Export validation:")
            print(f"   Total rows: {validation['total_rows']}")
            print(f"   Tables: {len(validation['tables'])}")
            for table, info in validation['tables'].items():
                print(f"   - {table}: {info['row_count']} rows")
        else:
            print("❌ Validation failed")
    
    elif args.action == "script":
        if not args.target_db:
            print("❌ Target database URL required for script generation")
            return
        
        script_path = utility.create_migration_script(args.target_db)
        if script_path:
            print(f"✅ Migration script created: {script_path}")
        else:
            print("❌ Script generation failed")

if __name__ == "__main__":
    main() 