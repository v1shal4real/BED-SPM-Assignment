const Joi = require('joi');
const bcrypt = require('bcryptjs');

const patientModel = require('../model/patientModel');

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

    const salt = await bcrypt.genSalt(10);
    value.password = await bcrypt.hash(value.password, salt);

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

    if (profile.DateOfBirth && profile.DateOfBirth.toISOString) {
      profile.DateOfBirth = profile.DateOfBirth.toISOString().split('T')[0];
    }

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
  
    await patientModel.updatePatient(patientId, req.body);
    res.json({ message: "Profile updated successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error updating profile." });
  }
};

exports.resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) {
    return res.status(400).json({ message: "Email and new password are required." });
  }

  try {
    // Check if patient exists
    let pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('Email', sql.NVarChar, email)
      .query('SELECT * FROM Patients WHERE Email = @Email');
    const patient = result.recordset[0];
    if (!patient) {
      return res.status(404).json({ message: "No user found with that email." });
    }

    // Hash new password
    const hash = await bcrypt.hash(newPassword, 10);

    // Update password in DB
    await patientModel.updatePasswordByEmail(email, hash);

    res.json({ message: "Password reset successful!" });
  } catch (err) {
    console.error("Password reset error:", err);
    res.status(500).json({ message: "Server error during password reset." });
  }
};