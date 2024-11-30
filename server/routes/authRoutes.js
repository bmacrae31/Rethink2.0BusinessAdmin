import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { validateLogin } from '../middleware/validation.js';
import { login, getCurrentUser } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', validateLogin, login);
router.get('/me', authenticate, getCurrentUser);

export default router;