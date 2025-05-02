import sqlite3

def init_db():
    conn = sqlite3.connect("game_records.db")
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
    conn = sqlite3.connect("game_records.db")
    c = conn.cursor()
    c.execute("INSERT INTO records (cleared_floors, last_clear_time) VALUES (?, ?)",
              (cleared_floors, last_clear_time))
    conn.commit()
    conn.close()