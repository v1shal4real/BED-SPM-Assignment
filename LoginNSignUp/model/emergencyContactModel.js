const sql = require('mssql');
const dbConfig = require('../../dbConfig');

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

  // Build dynamic SET clause for only fields provided
  const fields = [];
  if (contact.ContactName !== undefined) {
    fields.push('ContactName = @ContactName');
  }
  if (contact.Relationship !== undefined) {
    fields.push('Relationship = @Relationship');
  }
  if (contact.ContactNumber !== undefined) {
    fields.push('ContactNumber = @ContactNumber');
  }
  if (fields.length === 0) return true; // Nothing to update!

  const setClause = fields.join(', ');
  let request = pool.request()
    .input('ContactID', sql.Int, contactId);

  if (contact.ContactName !== undefined) {
    request.input('ContactName', sql.NVarChar, contact.ContactName);
  }
  if (contact.Relationship !== undefined) {
    request.input('Relationship', sql.NVarChar, contact.Relationship);
  }
  if (contact.ContactNumber !== undefined) {
    request.input('ContactNumber', sql.NVarChar, contact.ContactNumber);
  }

  await request.query(`
    UPDATE EmergencyContacts
    SET ${setClause}
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
