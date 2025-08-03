// app.js
const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const sql = require("mssql");
const multer = require("multer");

dotenv.config();

const upload = multer({ dest: "/tmp" });

const {
  fetchAllMeds,
  fetchOneMed,
  createMed,
  updateMed,
  deleteMed
} = require("./controller/KhairiController");

const {
  addOrUpdateCart,
  getCart,
  updateCart,
  removeFromCart
} = require("./controller/cartController");

const app = express();
const port = process.env.PORT || 3000;

// ─── Middleware ────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Medications Routes ────────────────────────────────────────
app.get   ("/medications",      fetchAllMeds);
app.get   ("/medications/:id",  fetchOneMed);
app.post  ("/medications",      upload.single("image"), createMed);
app.put   ("/medications/:id",  upload.single("image"), updateMed);
app.delete("/medications/:id",  deleteMed);

// ─── Cart Routes ───────────────────────────────────────────────
app.post   ("/api/cart",         addOrUpdateCart);      // Add or update (upsert) a medication in the cart
app.get    ("/api/cart/:userId", getCart);              // View all items in a user’s cart
app.put    ("/api/cart/update",  updateCart);           // Manually update quantity
app.delete ("/api/cart/delete",  removeFromCart);       // Remove an item from the cart

// ─── Static Files ──────────────────────────────────────────────
app.use(express.static(path.join(__dirname, "../FrontEnd/html")));
app.use(express.static(path.join(__dirname, "public")));
app.use("/css", express.static(path.join(__dirname, "../FrontEnd/css")));

// ─── Server Startup & Shutdown ────────────────────────────────
app.listen(port, () =>
  console.log(`Server listening on http://localhost:${port}`)
);

process.on("SIGINT", async () => {
  console.log("Shutting down…");
  await sql.close();
  process.exit(0);
});