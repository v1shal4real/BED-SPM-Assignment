const path = require("path");
const express = require("express");
const sql = require("mssql");
const dotenv = require("dotenv");

dotenv.config(); // Load environment variables FIRST

const dbConfig = require('./dbConfig');


const app = express();
const port = process.env.PORT || 3000;


sql.connect(dbConfig)
  .then(pool => {
    console.log('Connected to MSSQL database');
    // pool.close(); // Optional: close if you only want to test
  })
  .catch(err => {
    console.error('Database connection failed:', err);
  });
app.use(express.json());

// CRUD ENDPOINTS FOR PATIENTS

// CREATE - Add new patient
app.post('/api/patients', async (req, res) => {
  const { fullName, dob, phone, email, address, password } = req.body;
  try {
    const result = await sql.query`
      INSERT INTO Patients (FullName, DateOfBirth, ContactNumber, Email, Address, PasswordHash)
      VALUES (${fullName}, ${dob}, ${phone}, ${email}, ${address}, ${password});
    `;
    res.status(201).json({ message: 'Patient registered successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ - Get all patients
app.get('/api/patients', async (req, res) => {
  try {
    const result = await sql.query`SELECT * FROM Patients`;
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ - Get a single patient by id
app.get('/api/patients/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await sql.query`SELECT * FROM Patients WHERE Id = ${id}`;
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE - Update a patient by id
app.put('/api/patients/:id', async (req, res) => {
  const { id } = req.params;
  const { fullName, dob, phone, email, address, password } = req.body;
  try {
    await sql.query`
      UPDATE Patients
      SET FullName = ${fullName},
          DateOfBirth = ${dob},
          ContactNumber = ${phone},
          Email = ${email},
          Address = ${address},
          PasswordHash = ${password}
      WHERE Id = ${id}
    `;
    res.json({ message: 'Patient updated successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE - Remove a patient by id
app.delete('/api/patients/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await sql.query`DELETE FROM Patients WHERE Id = ${id}`;
    res.json({ message: 'Patient deleted successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Server is gracefully shutting down");
  await sql.close();
  console.log("Database connections closed");
  process.exit(0);
});