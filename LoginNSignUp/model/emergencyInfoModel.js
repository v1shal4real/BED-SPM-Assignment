const sql = require('mssql');

// Upsert Emergency Info (create if not exists, else update)
exports.upsertEmergencyInfo = async (patientId, data) => {
  let result = await sql.query`
    UPDATE EmergencyInfo
    SET DateOfBirth = ${data.dateOfBirth},
        BloodType = ${data.bloodType},
        ChronicConditions = ${data.chronicConditions},
        Allergies = ${data.allergies},
        DoctorEmail = ${data.doctorEmail}
    WHERE PatientID = ${patientId}
  `;
  if (result.rowsAffected[0] === 0) {
    await sql.query`
      INSERT INTO EmergencyInfo (PatientID, DateOfBirth, BloodType, ChronicConditions, Allergies, DoctorEmail)
      VALUES (${patientId}, ${data.dateOfBirth}, ${data.bloodType}, ${data.chronicConditions}, ${data.allergies}, ${data.doctorEmail})
    `;
  }
};

// Get Emergency Info + Patient Name
exports.getEmergencyInfo = async (patientId) => {
  const result = await sql.query`
    SELECT ei.*, p.FullName
    FROM EmergencyInfo ei
    JOIN Patients p ON ei.PatientID = p.PatientID
    WHERE ei.PatientID = ${patientId}
  `;
  return result.recordset[0];
};

// Delete Emergency Info
exports.deleteEmergencyInfo = async (patientId) => {
  await sql.query`
    DELETE FROM EmergencyInfo WHERE PatientID = ${patientId}
  `;
};
