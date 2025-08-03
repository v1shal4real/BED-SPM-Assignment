const express = require("express");
const path = require("path");
const sql = require("mssql");
const dotenv = require("dotenv");
// Load environment variables
dotenv.config();

const loginController = require('../BED-SPM-Assignment/LoginNSignUp/controller/loginController');

const cyController = require("./MedicalRecord/controller/CyController");
const {
  validate,
  handleValidationError
} = require("./MedicalRecord/middleware/CyValidation");

const app = express();
const PORT = process.env.PORT || 3000;

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "FrontEnd")));

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

// login
app.post('/api/login', loginController.login);
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'FrontEnd', 'html', 'login.html'));
});

// Error handling
app.use(handleValidationError);

// Start server
app.listen(PORT, () => {
    console.log(`Medical Records server running on port ${PORT}`);
    console.log(`Click http://localhost:${PORT}`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Server is gracefully shutting down");
  await sql.close();
  console.log("Database connections closed");
  process.exit(0);
});