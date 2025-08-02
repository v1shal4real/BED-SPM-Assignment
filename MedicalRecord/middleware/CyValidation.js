const Joi = require('joi');

// Basic schemas
const baseSchemas = {
    id: Joi.number().integer().positive().required(),
    venue: Joi.string().trim().min(2).max(255).required(),
    roomNumber: Joi.string().trim().min(1).max(10).required(),
    dateTime: Joi.date().iso().required(),
    doctorId: Joi.number().integer().positive().required()
};

// Parameter validation schemas
const paramSchemas = {
    patientId: Joi.object({
        id: baseSchemas.id
    }),
    recordId: Joi.object({
        id: baseSchemas.id
    })
};

// Medical record update validation schema
const recordUpdateSchema = Joi.object({
    RecordDateTime: baseSchemas.dateTime,
    Venue: baseSchemas.venue,
    RoomNumber: baseSchemas.roomNumber,
    DoctorID: baseSchemas.doctorId
}).min(1); // At least one field must be present

// Validation middleware factory
const createValidationMiddleware = (schema, source = 'body') => {
    return (req, res, next) => {
        const dataToValidate = req[source];
        
        const { error, value } = schema.validate(dataToValidate, {
            abortEarly: false,
            stripUnknown: true,
            convert: true
        });
        
        if (error) {
            const errorDetails = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));
            
            return res.status(400).json({
                error: 'Validation failed',
                details: errorDetails
            });
        }
        
        req[source] = value;
        next();
    };
};

// Core validation middleware
const validate = {
    patientId: createValidationMiddleware(paramSchemas.patientId, 'params'),
    recordId: createValidationMiddleware(paramSchemas.recordId, 'params'),
    recordUpdateData: createValidationMiddleware(recordUpdateSchema, 'body')
};

// Error handling middleware for validation errors
const handleValidationError = (error, req, res, next) => {
    if (error.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Validation failed',
            message: error.message
        });
    }
    next(error);
};

module.exports = {
    validate,
    handleValidationError
};