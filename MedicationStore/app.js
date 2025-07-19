// app.js
const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const sql = require("mssql");
dotenv.config();

const {
  fetchAllMeds,
  createMed,
  updateMed,
  deleteMed
} = require("./controller/KhairiController");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// serve your frontend
app.use(express.static(path.join(__dirname, "FrontEnd/html")));
app.use(express.static(path.join(__dirname, "public")));

// --- Medications routes ---
app.get   ("/medications",      fetchAllMeds);
app.post  ("/medications",      createMed);
app.put   ("/medications/:id",  updateMed);
app.delete("/medications/:id",  deleteMed);

app.listen(port, () =>
  console.log(`Server listening on http://localhost:${port}`)
);

process.on("SIGINT", async () => {
  console.log("Shutting down…");
  await sql.close();
  process.exit(0);
});
