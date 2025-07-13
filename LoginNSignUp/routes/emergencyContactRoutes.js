const express = require('express');
const router = express.Router();
const ecController = require('../controllers/emergencyContactController');

router.get('/:patientId', ecController.getContacts);
router.get('/', ecController.getAllContacts);
router.post('/', ecController.addContact);
router.put('/:contactId', ecController.updateContact);
router.delete('/:contactId', ecController.deleteContact);

module.exports = router;
