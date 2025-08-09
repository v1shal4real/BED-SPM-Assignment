// model/KhairiModels.js
const sql      = require("mssql");
const dbConfig = require("../../dbConfig");

async function getAllMedications() {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .query(`
      SELECT
        MedicationID   AS id,
        MedicationName AS name,
        Description    AS description,
        Price          AS price,
        ImageUrl       AS imageUrl
      FROM dbo.Medications
    `);
  pool.close();
  return result.recordset;
}

async function getMedicationById(id) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input("id", sql.Int, id)
    .query(`
      SELECT
        MedicationID   AS id,
        MedicationName AS name,
        Description    AS description,
        Price          AS price,
        ImageUrl       AS imageUrl
      FROM dbo.Medications
      WHERE MedicationID = @id
    `);
  pool.close();
  return result.recordset[0];
}

async function createMedication({ name, description, price, imageUrl }) {
  const pool = await sql.connect(dbConfig);
  const insert = await pool.request()
    .input("name",        sql.NVarChar(100), name)
    .input("description", sql.NVarChar(sql.MAX), description)
    .input("price",       sql.Decimal(10,2), price)
    .input("imageUrl",    sql.NVarChar(sql.MAX), imageUrl)
    .query(`
      INSERT INTO dbo.Medications
        (MedicationName, Description, Price, ImageUrl)
      VALUES
        (@name, @description, @price, @imageUrl);
      SELECT SCOPE_IDENTITY() AS id;
    `);

  const newId = insert.recordset[0].id;
  const created = await pool.request()
    .input("id", sql.Int, newId)
    .query(`
      SELECT
        MedicationID   AS id,
        MedicationName AS name,
        Description    AS description,
        Price          AS price,
        ImageUrl       AS imageUrl
      FROM dbo.Medications
      WHERE MedicationID = @id
    `);
  pool.close();
  return created.recordset[0];
}

async function updateMedication(id, { name, description, price, imageUrl }) {
  const pool = await sql.connect(dbConfig);
  const upd = await pool.request()
    .input("id",          sql.Int, id)
    .input("name",        sql.NVarChar(100), name)
    .input("description", sql.NVarChar(sql.MAX), description)
    .input("price",       sql.Decimal(10,2), price)
    .input("imageUrl",    sql.NVarChar(sql.MAX), imageUrl)
    .query(`
      UPDATE dbo.Medications
      SET
        MedicationName = @name,
        Description    = @description,
        Price          = @price,
        ImageUrl       = @imageUrl
      WHERE MedicationID = @id;
      SELECT @@ROWCOUNT AS rowsAffected;
    `);

  if (upd.recordset[0].rowsAffected === 0) {
    pool.close();
    return null;
  }

  const refreshed = await pool.request()
    .input("id", sql.Int, id)
    .query(`
      SELECT
        MedicationID   AS id,
        MedicationName AS name,
        Description    AS description,
        Price          AS price,
        ImageUrl       AS imageUrl
      FROM dbo.Medications
      WHERE MedicationID = @id
    `);
  pool.close();
  return refreshed.recordset[0];
}

async function deleteMedication(id) {
  const pool = await sql.connect(dbConfig);
  
  // Start a transaction to ensure data consistency
  const transaction = new sql.Transaction(pool);
  
  try {
    await transaction.begin();
    
    // First, delete related tracker records
    await transaction.request()
      .input("id", sql.Int, id)
      .query(`
        DELETE FROM dbo.Trackers
        WHERE MedicationID = @id
      `);
    
    // Then delete the medication
    const del = await transaction.request()
      .input("id", sql.Int, id)
      .query(`
        DELETE FROM dbo.Medications
        WHERE MedicationID = @id;
        SELECT @@ROWCOUNT AS rowsAffected;
      `);
    
    await transaction.commit();
    pool.close();
    return del.recordset[0].rowsAffected > 0;
    
  } catch (error) {
    await transaction.rollback();
    pool.close();
    throw error;
  }
}

module.exports = {
  getAllMedications,
  getMedicationById,
  createMedication,
  updateMedication,
  deleteMedication
};