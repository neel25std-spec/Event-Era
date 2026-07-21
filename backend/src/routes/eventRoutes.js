import { Router } from 'express';
import {
  getAllEvents,
  getNearbyEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  joinEvent,
  leaveEvent,
  getEventComments,
  createComment,
  getUserProfileEvents,
  searchEvents,
} from '../controllers/eventController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Public routes
router.get('/', getAllEvents);
router.get('/nearby', getNearbyEvents);

// Get user profile events (must be before /:id route so it isn't matched as an ID)
router.get('/user/profile', requireAuth, getUserProfileEvents);

// Search events
router.get('/search', searchEvents);

// Get event details (public)
router.get('/:id', getEventById);

// Get event comments (public)
router.get('/:id/comments', getEventComments);

// Protected routes (require authentication)
router.post('/', requireAuth, createEvent);
router.put('/:id', requireAuth, updateEvent);
router.delete('/:id', requireAuth, deleteEvent);

// Join / Leave / Comment routes (require authentication)
router.post('/:id/join', requireAuth, joinEvent);
router.post('/:id/leave', requireAuth, leaveEvent);
router.post('/:id/comments', requireAuth, createComment);

export default router;
