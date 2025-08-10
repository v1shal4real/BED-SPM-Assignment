const Joi = require("joi"); 
const trackerSchema = Joi.object({
  PatientID: Joi.number().integer().min(1).required().messages({
    "number.base": "PatientID must be a Number",
    "number.min": "PatientID must be at least 1",
    "number.integer": "PatientID must be an integer",
    "any.required": "PatientID is required",
  }),
  MedicationID: Joi.number().integer().min(1).required().messages({
    "number.base": "MedicationID must be a Number",
    "number.min": "MedicationID must be at least 1",
    "number.integer": "MedicationID must be an integer",
    "any.required": "MedicationID is required",
  }),
  DayOfWeek: Joi.string().min(6).max(9).required().messages({
    "string.base": "Day of Week must be a String",
    "string.min": "Day of Week must be at least 6 characters long",
    "string.max": "Day of Week must be at most 9 characters long",
    "string.empty": "Day of Week cannot be empty",
    "any.required": "Day of Week is required",
  }),
  TimeOfDay: Joi.string().min(7).max(9).required().messages({
    "string.base": "Time of Day must be a String",
    "string.min": "Time of Day must be at least 7 characters long",
    "string.max": "Time of Day must be at most 9 characters long",
    "string.empty": "Time of Day cannot be empty",
    "any.required": "Time of Day is required",
  }),
  MedicationName: Joi.string().min(2).max(100).required().messages({
    "string.base": "Medication Name must be a String",
    "string.min": "Medication Name must be at least 2 characters long",
    "string.max": "Medication Name must be at most 100 characters long",
    "any.required": "Medication Name is required",
  }),
  Quantity: Joi.number().integer().min(1).required().messages({
    "number.base": "Quantity must be a number",
    "number.integer": "Quantity must be an integer",
    "number.min": "Quantity must be at least 1",
    "any.required": "Quantity is required",
  }),
  ImageURL: Joi.string().uri().allow(null, '').optional().messages({
    "string.base": "Image URL must be a String",
    "string.uri": "Image URL must be a valid URI",
  }),
});

// Middleware to validate (for POST/PUT)
function validateTracker(req, res, next) {
  const { error } = trackerSchema.validate(req.body, { abortEarly: false }); 

  if (error) {
    const errorMessage = error.details
      .map((detail) => detail.message)
      .join(", ");
    return res.status(400).json({ error: errorMessage });
  }

  next();
}

function validatePatientID(req, res, next) {
  const pid = parseInt(req.params.PatientID);
  if (isNaN(pid) || pid <= 0) {
    return res
      .status(400)
      .json({ error: "Invalid ID. ID must be a positive number" });
  }
  next();
}

// Middleware to validate book ID from URL parameters (for GET by ID, PUT, DELETE)
function validatePatientnMedicationID(req, res, next) {
  const pid = parseInt(req.params.PatientID);
  const mid = parseInt(req.params.MedicationID);
  if (isNaN(pid) || pid <= 0 && isNaN(mid) || mid <= 0) {
    return res
      .status(400)
      .json({ error: "Invalid ID. ID must be a positive number" });
  }
  next();
}
const doctorSchema = Joi.object({
  FullName: Joi.string().min(2).max(100).required().messages({
    "string.base": "Full Name must be a String",
    "string.min": "Full Name must be at least 2 characters long",
    "string.max": "Full Name must be at most 100 characters long",
    "any.required": "Full Name is required",
  }),
  EmailAddress: Joi.string().email().required().messages({
    "string.base": "Email Address must be a String",
    "string.email": "Email Address must be a valid email",
    "any.required": "Email Address is required",
  }),
});

// Middleware to validate (for POST/PUT)
function validateDoc(req, res, next) {
  const { error } = doctorSchema.validate(req.body, { abortEarly: false });

  if (error) {
    const errorMessage = error.details
      .map((detail) => detail.message)
      .join(", ");
    return res.status(400).json({ error: errorMessage });
  }

  next();
}


// Middleware to validate doctor ID from URL parameters (for GET by ID, PUT, DELETE)
function validateDocID(req, res, next) {
  const did = parseInt(req.params.DoctorID);
  if (isNaN(did) || did <= 0) {
    return res
      .status(400)
      .json({ error: "Invalid ID. ID must be a positive number" });

  }
  next();
}


module.exports = {
  validateTracker,
  validatePatientID,
  validatePatientnMedicationID,
  validateDoc,
  validateDocID,
};

