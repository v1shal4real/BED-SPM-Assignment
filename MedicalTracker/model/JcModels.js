const sql = require('mssql');
const dbConfig = require('../../dbConfig'); 

//Get all medication
async function getAllMedications() {
    let connection;
    try {
        connection = await sql.connect(dbConfig); 
        const sqlQuery = `SELECT PatientID,MedicationID,DayOfWeek,TimeOfDay,Quantity,MedicationName,ImageURL FROM Trackers`; 
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
        
        const result = await connection.request()
            .input('PatientID', sql.Int, PatientID)
            .query(`
                SELECT 
                    PatientID,
                    MedicationID,
                    Quantity,
                    DayOfWeek,
                    TimeOfDay,
                    ImageURL,
                    MedicationName
                FROM Trackers 
                WHERE PatientID = @PatientID
            `);
        return result.recordset;
    } catch (error) {
        console.error('Database error:', error);
        throw error;
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

 //Create new medication
async function createMedication(medicationInfo) {
    let connection;
    try {
        connection = await sql.connect(dbConfig); 
        const sqlQuery = `INSERT INTO Trackers (PatientID, MedicationID, MedicationName, DayOfWeek, TimeOfDay, Quantity, ImageURL) 
        OUTPUT INSERTED.PatientID, INSERTED.MedicationID, INSERTED.MedicationName, INSERTED.DayOfWeek, INSERTED.TimeOfDay, INSERTED.Quantity, INSERTED.ImageURL
        VALUES (@PatientID, @MedicationID, @MedicationName, @DayOfWeek, @TimeOfDay, @Quantity, @ImageURL)`;
        const request = connection.request();
        request.input("PatientID", sql.Int, medicationInfo.PatientID);
        request.input("MedicationID", sql.Int, medicationInfo.MedicationID);
        request.input("MedicationName", sql.NVarChar, medicationInfo.MedicationName || null);
        request.input("DayOfWeek", sql.NVarChar, medicationInfo.DayOfWeek);
        request.input("TimeOfDay", sql.NVarChar, medicationInfo.TimeOfDay);
        request.input("Quantity", sql.Int, medicationInfo.Quantity);
        request.input("ImageURL", sql.NVarChar, medicationInfo.ImageURL); 
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
        const sqlQuery = `
            UPDATE Trackers
            SET MedicationID = @NewMedicationID,
                DayOfWeek = @DayOfWeek,
                TimeOfDay = @TimeOfDay,
                Quantity = @Quantity,
                MedicationName = @MedicationName,
                ImageURL = @ImageURL
            OUTPUT INSERTED.MedicationID, INSERTED.DayOfWeek, INSERTED.TimeOfDay, INSERTED.Quantity, INSERTED.MedicationName, INSERTED.ImageURL
            WHERE PatientID = @PatientID AND MedicationID = @OldMedicationID
        `;
        const request = connection.request();
        request.input("PatientID", sql.Int, PatientID);
        request.input("OldMedicationID", sql.Int, MedicationID);
        request.input("NewMedicationID", sql.Int, medicationInfo.MedicationID); 
        request.input("DayOfWeek", sql.NVarChar, medicationInfo.DayOfWeek);
        request.input("TimeOfDay", sql.NVarChar, medicationInfo.TimeOfDay);
        request.input("Quantity", sql.Int, medicationInfo.Quantity);
        request.input("MedicationName", sql.NVarChar, medicationInfo.MedicationName);
        request.input("ImageURL", sql.NVarChar, medicationInfo.ImageURL);
        const result = await request.query(sqlQuery);
        if (result.rowsAffected[0] === 0) {
            return null;
        }
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
    deleteMedication,
}

// Replace the confirmEdit function in your TrackersMain.html
async function confirmEdit(patientId, medicationId) {
  if (!hasPermission('update')) {
    alert('You do not have permission to update medications');
    return;
  }

  if (!canAccessPatient(patientId)) {
    alert('You do not have permission to modify this patient\'s data');
    return;
  }

  const newId = document.getElementById('edit-id').value;
  const medicationName = document.getElementById('edit-name').value; // ADD THIS LINE
  const quantity = document.getElementById('edit-quantity').value;
  const time = document.getElementById('edit-time').value;
  const day = document.getElementById('edit-day').value;

  // Validation
  if (!medicationName.trim()) {
    alert('Medication name is required');
    return;
  }

  const data = {
    MedicationID: newId,
    MedicationName: medicationName.trim(), // ADD THIS LINE
    Quantity: quantity,
    TimeOfDay: time,
    DayOfWeek: day
  };

  try {
    const res = await fetch(`http://localhost:3000/Tracker/${patientId}/${medicationId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Update failed");
    alert("Medication updated!");
    editingId = null;
    handleClick(currentDay);
  } catch (err) {
    alert("Error updating medication: " + err.message);
  }
}
