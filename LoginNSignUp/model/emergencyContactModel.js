const sql = require('mssql');
const dbConfig = require('../dbConfig');

exports.getContactsByPatientId = async (patientId) => {
  let pool = await sql.connect(dbConfig);
  let result = await pool.request()
    .input('PatientID', sql.Int, patientId)
    .query('SELECT * FROM EmergencyContacts WHERE PatientID = @PatientID');
  return result.recordset;
};

exports.getAllContacts = async () => {
  let pool = await sql.connect(dbConfig);
  let result = await pool.request()
    .query('SELECT * FROM EmergencyContacts');
  return result.recordset;
};

exports.addContact = async (contact) => {
  let pool = await sql.connect(dbConfig);
  await pool.request()
    .input('PatientID', sql.Int, contact.patientId)
    .input('ContactName', sql.NVarChar, contact.name)
    .input('Relationship', sql.NVarChar, contact.relationship)
    .input('ContactNumber', sql.NVarChar, contact.contactNumber)
    .query(`
      INSERT INTO EmergencyContacts (PatientID, ContactName, Relationship, ContactNumber)
      VALUES (@PatientID, @ContactName, @Relationship, @ContactNumber)
    `);
  return true;
};

exports.updateContact = async (contactId, contact) => {
  let pool = await sql.connect(dbConfig);
  await pool.request()
    .input('ContactID', sql.Int, contactId)
    .input('ContactName', sql.NVarChar, contact.name)
    .input('Relationship', sql.NVarChar, contact.relationship)
    .input('ContactNumber', sql.NVarChar, contact.contactNumber)
    .query(`
      UPDATE EmergencyContacts
      SET ContactName = @ContactName,
          Relationship = @Relationship,
          ContactNumber = @ContactNumber
      WHERE ContactID = @ContactID
    `);
  return true;
};

exports.deleteContact = async (contactId) => {
  let pool = await sql.connect(dbConfig);
  await pool.request()
    .input('ContactID', sql.Int, contactId)
    .query('DELETE FROM EmergencyContacts WHERE ContactID = @ContactID');
  return true;
};
