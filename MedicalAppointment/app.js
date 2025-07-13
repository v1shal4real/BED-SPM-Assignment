const express = require("express");
const sql = require("mssql");
const dotenv = require("dotenv");
const cors = require('cors');
const path = require('path');
dotenv.config();

// Declare app at the TOP before using it!
const app = express();
const port = process.env.PORT || 3000;

const appointmentController = require("./controller/ZcController");
const {
  validateAppointment,
  validateAppointmentId,
} = require("../middleware/medicalValidation");

// Allow CORS for dev/testing (optional if front+back are on same port)
app.use(cors());

// Serve static files from /public (or change if needed)
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CRUD routes
app.get("/appointments", appointmentController.getAllAppointments);
app.get("/appointments/:id", validateAppointmentId, appointmentController.getAppointmentById);
app.post("/appointments", validateAppointment, appointmentController.createAppointment);
app.put("/appointments/:id", validateAppointmentId, validateAppointment, appointmentController.updateAppointment);
app.delete("/appointments/:id", validateAppointmentId, appointmentController.deleteAppointment);

// Optional: redirect root URL to index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

process.on("SIGINT", async () => {
  console.log("Server is gracefully shutting down");
  await sql.close();
  console.log("Database connections closed");
  process.exit(0);
});
