// MedicationStore/model/khairiModel.js
const sql = require("mssql");
const dbConfig = require("../../dbConfig");

async function getAllMedications() {
  let pool;
  try {
    pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      // select the real column names, alias into id/name/description/price
      .query(`
        SELECT
          MedicationID   AS id,
          MedicationName AS name,
          Description    AS description,
          Price          AS price
        FROM [dbo].[Medications]
      `);

    return result.recordset;
  } catch (err) {
    console.error("DB error in getAllMedications:", err);
    throw err;
  } finally {
    if (pool) await pool.close();
  }
}

async function createMedication(data) {
  let pool;
  try {
    pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input('name', data.name)
      .input('description', data.description)
      .input('price', sql.Decimal(10, 2), data.price)
      .query(
        `INSERT INTO [dbo].[Medications] (MedicationName, Description, Price)
         VALUES (@name, @description, @price);
         SELECT SCOPE_IDENTITY() AS id;`
      );

    const newId = result.recordset[0].id;
    // Optionally fetch and return the created row:
    const [newMed] = await pool
      .request()
      .input('id', newId)
      .query('SELECT MedicationID AS id, MedicationName AS name, Description AS description, Price AS price FROM [dbo].[Medications] WHERE MedicationID = @id')
      .then(r => r.recordset);

    return newMed;
  } catch (err) {
    console.error('DB error in createMedication:', err);
    throw err;
  } finally {
    if (pool) await pool.close();
  }
}

async function updateMedication(id, data) {
  let pool;
  try {
    pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .input("name", sql.NVarChar(100), data.name)
      .input("description", sql.NVarChar(sql.MAX), data.description)
      .input("price", sql.Decimal(10, 2), data.price)
      .query(`
        UPDATE [dbo].[Medications]
        SET MedicationName = @name,
            Description    = @description,
            Price          = @price
        WHERE MedicationID = @id;
        SELECT @@ROWCOUNT AS rowsAffected;
      `);

    if (result.recordset[0].rowsAffected === 0) {
      return null; // nothing updated (ID not found)
    }

        // fetch the updated record
    const updated = await pool
      .request()
      .input("id", sql.Int, id)
      .query(`
        SELECT
          MedicationID   AS id,
          MedicationName AS name,
          Description    AS description,
          Price          AS price
        FROM [dbo].[Medications]
        WHERE MedicationID = @id
      `);
    return updated.recordset[0];
  } catch (err) {
    console.error("DB error in updateMedication:", err);
    throw err;
  } finally {
    if (pool) await pool.close();
  }
}

async function deleteMedication(id) {
  let pool;
  try {
    pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query(`
        DELETE FROM [dbo].[Medications]
        WHERE MedicationID = @id;
        SELECT @@ROWCOUNT AS rowsAffected;
      `);
    return result.recordset[0].rowsAffected > 0;
  } catch (err) {
    console.error("DB error in deleteMedication:", err);
    throw err;
  } finally {
    if (pool) await pool.close();
  }
}


module.exports = {
  getAllMedications,
  createMedication,
  updateMedication,
  deleteMedication
};
