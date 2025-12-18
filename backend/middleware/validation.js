const { body, param, query, validationResult } = require('express-validator');
const mongoose = require('mongoose');

/**
 * Validation Error Handler
 * Formats validation errors and sends response
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }
  
  next();
};

/**
 * Custom validator: Check if string is valid MongoDB ObjectId
 */
const isValidObjectId = (value) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new Error('Invalid ID format');
  }
  return true;
};

/**
 * Custom validator: Sanitize and validate spot name
 */
const isValidSpotName = (value) => {
  const sanitized = value.trim();
  if (sanitized.length < 2 || sanitized.length > 100) {
    throw new Error('Spot name must be between 2 and 100 characters');
  }
  if (!/^[a-zA-Z0-9\s\-']+$/.test(sanitized)) {
    throw new Error('Spot name contains invalid characters');
  }
  return true;
};

/**
 * Custom validator: Check if hazard type is valid
 */
const VALID_HAZARD_TYPES = [
  'Rip Current', 'High Surf', 'Reef Cuts', 'Jellyfish', 
  'Sea Urchins', 'Strong Winds', 'Poor Visibility', 
  'Overcrowding', 'Equipment Issues', 'Marine Life', 'Other'
];

const isValidHazardType = (value) => {
  if (!VALID_HAZARD_TYPES.includes(value)) {
    throw new Error(`Invalid hazard type. Must be one of: ${VALID_HAZARD_TYPES.join(', ')}`);
  }
  return true;
};

/**
 * Custom validator: Check if severity is valid
 */
const isValidSeverity = (value) => {
  const validSeverities = ['low', 'medium', 'high'];
  if (!validSeverities.includes(value.toLowerCase())) {
    throw new Error('Severity must be low, medium, or high');
  }
  return true;
};

// ==================== VALIDATION RULES ====================

/**
 * Validate Hazard Report Submission
 */
const validateHazardReport = [
  body('surfSpotId')
    .trim()
    .notEmpty().withMessage('Surf spot ID is required')
    .custom(isValidObjectId),
  
  body('hazardType')
    .trim()
    .notEmpty().withMessage('Hazard type is required')
    .custom(isValidHazardType),
  
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters')
    .escape(), // Prevent XSS
  
  body('severity')
    .trim()
    .notEmpty().withMessage('Severity is required')
    .custom(isValidSeverity)
    .toLowerCase(),
  
  body('reporterName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Reporter name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s\-']+$/).withMessage('Reporter name contains invalid characters')
    .escape(),
  
  handleValidationErrors
];

/**
 * Validate Surf Spot ID Parameter
 */
const validateSurfSpotId = [
  param('id')
    .trim()
    .notEmpty().withMessage('Surf spot ID is required')
    .custom(isValidObjectId),
  
  handleValidationErrors
];

/**
 * Validate Spot Name Parameter
 */
const validateSpotName = [
  param('spotName')
    .trim()
    .notEmpty().withMessage('Spot name is required')
    .custom(isValidSpotName),
  
  handleValidationErrors
];

/**
 * Validate Pagination Query Parameters
 */
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1, max: 1000 }).withMessage('Page must be between 1 and 1000')
    .toInt(),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
    .toInt(),
  
  handleValidationErrors
];

/**
 * Validate Risk Score Update (for ML service)
 */
const validateRiskScoreUpdate = [
  param('id')
    .trim()
    .notEmpty().withMessage('Surf spot ID is required')
    .custom(isValidObjectId),
  
  body('riskScore')
    .isFloat({ min: 0, max: 10 }).withMessage('Risk score must be between 0 and 10')
    .toFloat(),
  
  body('riskFactors')
    .optional()
    .isObject().withMessage('Risk factors must be an object'),
  
  handleValidationErrors
];

/**
 * Validate ML Update Request
 */
const validateMLUpdate = [
  body('surf_spot_id')
    .trim()
    .notEmpty().withMessage('Surf spot ID is required')
    .custom(isValidObjectId),
  
  handleValidationErrors
];

/**
 * Sanitize Query Parameters
 * Prevents NoSQL injection through query params
 */
const sanitizeQuery = (req, res, next) => {
  // Build a sanitized copy of the query parameters instead of mutating req.query
  const sanitized = {};
  Object.keys(req.query || {}).forEach(key => {
    const val = req.query[key];
    if (typeof val === 'string') {
      // Remove $ and . to prevent operator injection
      sanitized[key] = val.replace(/[\$\.]/g, '');
    } else {
      sanitized[key] = val;
    }
  });

  // Expose a safe, sanitized query object for downstream handlers
  req.customQuery = sanitized;
  next();
};

/**
 * Validate Anonymous Reporter Name (Optional)
 */
const validateReporterName = (name) => {
  if (!name || name.trim() === '') {
    return 'Anonymous';
  }
  
  const sanitized = name.trim();
  
  // Length check
  if (sanitized.length > 100) {
    return 'Anonymous';
  }
  
  // Only allow letters, spaces, hyphens, apostrophes
  if (!/^[a-zA-Z\s\-']+$/.test(sanitized)) {
    return 'Anonymous';
  }
  
  return sanitized;
};

module.exports = {
  validateHazardReport,
  validateSurfSpotId,
  validateSpotName,
  validatePagination,
  validateRiskScoreUpdate,
  validateMLUpdate,
  sanitizeQuery,
  handleValidationErrors,
  validateReporterName,
  
  // Export validators for custom use
  validators: {
    isValidObjectId,
    isValidSpotName,
    isValidHazardType,
    isValidSeverity
  },
  
  // Export constants
  VALID_HAZARD_TYPES
};