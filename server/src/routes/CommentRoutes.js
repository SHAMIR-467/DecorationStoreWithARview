import express from 'express';
import { 
  getProductComments, 
  createComment, 
  updateComment, 
  deleteComment 
} from '../controllers/CommentController.js';
import {  verifyJWT } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/products/:productId/comments', getProductComments);

// Protected routes requiring authentication
router.post('/products/:productId/comments', verifyJWT, createComment);
router.patch('/comments/:commentId', verifyJWT, updateComment);
router.delete('/comments/:commentId', verifyJWT, deleteComment);

export default router;