// MedicationStore/controller/KhairiController.js
const {
  getAllMedications,
  createMedication,
  updateMedication,
  deleteMedication
} = require("../model/KhairiModels");

async function fetchAllMeds(req, res) {
  try {
    const meds = await getAllMedications();
    console.log("✅ fetched meds:", meds);
    return res.json(meds);
  } catch (err) {
    console.error("❌ Controller error in fetchAllMeds:", err);
    return res
      .status(500)
      .json({ error: err.message, stack: err.stack });
  }
}

async function createMed(req, res) {
  try {
    // call the model’s create function
    const med = await createMedication(req.body);
    return res.status(201).json(med);
  } catch (err) {
    console.error("❌ Controller error in createMed:", err);
    return res.status(500).json({ error: err.message });
  }
}

async function updateMed(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const updated = await updateMedication(id, req.body);
    if (!updated) {
      return res.status(404).json({ error: "Medication not found" });
    }
    return res.json(updated);
  } catch (err) {
    console.error("Controller error in updateMed:", err);
    return res.status(500).json({ error: err.message });
  }
}

async function deleteMed(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const ok = await deleteMedication(id);
    if (!ok) {
      return res.status(404).json({ error: "Medication not found" });
    }
    return res.status(204).send();
  } catch (err) {
    console.error("Controller error in deleteMed:", err);
    return res.status(500).json({ error: err.message });
  }
}

// export the handlers *with* the correct names
module.exports = {
  fetchAllMeds,
  createMed,
  updateMed,
  deleteMed
};
