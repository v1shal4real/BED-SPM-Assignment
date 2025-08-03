const sql = require("mssql");
const dbConfig = require("../../dbConfig");

// Create new health entry
async function createHealthEntry(data) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
      INSERT INTO HealthTrackers (PatientID, Date, BloodPressure, BloodSugar, BloodOxygen, HeartRate, Calories)
      VALUES (@PatientID, @Date, @BloodPressure, @BloodSugar, @BloodOxygen, @HeartRate, @Calories);
      SELECT SCOPE_IDENTITY() AS id;
    `;
    const req = connection.request();
    req.input("PatientID", data.PatientID);
    req.input("Date", data.Date);
    req.input("BloodPressure", data.BloodPressure);
    req.input("BloodSugar", data.BloodSugar);
    req.input("BloodOxygen", data.BloodOxygen);
    req.input("HeartRate", data.HeartRate);
    req.input("Calories", data.Calories);

    const result = await req.query(query);
    const newId = result.recordset[0].id;
    return await getHealthEntryById(newId);
  } catch (error) {
    throw error;
  } finally {
    if (connection) try { await connection.close(); } catch (e) {}
  }
}

// Get all health entries by PatientID (newest first)
async function getHealthEntriesByPatientID(patientID) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
      SELECT * FROM HealthTrackers
      WHERE PatientID = @patientID
      ORDER BY Date DESC
    `;
    const req = connection.request();
    req.input("patientID", patientID);
    const result = await req.query(query);
    return result.recordset;
  } catch (error) { throw error; }
  finally { if (connection) try { await connection.close(); } catch (e) {} }
}

// Get single entry by ID
async function getHealthEntryById(id) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
      SELECT * FROM HealthTrackers
      WHERE TrackerID = @id
    `;
    const req = connection.request();
    req.input("id", id);
    const result = await req.query(query);
    return result.recordset[0] || null;
  } catch (error) { throw error; }
  finally { if (connection) try { await connection.close(); } catch (e) {} }
}

// Update entry (date+fields)
async function updateHealthEntry(id, data) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
      UPDATE HealthTrackers
      SET Date = @Date,
          BloodPressure = @BloodPressure,
          BloodSugar = @BloodSugar,
          BloodOxygen = @BloodOxygen,
          HeartRate = @HeartRate,
          Calories = @Calories
      WHERE TrackerID = @id
    `;
    const req = connection.request();
    req.input("id", id);
    req.input("Date", data.Date);
    req.input("BloodPressure", data.BloodPressure);
    req.input("BloodSugar", data.BloodSugar);
    req.input("BloodOxygen", data.BloodOxygen);
    req.input("HeartRate", data.HeartRate);
    req.input("Calories", data.Calories);

    const result = await req.query(query);
    if (result.rowsAffected[0] === 0) return null;
    return await getHealthEntryById(id);
  } catch (error) { throw error; }
  finally { if (connection) try { await connection.close(); } catch (e) {} }
}

// Delete entry
async function deleteHealthEntry(id) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = "DELETE FROM HealthTrackers WHERE TrackerID = @id";
    const req = connection.request();
    req.input("id", id);
    const result = await req.query(query);
    return result.rowsAffected[0] > 0;
  } catch (error) { throw error; }
  finally { if (connection) try { await connection.close(); } catch (e) {} }
}

module.exports = {
  createHealthEntry,
  getHealthEntriesByPatientID,
  getHealthEntryById,
  updateHealthEntry,
  deleteHealthEntry
};
