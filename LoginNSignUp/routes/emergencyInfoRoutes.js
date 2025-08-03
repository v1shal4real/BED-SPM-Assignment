const express = require('express');
const router = express.Router();
const emergencyInfoController = require('../controller/emergencyInfoController');

// Doctor can create/update/delete emergency info for a patient
router.put('/:patientId', emergencyInfoController.saveEmergencyInfo);
router.delete('/:patientId', emergencyInfoController.deleteEmergencyInfo);

// Both doctor and patient can read (view) emergency info
router.get('/:patientId', emergencyInfoController.getEmergencyInfo);

module.exports = router;
