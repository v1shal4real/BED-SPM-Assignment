
const Joi = require('joi');
const patientModel = require('../models/patientModel');

const signupSchema = Joi.object({
  fullName: Joi.string().max(100).required(),
  dateOfBirth: Joi.date().required(),
  contactNumber: Joi.string().max(20).required(),
  email: Joi.string().email().max(100).required(),
  address: Joi.string().max(200).required(),
  password: Joi.string().min(6).max(255).required(),
});

exports.signup = async (req, res) => {
  try {
    const { error, value } = signupSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const patientId = await patientModel.addPatient(value);

    res.status(201).json({ message: 'Sign up successful!', patientId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error signing up.' });
  }
};


exports.getProfile = async (req, res) => {
  try {
    const patientId = req.params.id;
    const profile = await patientModel.getPatientById(patientId);
    if (!profile) return res.status(404).json({ error: 'Patient not found' });
    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching profile.' });
  }
};
exports.getAllPatients = async (req, res) => {
  try {
    const patients = await patientModel.getAllPatients();
    res.json(patients);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching patients.' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const patientId = req.params.id;
    // You can add Joi validation here if you wish
    await patientModel.updatePatient(patientId, req.body);
    res.json({ message: "Profile updated successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error updating profile." });
  }
};
