import { body, validationResult } from 'express-validator';

export const validateSignup = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['STUDENT', 'ADMIN', 'INSTITUTION']).withMessage('Invalid role')
];

export const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

export const validateSubmission = [
  body('problem_id').isInt().withMessage('Valid problem ID is required'),
  body('code').notEmpty().withMessage('Code is required'),
  body('language').isIn(['python', 'javascript', 'java', 'cpp', 'c']).withMessage('Valid language is required')
];

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

