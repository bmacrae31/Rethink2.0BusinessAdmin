import { body, validationResult } from 'express-validator';
import { ApiError } from '../utils/ApiError.js';

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(errors.array()[0].msg, 400);
  }
  next();
};

export const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  handleValidation
];

export const validateCreateUser = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email address'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required'),
  body('role')
    .isIn(['admin', 'front_desk'])
    .withMessage('Invalid role'),
  handleValidation
];

export const validateUpdateUser = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty'),
  body('role')
    .optional()
    .isIn(['admin', 'front_desk'])
    .withMessage('Invalid role'),
  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Invalid status'),
  handleValidation
];