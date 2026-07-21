import { Router } from 'express';
import {
  signup,
  login,
  logout,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';

const router = Router();

// Public auth routes — no authentication required
router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);

// These routes require a valid token
router.post('/logout', logout);
router.post('/reset-password', resetPassword);

export default router;
