const sql = require('mssql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dbConfig = require('../dbConfig');

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    let pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('Email', sql.NVarChar, email)
      .query('SELECT * FROM Patients WHERE Email = @Email');

    const user = result.recordset[0];
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    const isMatch = await bcrypt.compare(password, user.PasswordHash);
    console.log('Passwords match:', isMatch);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { patientId: user.PatientID, email: user.Email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ message: 'Login successful', token, patientId: user.PatientID });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
