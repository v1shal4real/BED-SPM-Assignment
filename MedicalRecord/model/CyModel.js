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

    // Update patient information
    static async updatePatient(patientId, patientData) {
        try {
            await sql.connect(dbConfig);
            const request = new sql.Request();
            request.input('PatientID', sql.Int, patientId);
            request.input('FullName', sql.VarChar(255), patientData.FullName);
            request.input('DateOfBirth', sql.Date, patientData.DateOfBirth);
            request.input('ContactNumber', sql.VarChar(20), patientData.ContactNumber);
            request.input('Email', sql.VarChar(255), patientData.Email);
            request.input('Address', sql.VarChar(500), patientData.Address);
            
            const result = await request.query(`
                UPDATE Patients 
                SET FullName = @FullName,
                    DateOfBirth = @DateOfBirth,
                    ContactNumber = @ContactNumber,
                    Email = @Email,
                    Address = @Address
                WHERE PatientID = @PatientID
            `);
            
            await sql.close();
            return result.rowsAffected[0] > 0;
        } catch (err) {
            console.error('Error updating patient:', err);
            await sql.close();
            throw err;
        }
    }

    // Delete a patient
    static async deletePatient(patientId) {
        try {
            await sql.connect(dbConfig);
            const request = new sql.Request();
            request.input('PatientID', sql.Int, patientId);
            
            // Note: In a real application, you might want to handle foreign key constraints
            // by either cascading deletes or preventing deletion if appointments exist
            const result = await request.query(`
                DELETE FROM Patients 
                WHERE PatientID = @PatientID
            `);
            
            await sql.close();
            return result.rowsAffected[0] > 0;
        } catch (err) {
            console.error('Error deleting patient:', err);
            await sql.close();
            throw err;
        }
    }

    // Get all appointments for a specific patient
    static async getPatientAppointments(patientId) {
        try {
            await sql.connect(dbConfig);
            const request = new sql.Request();
            request.input('PatientID', sql.Int, patientId);
            const result = await request.query(`
                SELECT 
                    a.AppointmentID,
                    a.AppointmentDateTime,
                    a.Venue,
                    a.RoomNumber,
                    d.FullName as DoctorName,
                    d.DoctorID
                FROM Appointments a
                INNER JOIN Doctors d ON a.DoctorID = d.DoctorID
                WHERE a.PatientID = @PatientID
                ORDER BY a.AppointmentDateTime DESC
            `);
            await sql.close();
            return result.recordset;
        } catch (err) {
            console.error('Error fetching patient appointments:', err);
            await sql.close();
            throw err;
        }
    }

    // Update an appointment
    static async updateAppointment(appointmentId, appointmentData) {
        try {
            await sql.connect(dbConfig);
            const request = new sql.Request();
            request.input('AppointmentID', sql.Int, appointmentId);
            request.input('AppointmentDateTime', sql.DateTime, appointmentData.AppointmentDateTime);
            request.input('Venue', sql.VarChar(255), appointmentData.Venue);
            request.input('RoomNumber', sql.VarChar(10), appointmentData.RoomNumber);
            request.input('DoctorID', sql.Int, appointmentData.DoctorID);
            
            const result = await request.query(`
                UPDATE Appointments 
                SET AppointmentDateTime = @AppointmentDateTime,
                    Venue = @Venue,
                    RoomNumber = @RoomNumber,
                    DoctorID = @DoctorID
                WHERE AppointmentID = @AppointmentID
            `);
            
            await sql.close();
            return result.rowsAffected[0] > 0;
        } catch (err) {
            console.error('Error updating appointment:', err);
            await sql.close();
            throw err;
        }
    }

    // Delete an appointment
    static async deleteAppointment(appointmentId) {
        try {
            await sql.connect(dbConfig);
            const request = new sql.Request();
            request.input('AppointmentID', sql.Int, appointmentId);
            
            const result = await request.query(`
                DELETE FROM Appointments 
                WHERE AppointmentID = @AppointmentID
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