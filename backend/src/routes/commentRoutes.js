import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { deleteComment } from '../controllers/eventController.js';

const router = Router();

// DELETE /api/comments/:id — delete own comment
router.delete('/:id', requireAuth, deleteComment);

export default router;
