require('dotenv').config();
const express = require('express');
const sql = require('mssql');
const path = require('path');
const cors = require('cors');

// Import all routes
// const patientRoutes = require('./LoginNSignUp/routes/patientRoutes');
// const ecRoutes = require('./LoginNSignUp/routes/emergencyContactRoutes');

// Import controllers
const medicationController = require('../BED-SPM-Assignment_Jack/MedicalTracker/controller/JcController');
const loginController = require('../BED-SPM-Assignment_Jack/LoginNSignUp/controller/loginController');
const doctorController = require('./MedicalTracker/controller/CRUDDocCtrl');

// Import validation middleware
const {
    validateTracker,
    validateTrackerID,
    validatePatientnMedicationID,
    validatePatientID,
} = require('./middleware/medicalValidation'); 

const app = express();
const port = process.env.PORT || 3000;

// Middleware setup
app.use(cors());
// Increase body size limits for image uploads
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ extended: true, limit: '50mb' })); 
app.use(express.static(path.join(__dirname, 'FrontEnd'))); 

// Cloudinary setup for image uploads
const cloudinary = require('cloudinary').v2;
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// LoginNSignup Routes (merged from LoginNSignUp/app.js)
// app.use('/api', patientRoutes);
// app.use('/api/emergency-contacts', ecRoutes);
app.post('/api/login', loginController.login);

// Medical Tracker Routes
app.get('/Tracker', medicationController.getAllMedications);
app.get('/Tracker/:PatientID', validatePatientID, medicationController.getMedicationById);
app.post('/Tracker', validateTracker, medicationController.createMedication); 
app.put('/Tracker/:PatientID/:MedicationID', validatePatientnMedicationID, medicationController.updateMedication);
app.delete('/Tracker/:PatientID/:MedicationID', validatePatientnMedicationID, medicationController.deleteMedication);

// Add this route for medication name lookup
app.get('/Tracker/medication-name/:MedicationID', medicationController.getMedicationNameById);

// Image upload functionality
const uploadImage = (image) => {
  const opts = {
    overwrite: true,
    invalidate: true,
    resource_type: 'auto',
  };
  
  return new Promise((resolve, reject) => {
    console.log("Starting Cloudinary upload...");
    cloudinary.uploader.upload(image, opts, (error, result) => {
      if (error) {
        console.error("Cloudinary error:", error);
        return reject({ message: error.message || "Cloudinary upload failed" });
      }
      
      if (result && result.secure_url) {
        console.log("Image uploaded successfully:", result.secure_url);
        return resolve(result.secure_url);
      }
      
      console.error("No result or secure_url from Cloudinary");
      return reject({ message: "No secure URL returned from Cloudinary" }); 
    });
  });
};

app.post("/upload-image", async (req, res) => {
  try {
    console.log("Upload request received");
    const { image } = req.body;
    
    if (!image) {
      console.log("No image data provided");
      return res.status(400).json({ error: "No image data provided" });
    }
    
    console.log("Image data preview:", image.substring(0, 100) + "...");
    console.log("Image data length:", image.length);
    
    console.log("Attempting to upload to Cloudinary...");
    const url = await uploadImage(image);
    console.log("Upload successful:", url);
    res.json({ url });
  } catch (err) {
    console.error("Upload error details:", err);
    res.status(500).json({ error: err.message || "Upload failed" });
  }
});

// Test routes
app.get("/test-cloudinary", (req, res) => {
  console.log("Cloudinary config:", {
    cloud_name: cloudinary.config().cloud_name,
    api_key: cloudinary.config().api_key,
    api_secret: cloudinary.config().api_secret ? "**configured**" : "not configured"
  });
  res.json({
    message: "Cloudinary config logged to console",
    config: {
      cloud_name: cloudinary.config().cloud_name,
      api_key: cloudinary.config().api_key,
      api_secret: cloudinary.config().api_secret ? "**configured**" : "not configured"
    }
  });
});

// Test route to verify server is working
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// Default route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'FrontEnd/html/homepage.html'));
});

// Doctor management routes (admin only)
app.post('/api/admin/create-doctor', doctorController.verifyAdminToken, doctorController.createDoctor);
app.get('/api/admin/doctors', doctorController.verifyAdminToken, doctorController.getAllDoctors);
app.get('/api/admin/doctors/:id', doctorController.verifyAdminToken, doctorController.getDoctorById);
app.put('/api/admin/doctors/:id', doctorController.verifyAdminToken, doctorController.updateDoctor);
app.delete('/api/admin/doctors/:id', doctorController.verifyAdminToken, doctorController.deleteDoctor);

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Click http://localhost:${port}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Server is gracefully shutting down');
    await sql.close();
    console.log('Database connections closed');
    process.exit(0);
});