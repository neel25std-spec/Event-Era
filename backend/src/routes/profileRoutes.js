import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/auth.js';
import {
  getProfile,
  updateProfile,
  uploadAvatar,
  deleteAvatar,
} from '../controllers/profileController.js';

const router = Router();

// Configure multer for in-memory file handling (no disk storage needed)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

// All profile routes require authentication
router.get('/', requireAuth, getProfile);
router.put('/', requireAuth, updateProfile);
router.post('/avatar', requireAuth, upload.single('avatar'), uploadAvatar);
router.delete('/avatar', requireAuth, deleteAvatar);

export default router;
