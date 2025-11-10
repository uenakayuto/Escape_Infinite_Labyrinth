const express = require("express");
const db = require("../db/database");

const router = express.Router();

// データ登録（ランキング上位5件保持）
router.post("/", (req, res) => {
  const { playerName, clearFloor, clearTime, clearTimeAfterParse, date } = req.body;

  if (!playerName || clearFloor === undefined || clearTime === undefined || !clearTimeAfterParse || !date) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  db.serialize(() => {
    db.run("BEGIN TRANSACTION");

    // 新しいスコアを挿入
    db.run(
      `INSERT INTO scores (playerName, clearFloor, clearTime, clearTimeAfterParse, date)
       VALUES (?, ?, ?, ?, ?)`,
      [playerName, clearFloor, clearTime, clearTimeAfterParse, date],
      function (err) {
        if (err) {
          db.run("ROLLBACK");
          return res.status(500).json({ error: err.message });
        }

        // ランキング取得
        db.all(
          `SELECT id, clearFloor, clearTime, date FROM scores
           ORDER BY clearFloor DESC, clearTime ASC, date ASC`,
          [],
          (err, rows) => {
            if (err) {
              db.run("ROLLBACK");
              return res.status(500).json({ error: err.message });
            }

            // 6件以上なら不要なものを削除
            if (rows.length > 5) {
              const idsToDelete = rows.slice(5).map(r => r.id);
              const placeholders = idsToDelete.map(() => "?").join(",");

              db.run(
                `DELETE FROM scores WHERE id IN (${placeholders})`,
                idsToDelete,
                (err2) => {
                  if (err2) {
                    db.run("ROLLBACK");
                    return res.status(500).json({ error: err2.message });
                  }

                  db.run("COMMIT");
                  res.json(rows.slice(0, 5));
                }
              );
            } else {
              db.run("COMMIT");
              res.json(rows);
            }
          }
        );
      }
    );
  });
});

module.exports = router;
