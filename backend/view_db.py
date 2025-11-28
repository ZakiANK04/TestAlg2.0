import sqlite3
import json
from tabulate import tabulate

conn = sqlite3.connect('db.sqlite3')
cursor = conn.cursor()

# Get all tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = cursor.fetchall()

print("=" * 60)
print("DATABASE TABLES")
print("=" * 60)

for table in tables:
    table_name = table[0]
    print(f"\n📊 Table: {table_name}")
    print("-" * 60)
    
    # Get table schema
    cursor.execute(f"PRAGMA table_info({table_name})")
    columns = cursor.fetchall()
    if columns:
        print("Columns:")
        for col in columns:
            print(f"  - {col[1]} ({col[2]})")
    
    # Get row count
    cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
    count = cursor.fetchone()[0]
    print(f"\nTotal rows: {count}")
    
    # Get all data
    if count > 0:
        cursor.execute(f"SELECT * FROM {table_name}")
        rows = cursor.fetchall()
        column_names = [description[0] for description in cursor.description]
        
        # Display data in a table format
        print(f"\nData:")
        if count <= 20:  # Show all if 20 or fewer rows
            data_for_table = [list(row) for row in rows]
            print(tabulate(data_for_table, headers=column_names, tablefmt="grid"))
        else:  # Show first 10 rows if more
            print(f"(Showing first 10 of {count} rows)")
            data_for_table = [list(row) for row in rows[:10]]
            print(tabulate(data_for_table, headers=column_names, tablefmt="grid"))
    print()

conn.close()

