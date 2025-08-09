// controller/KhairiController.js
const cloudinary = require("cloudinary").v2;
const multer     = require("multer");
const upload     = multer({ dest: "/tmp" });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const {
  getAllMedications,
  getMedicationById,
  createMedication,
  updateMedication,
  deleteMedication
} = require("../model/KhairiModels");

// GET /medications
async function fetchAllMeds(req, res) {
  try {
    const meds = await getAllMedications();
    return res.json(meds);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

// GET /medications/:id
async function fetchOneMed(req, res) {
  try {
    const id  = parseInt(req.params.id, 10);
    const med = await getMedicationById(id);
    if (!med) return res.status(404).json({ error: "Not found" });
    res.json(med);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

// POST /medications      (with optional image upload)
const createMed = [
  async (req, res) => {
    try {
      let { name, description, price } = req.body;
      let imageUrl = null;

      if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "medications",
          use_filename: true,
          unique_filename: false
        });
        imageUrl = result.secure_url;
      }

      const med = await createMedication({ name, description, price, imageUrl });
      res.status(201).json(med);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  }
];

// PUT /medications/:id   (with optional new image)
const updateMed = [
  async (req, res) => {
    try {
      const id  = parseInt(req.params.id, 10);
      let { name, description, price, existingImageUrl } = req.body;
      let imageUrl = existingImageUrl || null;

      if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "medications",
          use_filename: true,
          unique_filename: false
        });
        imageUrl = result.secure_url;
      }

      const updated = await updateMedication(id, {
        name, description, price, imageUrl
      });
      if (!updated) return res.status(404).json({ error: "Not found" });
      res.json(updated);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  }
];

// DELETE /medications/:id
async function deleteMed(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const ok = await deleteMedication(id);
    if (!ok) return res.status(404).json({ error: "Not found" });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  fetchAllMeds,
  fetchOneMed,
  createMed,
  updateMed,
  deleteMed,
};
