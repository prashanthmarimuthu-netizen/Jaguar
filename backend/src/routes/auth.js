import express from 'express';
import AuthController from '../controllers/authController.js';
import { validateSignup, validateSignin } from '../middleware/validation.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/signup', validateSignup, AuthController.signup);
router.post('/signin', validateSignin, AuthController.signin);
router.post('/verify-email', AuthController.verifyEmail);

// Protected routes
router.get('/me', authenticate, AuthController.getCurrentUser);

export default router;