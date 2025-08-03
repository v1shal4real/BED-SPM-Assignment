const express = require('express');
const router = express.Router();
const ecController = require('../controller/emergencyContactController');
const validation = require('../middleware/validationMiddleware');


router.get('/:patientId', ecController.getContacts);
router.get('/', ecController.getAllContacts);
router.post('/', validation.validateEmergencyContact, ecController.addContact);
router.put('/:contactId', validation.validateEmergencyContact, ecController.updateContact);
router.delete('/:contactId', ecController.deleteContact);

module.exports = router;
