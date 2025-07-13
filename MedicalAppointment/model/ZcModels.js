const sql = require("mssql");
const dbConfig = require("../../dbConfig");


// Get all appointments (with names)
async function getAllAppointments() {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
      SELECT 
        a.AppointmentID, a.PatientID, p.FullName AS PatientName, a.DoctorID, d.FullName AS DoctorName, 
        a.AppointmentDateTime, a.Venue, a.RoomNumber
      FROM Appointments a
      JOIN Patients p ON a.PatientID = p.PatientID
      JOIN Doctors d ON a.DoctorID = d.DoctorID
    `;
    const result = await connection.request().query(query);
    return result.recordset;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) {
      try { await connection.close(); } catch (err) { console.error("Error closing connection:", err); }
    }
  }
}

// Get appointment by ID (with names)
async function getAppointmentById(id) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
      SELECT 
        a.AppointmentID, a.PatientID, p.FullName AS PatientName, a.DoctorID, d.FullName AS DoctorName,
        a.AppointmentDateTime, a.Venue, a.RoomNumber
      FROM Appointments a
      JOIN Patients p ON a.PatientID = p.PatientID
      JOIN Doctors d ON a.DoctorID = d.DoctorID
      WHERE a.AppointmentID = @id
    `;
    const request = connection.request();
    request.input("id", id);
    const result = await request.query(query);

    if (result.recordset.length === 0) return null;
    return result.recordset[0];
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) {
      try { await connection.close(); } catch (err) { console.error("Error closing connection:", err); }
    }
  }
}

// Create new appointment
async function createAppointment(data) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
      INSERT INTO Appointments (PatientID, DoctorID, AppointmentDateTime, Venue, RoomNumber)
      VALUES (@PatientID, @DoctorID, @AppointmentDateTime, @Venue, @RoomNumber);
      SELECT SCOPE_IDENTITY() AS id;
    `;
    const req = connection.request();
    req.input("PatientID", data.PatientID);
    req.input("DoctorID", data.DoctorID);
    req.input("AppointmentDateTime", data.AppointmentDateTime);
    req.input("Venue", data.Venue);
    req.input("RoomNumber", data.RoomNumber);

    const result = await req.query(query);
    const newId = result.recordset[0].id;
    return await getAppointmentById(newId); // Return full new appointment object
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) {
      try { await connection.close(); } catch (err) { console.error("Error closing connection:", err); }
    }
  }
}

// Update appointment (date/time only for simplicity)
async function updateAppointment(id, data) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
      UPDATE Appointments
      SET AppointmentDateTime = @AppointmentDateTime
      WHERE AppointmentID = @id
    `;
    const req = connection.request();
    req.input("id", id);
    req.input("AppointmentDateTime", data.AppointmentDateTime);

    const result = await req.query(query);
    if (result.rowsAffected[0] === 0) return null;
    return await getAppointmentById(id);
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) {
      try { await connection.close(); } catch (err) { console.error("Error closing connection:", err); }
    }
  }
}

// Delete appointment
async function deleteAppointment(id) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = "DELETE FROM Appointments WHERE AppointmentID = @id";
    const req = connection.request();
    req.input("id", id);
    const result = await req.query(query);
    if (result.rowsAffected[0] === 0) return null;
    return true;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) {
      try { await connection.close(); } catch (err) { console.error("Error closing connection:", err); }
    }
  }
}

// Helper: Find last-used doctor for patient
async function getLastAppointmentByPatientID(patientID) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
      SELECT TOP 1 DoctorID
      FROM Appointments
      WHERE PatientID = @patientID
      ORDER BY AppointmentDateTime DESC
    `;
    const req = connection.request();
    req.input("patientID", patientID);
    const result = await req.query(query);
    return result.recordset[0] || null;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) {
      try { await connection.close(); } catch (err) { console.error("Error closing connection:", err); }
    }
  }
}

// Helper: Pick a random doctor
async function getRandomDoctorID() {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `SELECT DoctorID FROM Doctors`;
    const result = await connection.request().query(query);
    const ids = result.recordset.map(r => r.DoctorID);
    return ids[Math.floor(Math.random() * ids.length)];
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) {
      try { await connection.close(); } catch (err) { console.error("Error closing connection:", err); }
    }
  }
}

module.exports = {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getLastAppointmentByPatientID,
  getRandomDoctorID,
};
