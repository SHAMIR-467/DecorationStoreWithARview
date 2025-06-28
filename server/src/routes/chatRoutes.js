import express from 'express';
import chatController from '../controllers/chatController.js';
import { isAuthenticated} from '../middleware/auth.middleware.js';

const router = express.Router();

// Get chat history for a user
router.get('/history/:userId', isAuthenticated, chatController.getChatHistory);

// Save a new message
router.post('/message', isAuthenticated, chatController.saveMessage);

// Clear chat history for a user
router.delete('/history/:userId', isAuthenticated, chatController.clearChatHistory);

export default router;