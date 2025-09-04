const express = require("express");
const cors = require("cors");
const registerRecordRouter = require("./routes/registerRecord");
const fetchRecordRouter = require("./routes/fetchRecord");
const healthCheckRouter = require("./routes/healthCheck");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API のルーティング
app.use("/api/register", registerRecordRouter);
app.use("/api/fetch", fetchRecordRouter);
app.use("/api/health", healthCheckRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});