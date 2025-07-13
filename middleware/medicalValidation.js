const Joi = require("joi");

// For POST (Create)
const createSchema = Joi.object({
  PatientID: Joi.number().integer().positive().required().messages({
    "number.base": "PatientID must be a number",
    "number.integer": "PatientID must be an integer",
    "number.positive": "PatientID must be a positive number",
    "any.required": "PatientID is required",
  }),
  AppointmentDateTime: Joi.date().iso().required().messages({
    "date.base": "AppointmentDateTime must be a valid date",
    "any.required": "AppointmentDateTime is required",
  }),
});

// For PUT (Update) - Only allow updating the time
const updateSchema = Joi.object({
  AppointmentDateTime: Joi.date().iso().required().messages({
    "date.base": "AppointmentDateTime must be a valid date",
    "any.required": "AppointmentDateTime is required",
  }),
});

function validateAppointment(req, res, next) {
  // Choose schema based on method
  const schema = req.method === 'POST' ? createSchema : updateSchema;
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const msg = error.details.map(d => d.message).join(", ");
    return res.status(400).json({ error: msg });
  }
  next();
}

function validateAppointmentId(req, res, next) {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id) || id <= 0) {
    return res.status(400).json({ error: "Invalid appointment ID. ID must be a positive number" });
  }
  next();
}

module.exports = {
  validateAppointment,
  validateAppointmentId,
};
