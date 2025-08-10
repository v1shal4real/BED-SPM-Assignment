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
    
    // Get medical details for a patient
    static async getMedicalDetailsByPatient(patientId) {
        try {
            await sql.connect(dbConfig);
            const request = new sql.Request();
            request.input('PatientID', sql.Int, patientId);
            const result = await request.query(`
                SELECT 
                    md.DetailID,
                    md.RecordID,
                    md.Symptoms,
                    md.Diagnosis,
                    md.BloodPressure,
                    md.Temperature,
                    md.Allergies,
                    md.LabResults,
                    md.DoctorNotes,
                    md.FollowUpRequired,
                    r.RecordDateTime,
                    d.FullName as DoctorName
                FROM MedicalRecordDetails md
                INNER JOIN MedicalRecords r ON md.RecordID = r.RecordID
                INNER JOIN Doctors d ON r.DoctorID = d.DoctorID
                WHERE r.PatientID = @PatientID
                ORDER BY r.RecordDateTime DESC
            `);
            await sql.close();
            return result.recordset;
        } catch (err) {
            console.error('Error fetching medical details:', err);
            await sql.close();
            throw err;
        }
    }

    // Create new medical detail
    static async createMedicalDetail(detailData) {
        try {
            await sql.connect(dbConfig);
            const request = new sql.Request();
            request.input('RecordID', sql.Int, detailData.RecordID);
            request.input('Symptoms', sql.NVarChar(500), detailData.Symptoms);
            request.input('Diagnosis', sql.NVarChar(255), detailData.Diagnosis);
            request.input('BloodPressure', sql.NVarChar(20), detailData.BloodPressure);
            request.input('Temperature', sql.Decimal(4,1), detailData.Temperature);
            request.input('Allergies', sql.NVarChar(255), detailData.Allergies);
            request.input('LabResults', sql.NVarChar(500), detailData.LabResults);
            request.input('DoctorNotes', sql.NVarChar(1000), detailData.DoctorNotes);
            request.input('FollowUpRequired', sql.Bit, detailData.FollowUpRequired);

            const result = await request.query(`
                INSERT INTO MedicalRecordDetails 
                (RecordID, Symptoms, Diagnosis, BloodPressure, Temperature, Allergies, LabResults, DoctorNotes, FollowUpRequired)
                VALUES (@RecordID, @Symptoms, @Diagnosis, @BloodPressure, @Temperature, @Allergies, @LabResults, @DoctorNotes, @FollowUpRequired);
                SELECT SCOPE_IDENTITY() as DetailID;
            `);

            await sql.close();
            return result.recordset[0].DetailID;
        } catch (err) {
            console.error('Error creating medical detail:', err);
            await sql.close();
            throw err;
        }
    }

    // Update medical detail
    static async updateMedicalDetail(detailId, detailData) {
        try {
            await sql.connect(dbConfig);
            const request = new sql.Request();
            request.input('DetailID', sql.Int, detailId);
            request.input('RecordID', sql.Int, detailData.RecordID);
            request.input('Symptoms', sql.NVarChar(500), detailData.Symptoms);
            request.input('Diagnosis', sql.NVarChar(255), detailData.Diagnosis);
            request.input('BloodPressure', sql.NVarChar(20), detailData.BloodPressure);
            request.input('Temperature', sql.Decimal(4,1), detailData.Temperature);
            request.input('Allergies', sql.NVarChar(255), detailData.Allergies);
            request.input('LabResults', sql.NVarChar(500), detailData.LabResults);
            request.input('DoctorNotes', sql.NVarChar(1000), detailData.DoctorNotes);
            request.input('FollowUpRequired', sql.Bit, detailData.FollowUpRequired);

            const result = await request.query(`
                UPDATE MedicalRecordDetails
                SET RecordID = @RecordID,
                    Symptoms = @Symptoms,
                    Diagnosis = @Diagnosis,
                    BloodPressure = @BloodPressure,
                    Temperature = @Temperature,
                    Allergies = @Allergies,
                    LabResults = @LabResults,
                    DoctorNotes = @DoctorNotes,
                    FollowUpRequired = @FollowUpRequired
                WHERE DetailID = @DetailID
            `);

            await sql.close();
            return result.rowsAffected[0] > 0;
        } catch (err) {
            console.error('Error updating medical detail:', err);
            await sql.close();
            throw err;
        }
    }

    // Delete medical detail
    static async deleteMedicalDetail(detailId) {
        try {
            await sql.connect(dbConfig);
            const request = new sql.Request();
            request.input('DetailID', sql.Int, detailId);

            const result = await request.query(`
                DELETE FROM MedicalRecordDetails
                WHERE DetailID = @DetailID
            `);

            await sql.close();
            return result.rowsAffected[0] > 0;
        } catch (err) {
            console.error('Error deleting medical detail:', err);
            await sql.close();
            throw err;
        }
    }
}

module.exports = CyModel;