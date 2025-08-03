const Joi = require('joi');

exports.validateSignup = (req, res, next) => {
  const schema = Joi.object({
    fullName: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().max(100).required(),
    password: Joi.string()
      .min(6)
      .pattern(new RegExp('^(?=.*[A-Z])(?=.*\\d).+$'))
      .required()
      .messages({
        'string.pattern.base': 'Password must contain at least one uppercase letter and one number.',
        'string.min': 'Password must be at least 6 characters long.'
      }),
    dateOfBirth: Joi.date().iso().required(),
    contactNumber: Joi.string().min(8).max(20).required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

exports.validateEmergencyInfo = (req, res, next) => {
  const schema = Joi.object({
    dateOfBirth: Joi.date().iso().required().messages({
      'any.required': 'Date of birth is required.',
      'date.base': 'Date of birth must be a valid date.'
    }),
    bloodType: Joi.string().min(1).max(5).required().messages({
      'any.required': 'Blood type is required.'
    }),
    chronicConditions: Joi.string().min(2).max(255).required().messages({
      'any.required': 'Chronic conditions are required.'
    }),
    allergies: Joi.string().min(1).max(255).required().messages({
      'any.required': 'Allergies field is required.'
    }),
    doctorEmail: Joi.string().email().max(100).required().messages({
      'any.required': 'Doctor email is required.',
      'string.email': 'Doctor email must be a valid email address.'
    })
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};


exports.validateProfileEdit = (req, res, next) => {
  const schema = Joi.object({
    fullName: Joi.string().min(2).max(100).optional(),
    email: Joi.string().email().max(100).optional(),
    contactNumber: Joi.string().min(8).max(20).optional(),

  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

exports.validateEmergencyContact = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    relationship: Joi.string().min(2).max(50).required(),
    phoneNumber: Joi.string().min(8).max(20).required(),
    
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};
