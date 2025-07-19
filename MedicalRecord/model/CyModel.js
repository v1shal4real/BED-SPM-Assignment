const sql = require("mssql");
const dbConfig = require("../../dbConfig");

class CyModel {
    // Get all patients for the main spreadsheet view
    static async getAllPatients() {
        try {
            await sql.connect(dbConfig);
            const result = await sql.query(`
                SELECT 
                    PatientID,
                    FullName,
                    DateOfBirth,
                    ContactNumber,
                    Email,
                    Address
                FROM Patients
                ORDER BY FullName
            `);
            await sql.close();
            return result.recordset;
        } catch (err) {
            console.error('Error fetching all patients:', err);
            await sql.close();
            throw err;
        }
    }

    // Get a specific patient by ID
    static async getPatientById(patientId) {
        try {
            await sql.connect(dbConfig);
            const request = new sql.Request();
            request.input('PatientID', sql.Int, patientId);
            const result = await request.query(`
                SELECT 
                    PatientID,
                    FullName,
                    DateOfBirth,
                    ContactNumber,
                    Email,
                    Address
                FROM Patients
                WHERE PatientID = @PatientID
            `);
            await sql.close();
            return result.recordset[0];
        } catch (err) {
            console.error('Error fetching patient by ID:', err);
            await sql.close();
            throw err;
        }
    }

    // Get all past appointments for a specific patient
    static async getAppointmentRecord(patientId) {
        try {
            await sql.connect(dbConfig);
            const request = new sql.Request();
            request.input('PatientID', sql.Int, patientId);
            const result = await request.query(`
                SELECT 
                    r.RecordID,
                    r.RecordDateTime,
                    r.Venue,
                    r.RoomNumber,
                    d.FullName as DoctorName,
                    d.DoctorID
                FROM MedicalRecords r
                INNER JOIN Doctors d ON r.DoctorID = d.DoctorID
                WHERE r.PatientID = @PatientID
                ORDER BY r.RecordDateTime DESC
            `);
            await sql.close();
            return result.recordset;
        } catch (err) {
            console.error('Error fetching patient records:', err);
            await sql.close();
            throw err;
        }
    }

    // Update past appointments
    static async updateAppointmentRecord(recordId, recordData) {
        try {
            await sql.connect(dbConfig);
            const request = new sql.Request();
            request.input('RecordID', sql.Int, recordId);
            request.input('RecordDateTime', sql.DateTime, recordData.RecordDateTime);
            request.input('Venue', sql.VarChar(255), recordData.Venue);
            request.input('RoomNumber', sql.VarChar(10), recordData.RoomNumber);
            request.input('DoctorID', sql.Int, recordData.DoctorID);
            
            const result = await request.query(`
                UPDATE MedicalRecords
                SET RecordDateTime = @RecordDateTime,
                    Venue = @Venue,
                    RoomNumber = @RoomNumber,
                    DoctorID = @DoctorID
                WHERE RecordID = @RecordID
            `);
            
            await sql.close();
            return result.rowsAffected[0] > 0;
        } catch (err) {
            console.error('Error updating appointment:', err);
            await sql.close();
            throw err;
        }
    }

    // Delete past appointments
    static async deleteAppointmentRecord(recordId) {
        try {
            await sql.connect(dbConfig);
            const request = new sql.Request();
            request.input('RecordID', sql.Int, recordId);
            
            const result = await request.query(`
                DELETE FROM MedicalRecords
                WHERE RecordID = @RecordID
            `);
            
            await sql.close();
            return result.rowsAffected[0] > 0;
        } catch (err) {
            console.error('Error deleting appointment:', err);
            await sql.close();
            throw err;
        }
    }

    // Get all doctors for dropdown selection
    static async getAllDoctors() {
        try {
            await sql.connect(dbConfig);
            const result = await sql.query(`
                SELECT 
                    DoctorID,
                    FullName
                FROM Doctors
                ORDER BY FullName
            `);
            await sql.close();
            return result.recordset;
        } catch (err) {
            console.error('Error fetching all doctors:', err);
            await sql.close();
            throw err;
        }
    }
}

module.exports = CyModel;