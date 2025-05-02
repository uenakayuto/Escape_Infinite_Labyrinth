import sqlite3
import os

def init_db():
    # データベースファイルの保存先を絶対パスで指定
    db_path = os.path.join(os.path.dirname(__file__), 'game_records.db')
    
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cleared_floors INTEGER,
            last_clear_time REAL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

def save_game_result(cleared_floors, last_clear_time):
    # データベースファイルの保存先を絶対パスで指定
    db_path = os.path.join(os.path.dirname(__file__), 'game_records.db')
    
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    c.execute("INSERT INTO records (cleared_floors, last_clear_time) VALUES (?, ?)",
              (cleared_floors, last_clear_time))
    conn.commit()
    conn.close()