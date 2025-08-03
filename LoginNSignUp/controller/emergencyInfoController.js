const emergencyInfoModel = require('../model/emergencyInfoModel');

// Create/Update (Upsert)
exports.saveEmergencyInfo = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { dateOfBirth, bloodType, chronicConditions, allergies, doctorEmail } = req.body;
    await emergencyInfoModel.upsertEmergencyInfo(patientId, {
      dateOfBirth,
      bloodType,
      chronicConditions,
      allergies,
      doctorEmail
    });
    res.json({ message: 'Emergency info saved!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save emergency info.' });
  }
};

// Get Info
exports.getEmergencyInfo = async (req, res) => {
  try {
    const { patientId } = req.params;
    const info = await emergencyInfoModel.getEmergencyInfo(patientId);
    if (!info) return res.json({});
    res.json(info);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get emergency info.' });
  }
};

// Delete Info
exports.deleteEmergencyInfo = async (req, res) => {
  try {
    const { patientId } = req.params;
    await emergencyInfoModel.deleteEmergencyInfo(patientId);
    res.json({ message: 'Emergency info deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete emergency info.' });
  }
};
