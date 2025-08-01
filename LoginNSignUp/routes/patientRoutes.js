const express = require('express');
const router = express.Router();
const patientController = require('../controllers/VishalController');

router.post('/signup', patientController.signup);
router.get('/profile/:id', patientController.getProfile);
router.get('/patients', patientController.getAllPatients);
router.put('/profile/:id', patientController.updateProfile);

module.exports = router;
