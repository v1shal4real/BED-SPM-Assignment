const JcModels = require('../model/JcModels'); 
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
        if (isNaN(PatientID)) {
            return res.status(400).json({ error: "Invalid Patient ID" });
        }

        const medication = await JcModels.getMedicationById(PatientID);
        if (!medication) {
            return res.status(404).json({ error: "Patient does not exist" });
        }
        res.json(medication);
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({ error: "Error retrieving Patient" });
    }
}

// create medication
async function createMedication(req, res) {
    try {
        const newMedication = await JcModels.createMedication(req.body);
        res.status(201).json(newMedication);
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({ error: "Error creating medication" });
    }
}

// update medication
async function updateMedication(req, res) {
    try {
        const PatientID = parseInt(req.params.PatientID);
        const MedicationID = parseInt(req.params.MedicationID);
        if (isNaN(PatientID) || isNaN(MedicationID)) {
            return res.status(400).json({ error: "Invalid Patient ID or Medication ID" });
        }

        const { DayOfWeek, TimeOfDay, Quantity } = req.body;
        if (!DayOfWeek || !TimeOfDay || !Quantity) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const updatedMedication = await JcModels.updateMedication(PatientID, MedicationID, req.body);
        if (!updatedMedication) {
            return res.status(404).json({ error: "No Medication record found." });
        }
        res.json(updatedMedication);
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({ error: "Unable to update tracker" });
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

module.exports = {
    getAllMedications,
    getMedicationById,
    createMedication,
    updateMedication,
    deleteMedication
};