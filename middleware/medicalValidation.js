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
  Quantity: Joi.number().integer().min(1).required().messages({
    "number.base": "Quantity must be a number",
    "number.integer": "Quantity must be an integer",
    "number.min": "Quantity must be at least 1",
    "any.required": "Quantity is required",
  }),
  // Add validation for other fields if necessary (e.g., year, genre)
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
  // Parse the ID from request parameters
  const pid = parseInt(req.params.PatientID);
  // Check if the parsed ID is a valid positive number
  if (isNaN(pid) || pid <= 0) {
    // If not valid, send a 400 response
    return res
      .status(400)
      .json({ error: "Invalid ID. ID must be a positive number" });
  }

  // If validation succeeds, pass control to the next middleware/route handler
  next();
}

// Middleware to validate book ID from URL parameters (for GET by ID, PUT, DELETE)
function validatePatientnMedicationID(req, res, next) {
  // Parse the ID from request parameters
  const pid = parseInt(req.params.PatientID);
  const mid = parseInt(req.params.MedicationID);
  // Check if the parsed ID is a valid positive number
  if (isNaN(pid) || pid <= 0 && isNaN(mid) || mid <= 0) {
    // If not valid, send a 400 response
    return res
      .status(400)
      .json({ error: "Invalid ID. ID must be a positive number" });
  }

  // If validation succeeds, pass control to the next middleware/route handler
  next();
}



module.exports = {
  validateTracker,
  validatePatientID,
  validatePatientnMedicationID,
};