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

        const updatedMedication = await JcModels.updateMedication(PatientID, {MedicationID, DayOfWeek, TimeOfDay, Quantity});
        if (!updatedMedication) {
            return res.status(404).json({ error: "No Medication record found." });
        }
        res.json(updatedMedication);
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({ error: "Unable to update tracker" });
    }
}

module.exports = {
    getAllMedications,
    createMedication,
    updateMedication
};