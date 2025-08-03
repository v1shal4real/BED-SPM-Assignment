const express = require('express');
const router = express.Router();
const emergencyInfoController = require('../controller/emergencyInfoController');
const validation = require('../middleware/validationMiddleware');


router.put('/:patientId', validation.validateEmergencyInfo, emergencyInfoController.saveEmergencyInfo);
router.delete('/:patientId', emergencyInfoController.deleteEmergencyInfo);
router.get('/:patientId', emergencyInfoController.getEmergencyInfo);

module.exports = router;
