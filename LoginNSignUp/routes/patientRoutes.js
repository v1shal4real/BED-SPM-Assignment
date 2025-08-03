const express = require('express');
const router = express.Router();
const patientController = require('../controller/patientController');
const validation = require('../middleware/validationMiddleware');


router.post('/signup', validation.validateSignup, patientController.signup);
router.get('/profile/:id', patientController.getProfile);
router.get('/patients', patientController.getAllPatients);
router.put('/profile/:id', validation.validateProfileEdit, patientController.updateProfile);
router.post('/patients/reset-password', patientController.resetPassword);

module.exports = router;
