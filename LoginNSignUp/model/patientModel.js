const sql = require('mssql');
const dbConfig = require('../../dbConfig');

exports.addPatient = async (patient) => {
  const sql = require('mssql');
  const dbConfig = require('../../dbConfig');
  let pool = await sql.connect(dbConfig);
  let result = await pool.request()
    .input('FullName', sql.NVarChar, patient.fullName)
    .input('DateOfBirth', sql.Date, patient.dateOfBirth)
    .input('ContactNumber', sql.NVarChar, patient.contactNumber)
    .input('Email', sql.NVarChar, patient.email)
    .input('Address', sql.NVarChar, patient.address)
    .input('PasswordHash', sql.NVarChar, patient.password)
    .query(`
      INSERT INTO Patients (FullName, DateOfBirth, ContactNumber, Email, Address, PasswordHash)
      OUTPUT INSERTED.PatientID
      VALUES (@FullName, @DateOfBirth, @ContactNumber, @Email, @Address, @PasswordHash)
    `);
  return result.recordset[0].PatientID;
};


exports.getPatientById = async (patientId) => {
  let pool = await sql.connect(dbConfig);
  let result = await pool.request()
    .input('PatientID', sql.Int, patientId)
    .query('SELECT PatientID, FullName, DateOfBirth, ContactNumber, Email, Address FROM Patients WHERE PatientID = @PatientID');
  return result.recordset[0];
};
exports.getAllPatients = async () => {
  const sql = require('mssql');
  const dbConfig = require('../../dbConfig');
  let pool = await sql.connect(dbConfig);
  let result = await pool.request()
    .query('SELECT PatientID, FullName, DateOfBirth, ContactNumber, Email, Address FROM Patients');
  return result.recordset;
};

exports.updatePatient = async (patientId, patient) => {
  const sql = require('mssql');
  const dbConfig = require('../../dbConfig');
  let pool = await sql.connect(dbConfig);
  await pool.request()
    .input('PatientID', sql.Int, patientId)
    .input('FullName', sql.NVarChar, patient.fullName)
    .input('DateOfBirth', sql.Date, patient.dateOfBirth)
    .input('ContactNumber', sql.NVarChar, patient.contactNumber)
    .input('Email', sql.NVarChar, patient.email)
    .input('Address', sql.NVarChar, patient.address)
    .query(`
      UPDATE Patients SET
        FullName = @FullName,
        DateOfBirth = @DateOfBirth,
        ContactNumber = @ContactNumber,
        Email = @Email,
        Address = @Address
      WHERE PatientID = @PatientID
    `);
  return true;
};
