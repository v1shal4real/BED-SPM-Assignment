const sql = require('mssql');
const dbConfig = require('../../dbConfig');

// Create a new doctor
async function createDoctor(doctorData) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);

        const { fullname, email, passwordHash } = doctorData;

        // Check if email already exists
        const existingDoctor = await connection.request()
            .input('Email', sql.NVarChar, email)
            .query('SELECT * FROM Doctors WHERE EmailAddress = @Email');
            
        if (existingDoctor.recordset.length > 0) {
            throw new Error('Email already exists');
        }

        // Insert new doctor
        const result = await connection.request()
            .input('FullName', sql.NVarChar, fullname)
            .input('EmailAddress', sql.NVarChar, email)
            .input('PasswordHash', sql.NVarChar, passwordHash)
            .query(`
                INSERT INTO Doctors (FullName, EmailAddress, PasswordHash)
                OUTPUT INSERTED.*
                VALUES (@FullName, @EmailAddress, @PasswordHash)
            `);

        return result.recordset[0];
        
    } catch (error) {
        console.error('Error creating doctor:', error);
        throw error;
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

// Get all doctors
async function getAllDoctors() {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        
        const result = await connection.request()
            .query(`
                SELECT DoctorID, FullName, EmailAddress
                FROM Doctors 
            `);

        return result.recordset;
        
    } catch (error) {
        console.error('Error getting all doctors:', error);
        throw error;
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

// Get doctor by ID
async function getDoctorById(doctorId) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        
        const result = await connection.request()
            .input('DoctorID', sql.Int, doctorId)
            .query(`
                SELECT DoctorID, FullName, EmailAddress
                FROM Doctors 
                WHERE DoctorID = @DoctorID
            `);

        return result.recordset[0];
        
    } catch (error) {
        console.error('Error getting doctor by ID:', error);
        throw error;
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

// Update doctor
async function updateDoctor(doctorId, updateData) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        
        // Build dynamic query based on provided fields
        let updateFields = [];
        let params = {};
        
        if (updateData.fullname) {
            updateFields.push('FullName = @FullName');
            params.FullName = updateData.fullname;
        }
        
        
        if (updateData.email) {
            updateFields.push('EmailAddress = @EmailAddress');
            params.EmailAddress = updateData.email;
        }
        
        if (updateData.passwordHash) {
            updateFields.push('PasswordHash = @PasswordHash');
            params.PasswordHash = updateData.passwordHash;
        }
        
        if (updateFields.length === 0) {
            throw new Error('No fields to update');
        }
        
        const query = `
            UPDATE Doctors 
            SET ${updateFields.join(', ')}
            OUTPUT INSERTED.*
            WHERE DoctorID = @DoctorID
        `;
        
        const request = connection.request()
            .input('DoctorID', sql.Int, doctorId);
            
        // Add all parameters
        Object.keys(params).forEach(key => {
            request.input(key, params[key]);
        });
        
        const result = await request.query(query);
        return result.recordset[0];
        
    } catch (error) {
        console.error('Error updating doctor:', error);
        throw error;
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

// Delete doctor
async function deleteDoctor(doctorId) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        
        const result = await connection.request()
            .input('DoctorID', sql.Int, doctorId)
            .query(`
                DELETE FROM Doctors 
                OUTPUT DELETED.*
                WHERE DoctorID = @DoctorID
            `);

        return result.recordset[0];
        
    } catch (error) {
        console.error('Error deleting doctor:', error);
        throw error;
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

module.exports = {
    createDoctor,
    getAllDoctors,
    getDoctorById,
    updateDoctor,
    deleteDoctor
};