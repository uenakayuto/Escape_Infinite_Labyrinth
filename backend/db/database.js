const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.resolve(__dirname, "ranking.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("DB接続エラー:", err.message);
  } else {
    console.log("SQLite DBに接続しました");
  }
});

// テーブル作成
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      playerName TEXT NOT NULL,
      clearFloor INTEGER NOT NULL,
      clearTime INTEGER NOT NULL,
      clearTimeAfterParse TEXT NOT NULL,
      date TEXT NOT NULL
    )
  `);
});

module.exports = db;