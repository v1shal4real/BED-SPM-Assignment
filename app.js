const express = require('express');
const sql = require('mssql');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
dotenv.config();

const medicationController = require('../BED-SPM-Assignment/MedicalTracker/controller/JcController'); // Adjust the path as necessary
//const {
//    validateMedication,
//    validatePatientID,
//} = require('../BED-SPM-Assignment/middleware/medicalValidation'); 

const app = express();
const port = process.env.PORT || 3000;


app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(express.static(path.join(__dirname, 'public'))); 
app.use(cors()); 


// Routes for Tracker
app.get('/Tracker', medicationController.getAllMedications);
app.post('/Tracker', medicationController.createMedication); 
app.put('/Tracker/:PatientID/:MedicationID', medicationController.updateMedication);


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