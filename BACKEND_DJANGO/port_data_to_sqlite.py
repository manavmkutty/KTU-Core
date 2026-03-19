import os
import sqlite3
import warnings
try:
    import mysql.connector
except ImportError:
    print("Error: mysql-connector-python is not installed.")
    print("Please run: pip install mysql-connector-python")
    exit(1)

# MySQL configuration - UPDATE THESE VALUES
MYSQL_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'password', # Update your MySQL password here
    'database': 'ktu_core'
}

# SQLite configuration
SQLITE_DB_PATH = os.path.join(os.path.dirname(__file__), 'db.sqlite3')

def port_data():
    try:
        print("Connecting to MySQL database 'ktu_core'...")
        mysql_conn = mysql.connector.connect(**MYSQL_CONFIG)
        mysql_cursor = mysql_conn.cursor(dictionary=True)
    except mysql.connector.Error as err:
        print(f"Failed to connect to MySQL: {err}")
        print("Please check your MYSQL_CONFIG credentials at the top of this script.")
        return

    if not os.path.exists(SQLITE_DB_PATH):
        print(f"SQLite database not found at {SQLITE_DB_PATH}.")
        print("Please run 'python manage.py migrate' first to create the schema.")
        return
        
    print("Connecting to SQLite database...")
    sqlite_conn = sqlite3.connect(SQLITE_DB_PATH)
    sqlite_cursor = sqlite_conn.cursor()
    
    # Disable foreign key checks temporarily in SQLite to avoid order issues during insertion
    sqlite_cursor.execute('PRAGMA foreign_keys = OFF;')
    
    # Get all tables from MySQL
    mysql_cursor.execute("SHOW TABLES")
    tables = [list(row.values())[0] for row in mysql_cursor.fetchall()]
    
    print(f"Found {len(tables)} tables to port.\n")
    
    def map_mysql_type_to_sqlite(mysql_type):
        t = mysql_type.lower()
        if 'int' in t or 'bool' in t or 'bit' in t:
            return 'INTEGER'
        if 'char' in t or 'text' in t or 'date' in t or 'time' in t or 'enum' in t or 'set' in t:
            return 'TEXT'
        if 'float' in t or 'double' in t or 'decimal' in t:
            return 'REAL'
        if 'blob' in t or 'binary' in t:
            return 'BLOB'
        return 'TEXT'

    for table in tables:
        try:
            # Check if table exists in SQLite
            sqlite_cursor.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table}'")
            if not sqlite_cursor.fetchone():
                print(f"Table '{table}' does not exist in SQLite. Creating dynamically...")
                mysql_cursor.execute(f"SHOW COLUMNS FROM `{table}`")
                columns_info = mysql_cursor.fetchall()
                
                col_defs = []
                for col in columns_info:
                    col_name = col['Field']
                    sqlite_type = map_mysql_type_to_sqlite(col['Type'])
                    
                    def_str = f'"{col_name}" {sqlite_type}'
                    
                    if col['Key'] == 'PRI':
                        def_str += ' PRIMARY KEY'
                        if 'auto_increment' in col.get('Extra', ''):
                            if sqlite_type == 'INTEGER':
                                def_str += ' AUTOINCREMENT'
                            
                    col_defs.append(def_str)
                    
                create_stmt = f"CREATE TABLE `{table}` ({', '.join(col_defs)});"
                sqlite_cursor.execute(create_stmt)
                sqlite_conn.commit()
                print(f" Successfully created table '{table}' in SQLite.")
                
            # Read from MySQL
            mysql_cursor.execute(f"SELECT * FROM `{table}`")
            rows = mysql_cursor.fetchall()
            
            if not rows:
                print(f"Skipping '{table}' - No records found in MySQL.")
                continue
                
            print(f"Porting {len(rows)} records for '{table}'...")
            
            # Prepare insert query
            columns = rows[0].keys()
            placeholders = ', '.join(['?'] * len(columns))
            cols_str = ', '.join([f'"{col}"' for col in columns])
            
            insert_query = f"INSERT OR REPLACE INTO `{table}` ({cols_str}) VALUES ({placeholders})"
            
            # Insert into SQLite
            sqlite_data = [tuple(row[col] for col in columns) for row in rows]
            sqlite_cursor.executemany(insert_query, sqlite_data)
            sqlite_conn.commit()
            
            print(f" Successfully ported '{table}'.")
            
        except Exception as e:
            print(f" Error porting table '{table}': {e}")
            sqlite_conn.rollback()
            
    # Re-enable foreign key checks
    sqlite_cursor.execute('PRAGMA foreign_keys = ON;')
    
    mysql_conn.close()
    sqlite_conn.close()
    print("\nData porting complete! Your SQLite database is now populated.")

if __name__ == '__main__':
    port_data()
