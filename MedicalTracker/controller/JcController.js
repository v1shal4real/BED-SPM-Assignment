const JcModels = require('../model/JcModels'); 
const cloudinary = require('cloudinary').v2;
const sql = require('mssql');
const dbConfig = require('../../dbConfig');

// get all medication
async function getAllMedications(req, res) {
    try {
        const medication = await JcModels.getAllMedications();
        res.json(medication);
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({ error: "Error retrieving medications" });
    }
}

//get medication by Patient ID
async function getMedicationById(req, res) {
    try {
        const PatientID = parseInt(req.params.PatientID);
        
        if (isNaN(PatientID) || PatientID <= 0) {
            return res.status(400).json({ 
                error: 'Invalid Patient ID',
                received: req.params.PatientID,
                parsed: PatientID
            });
        }
        
        const medications = await JcModels.getMedicationById(PatientID);
        
        if (!medications || medications.length === 0) {
            return res.status(404).json({ 
                error: 'No medications found for this patient',
                patientId: PatientID 
            });
        }
        
        res.status(200).json(medications);
        
    } catch (error) {
        console.error('Error in getMedicationById:', error);
        res.status(500).json({ 
            error: 'Internal server error', 
            details: error.message
        });
    }
}

// create medication
async function createMedication(req, res) {
    try {
         let imageUrl = null;
        if (req.body.image) { 
            const uploadRes = await cloudinary.uploader.upload(req.body.image, {
                folder: "medications"
            });
            imageUrl = uploadRes.secure_url;
        }
        const newMedication = await JcModels.createMedication({
            ...req.body, 
            imageURL: imageUrl,
            MedicationName: req.body.MedicationName || null
        });
        res.status(201).json(newMedication);
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({ error: "Error creating medication" });
    }
}

// update medication
async function updateMedication(req, res) {
    const { PatientID, MedicationID } = req.params;
    const medicationInfo = req.body;
    
    try {
        let imageUrl = medicationInfo.ImageURL;
        if (req.body.image) { 
            const uploadRes = await cloudinary.uploader.upload(req.body.image, {
                folder: "medications"
            });
            imageUrl = uploadRes.secure_url;
            medicationInfo.ImageURL = imageUrl;
        }
        
        const updatedMedication = await JcModels.updateMedication(PatientID, MedicationID, medicationInfo);
        
        if (!updatedMedication) {
            return res.status(404).json({ message: 'Medication not found' });
        }
        
        res.status(200).json(updatedMedication);
    } catch (err) {
        console.error('Error updating medication:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
}

// Delete medication
async function deleteMedication(req, res) {
    try {
        const PatientID = parseInt(req.params.PatientID);
        const MedicationID = parseInt(req.params.MedicationID);
        if (isNaN(PatientID) || isNaN(MedicationID)) {
            return res.status(400).json({ error: "Missing Patient or Medication ID" });
        }

        const deletedMedication = await JcModels.deleteMedication(PatientID, MedicationID);
        if (!deletedMedication) {
            return res.status(404).json({ error: "Medication or Patient ID not found" });
        }

        res.json(deletedMedication);
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({ error: "Problem deleting medication" });
    }
}

async function getMedicationNameById(req, res) {
    try {
        const medicationId = parseInt(req.params.medicationId);
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `SELECT MedicationName FROM Trackers WHERE MedicationID = @MedicationID`;
        const request = connection.request();
        request.input("MedicationID", sql.Int, medicationId);
        const result = await request.query(sqlQuery);
        if (result.recordset.length === 0) {
            return res.status(404).json({ error: "Medication not found" });
        }
        res.json({ MedicationName: result.recordset[0].MedicationName });
    } catch (error) {
        res.status(500).json({ error: "Error fetching medication name" });
    }
}

module.exports = {
    getAllMedications,
    getMedicationById,
    createMedication,
    updateMedication,
    deleteMedication,
    getMedicationNameById,
};