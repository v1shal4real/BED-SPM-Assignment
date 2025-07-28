const express = require('express');
const sql = require('mssql');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
dotenv.config();

const medicationController = require('../BED-SPM-Assignment_Jack/MedicalTracker/controller/JcController');
const {
    validateTracker,
    validateTrackerID,
    validatePatientnMedicationID,
    validatePatientID,
} = require('../BED-SPM-Assignment_Jack/middleware/medicalValidation'); 

const app = express();
const port = process.env.PORT || 3000;


app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(express.static(path.join(__dirname, '../BED-SPM-Assignment_Jack/FrontEnd'))); 
app.use(cors()); 


// Routing for Tracker
app.get('/Tracker',medicationController.getAllMedications);
app.get('/Tracker/:PatientID', validatePatientID ,medicationController.getMedicationById);
app.post('/Tracker', validateTracker ,medicationController.createMedication); 
app.put('/Tracker/:PatientID/:MedicationID', validatePatientnMedicationID ,medicationController.updateMedication);
app.delete('/Tracker/:PatientID/:MedicationID', validatePatientnMedicationID ,medicationController.deleteMedication);


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Click http://localhost:${port}`);
});


process.on('SIGINT', async () => {
    console.log('Server is gracefully shutting down');
    await sql.close();
    console.log('Database connections closed');
    process.exit(0);
});