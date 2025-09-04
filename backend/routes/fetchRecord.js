const express = require("express");
const db = require("../db/database");

const router = express.Router();

// トップ5スコア取得
router.get("/", (req, res) => {
  db.all(
    `SELECT playerName, clearFloor, clearTimeAfterParse
     FROM scores
     ORDER BY clearFloor DESC, clearTime ASC, date ASC
     LIMIT 5`,
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json(rows);
    }
  );
});

module.exports = router;