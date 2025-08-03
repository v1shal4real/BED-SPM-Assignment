const healthModel = require("../model/healthTrackerModel");

// List all entries for patient
async function getHealthEntriesByPatientID(req, res) {
  try {
    const patientID = parseInt(req.params.id, 10);
    if (isNaN(patientID) || patientID <= 0) return res.status(400).json({ error: "Invalid patient ID" });
    const entries = await healthModel.getHealthEntriesByPatientID(patientID);
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: "Error retrieving health data" });
  }
}

// Add new entry
async function createHealthEntry(req, res) {
  try {
    const { PatientID, Date, BloodPressure, BloodSugar, BloodOxygen, HeartRate, Calories } = req.body;
    if (!PatientID || !Date) return res.status(400).json({ error: "Missing required fields." });
    const entry = await healthModel.createHealthEntry({
      PatientID, Date, BloodPressure, BloodSugar, BloodOxygen, HeartRate, Calories
    });
    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ error: "Error creating health entry" });
  }
}

// Update entry
async function updateHealthEntry(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) return res.status(400).json({ error: "Invalid tracker ID" });
    const { Date, BloodPressure, BloodSugar, BloodOxygen, HeartRate, Calories } = req.body;
    const updated = await healthModel.updateHealthEntry(id, {
      Date, BloodPressure, BloodSugar, BloodOxygen, HeartRate, Calories
    });
    if (!updated) return res.status(404).json({ error: "Entry not found" });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Error updating entry" });
  }
}

// Delete entry
async function deleteHealthEntry(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) return res.status(400).json({ error: "Invalid tracker ID" });
    const success = await healthModel.deleteHealthEntry(id);
    if (!success) return res.status(404).json({ error: "Entry not found" });
    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting entry" });
  }
}

module.exports = {
  getHealthEntriesByPatientID,
  createHealthEntry,
  updateHealthEntry,
  deleteHealthEntry
};
