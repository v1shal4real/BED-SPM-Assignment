const sql = require('mssql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dbConfig = require('../../dbConfig');

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    let pool = await sql.connect(dbConfig);

    // Check Patients table
    let result = await pool.request()
      .input('Email', sql.NVarChar, email)
      .query('SELECT * FROM Patients WHERE Email = @Email');

    let user = result.recordset[0];
    if (user) {
      const isMatch = await bcrypt.compare(password, user.PasswordHash);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      const token = jwt.sign(
        { id: user.PatientID, email: user.Email, role: 'patient' },
        JWT_SECRET,
        { expiresIn: '1h' }
      );
      return res.status(200).json({ token, id: user.PatientID, role: 'patient' });
    }

    // If not in Patients, check Doctors table
    result = await pool.request()
      .input('Email', sql.NVarChar, email)
      .query('SELECT * FROM Doctors WHERE EmailAddress = @Email');

    user = result.recordset[0];
    if (user) {
      const isMatch = await bcrypt.compare(password, user.PasswordHash);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      const token = jwt.sign(
        { id: user.DoctorID, email: user.EmailAddress, role: 'doctor' },
        JWT_SECRET,
        { expiresIn: '1h' }
      );
      return res.status(200).json({ token, id: user.DoctorID, role: 'doctor' });
    }

    // Not found in either table
    res.status(401).json({ message: 'Invalid email or password' });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
