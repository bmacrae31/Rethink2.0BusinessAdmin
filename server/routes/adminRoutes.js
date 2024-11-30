import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateCreateUser, validateUpdateUser } from '../middleware/validation.js';
import {
  createUser,
  updateUser,
  resetUserPassword,
  listUsers,
  deleteUser
} from '../controllers/adminController.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticate, authorize(['admin']));

router.post('/users', validateCreateUser, createUser);
router.get('/users', listUsers);
router.put('/users/:id', validateUpdateUser, updateUser);
router.post('/users/:id/reset-password', resetUserPassword);
router.delete('/users/:id', deleteUser);

export default router;