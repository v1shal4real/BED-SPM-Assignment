const express = require("express");
const path = require("path");
const sql = require("mssql");
const dotenv = require("dotenv");
// Load environment variables
dotenv.config();

const cyController = require("./controller/CyController");

const app = express();
const PORT = process.env.PORT || 3000;

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// API Routes
app.get('/patients', cyController.getAllPatients);
app.get('/patients/:id', cyController.getPatientById);

// Medical Records routes
app.get('/records/patient/:id', cyController.getAppointmentRecord);
app.put('/records/:id', cyController.updateAppointmentRecord);
app.delete('/records/:id', cyController.deleteAppointmentRecord);

// Doctor routes
app.get('/doctors', cyController.getAllDoctors);

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