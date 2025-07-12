const express = require("express");
const path = require("path");
const sql = require("mssql");
const dotenv = require("dotenv");
// Load environment variables
dotenv.config();

const cyController = require("./controller/CyController");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// API Routes
// Patient routes
app.get('/api/patients', cyController.getAllPatients);
app.get('/api/patients/:id', cyController.getPatientById);
app.put('/api/patients/:id', cyController.updatePatient);
app.delete('/api/patients/:id', cyController.deletePatient);

// Appointment routes
app.get('/api/patients/:id/appointments', cyController.getPatientAppointments);
app.put('/api/appointments/:id', cyController.updateAppointment);
app.delete('/api/appointments/:id', cyController.deleteAppointment);

// Doctor routes
app.get('/api/doctors', cyController.getAllDoctors);

// Start server
app.listen(PORT, () => {
    console.log(`Medical Records server running on port ${PORT}`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Server is gracefully shutting down");
  await sql.close();
  console.log("Database connections closed");
  process.exit(0);
});