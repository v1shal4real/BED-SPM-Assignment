const express = require("express");
const sql = require("mssql");
const dotenv = require("dotenv");
const cors = require('cors');
const path = require('path');
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const appointmentController = require("./controller/ZcController");
const {
  validateAppointment,
  validateAppointmentId,
} = require("../middleware/medicalValidation");

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CRUD routes
app.get("/appointments", appointmentController.getAllAppointments);
app.get("/appointments/patient/:id", appointmentController.getAppointmentsByPatientID); // NEW: view for only logged-in user
app.get("/appointments/:id", validateAppointmentId, appointmentController.getAppointmentById);
app.post("/appointments", validateAppointment, appointmentController.createAppointment);
app.put("/appointments/:id", validateAppointmentId, validateAppointment, appointmentController.updateAppointment);
app.delete("/appointments/:id", validateAppointmentId, appointmentController.deleteAppointment);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`http://localhost:${port}/login.html`);
});

process.on("SIGINT", async () => {
  console.log("Server is gracefully shutting down");
  await sql.close();
  console.log("Database connections closed");
  process.exit(0);
});
