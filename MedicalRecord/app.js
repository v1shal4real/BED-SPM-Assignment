const express = require("express");
const path = require("path");
const sql = require("mssql");
const dotenv = require("dotenv");
// Load environment variables
dotenv.config();

const cyController = require("./controller/CyController");
const {
  validate,
  handleValidationError
} = require("./middleware/CyValidation");

const app = express();
const PORT = process.env.PORT || 3000;

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// API Routes
app.get('/patients', cyController.getAllPatients);
app.get('/patients/:id', validate.patientId, cyController.getPatientById);

// Medical Records routes
app.get('/records/patient/:id', validate.patientId, cyController.getAppointmentRecord);
app.put('/records/:id', validate.recordId, validate.recordUpdateData, cyController.updateAppointmentRecord);
app.delete('/records/:id', validate.recordId, cyController.deleteAppointmentRecord);

// Medical Detials
app.get('/medical-details/patient/:id', validate.patientId, cyController.getMedicalDetailsByPatient);
app.post('/medical-details', cyController.createMedicalDetail);
app.put('/medical-details/:id', cyController.updateMedicalDetail);
app.delete('/medical-details/:id', cyController.deleteMedicalDetail);

// Doctor routes
app.get('/doctors', cyController.getAllDoctors);

// Error handling
app.use(handleValidationError);

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