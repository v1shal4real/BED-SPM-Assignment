const sql = require('mssql');
const dbConfig = require('../../dbConfig'); 

//Get all medication
async function getAllMedications() {
    let connection;
    try {
        connection = await sql.connect(dbConfig); 
        const sqlQuery = `SELECT PatientID,MedicationID,DayOfWeek,TimeOfDay,Quantity FROM Trackers`; 
        const request = connection.request();
        const result = await request.query(sqlQuery);
        return result.recordset; 
    } catch (error) {
        console.error("Database error:", error);
        throw error; 
    } finally {
        if (connection) {
            try {
                await connection.close(); 
            } catch (closeError) {
                console.error("Error closing database connection:", closeError);
            }
        }
    }
}

// Get medication by ID
async function getMedicationById(PatientID) {
    let connection;
    try {
        connection = await sql.connect(dbConfig); 
        const sqlQuery = `SELECT PatientID,MedicationID,DayOfWeek,TimeOfDay,Quantity FROM Trackers WHERE PatientID = @PatientID`;
        const request = connection.request();
        request.input("PatientID", sql.Int, PatientID);
        const result = await request.query(sqlQuery);
        return result.recordset; 
    } catch (error) {
        console.error("Database error:", error);
        throw error; 
    } finally {
        if (connection) {
            try {
                await connection.close(); 
            } catch (closeError) {
                console.error("Error closing database connection:", closeError);
            }
        }
    }
}


 //Create new medication
async function createMedication(medicationInfo) {
    let connection;
    try {
        connection = await sql.connect(dbConfig); 
        const sqlQuery = `INSERT INTO Trackers (PatientID, MedicationID, DayOfWeek, TimeOfDay, Quantity) 
        OUTPUT INSERTED.PatientID, INSERTED.MedicationID, INSERTED.DayOfWeek, INSERTED.TimeOfDay, INSERTED.Quantity 
        VALUES (@PatientID, @MedicationID, @DayOfWeek,@TimeOfDay,@Quantity)`;
        const request = connection.request();
        request.input("PatientID", sql.Int, medicationInfo.PatientID);
        request.input("MedicationID", sql.Int, medicationInfo.MedicationID);
        request.input("DayOfWeek", sql.NVarChar, medicationInfo.DayOfWeek);
        request.input("TimeOfDay", sql.NVarChar, medicationInfo.TimeOfDay);
        request.input("Quantity", sql.Int, medicationInfo.Quantity);
        const result = await request.query(sqlQuery);
        return result.recordset[0]; 
    } catch (error) {
        console.error("Database error:", error);
        throw error;
    } finally {
        if (connection) {
            try {
                await connection.close(); 
            } catch (closeError) {
                console.error("Error closing database connection:", closeError);
            }
        }
    }
}

//update medication info
async function updateMedication(PatientID, MedicationID, medicationInfo) {
    let connection; 
    try {
        connection = await sql.connect(dbConfig); 
        const sqlQuery = 'UPDATE Trackers SET MedicationID = @NewMedicationID, DayOfWeek = @DayOfWeek, TimeOfDay = @TimeOfDay, Quantity = @Quantity WHERE PatientID = @PatientID AND MedicationID = @OldMedicationID';
        const request = connection.request();
        request.input("PatientID", sql.Int, PatientID);
        request.input("OldMedicationID", sql.Int, MedicationID);
        request.input("NewMedicationID", sql.Int, medicationInfo.MedicationID);
        request.input("DayOfWeek", sql.NVarChar, medicationInfo.DayOfWeek);
        request.input("TimeOfDay", sql.NVarChar, medicationInfo.TimeOfDay);
        request.input("Quantity", sql.Int, medicationInfo.Quantity);
        const result = await request.query(sqlQuery);
        if (result.rowsAffected[0] === 0) {
            return null; 
        }
        return {medicationInfo}; 
    } catch (error) {
        console.error("Database error:", error);
        throw error; 
    } finally {
        if (connection) {
            try {
                await connection.close(); 
            } catch (closeError) {
                console.error("Error closing database connection:", closeError);
            }
        }
    }
}

// Delete medication
async function deleteMedication(PatientID, MedicationID) {
    let connection; 
    try {
        connection = await sql.connect(dbConfig); 
        const sqlQuery = `DELETE FROM Trackers WHERE PatientID = @PatientID AND MedicationID = @MedicationID`; 
        const request = connection.request();
        request.input("PatientID", sql.Int, PatientID); 
        request.input("MedicationID", sql.Int, MedicationID);
        const result = await request.query(sqlQuery);
        if (result.rowsAffected[0] === 0) {
            return null; 
        }
         return { message: `Medication with id: ${MedicationID} from Patient with id: ${PatientID} has been deleted!` };
    } catch (error) {
        console.error("Database error:", error);
        throw error; 
    } finally {
        if (connection) {
            try {
                await connection.close(); 
            } catch (closeError) {
                console.error("Error closing database connection:", closeError);
            }
        }
    }
}



module.exports = {
    getAllMedications,
    getMedicationById,
    createMedication,
    updateMedication,
    deleteMedication
}
