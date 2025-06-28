import express from 'express';
import { verifyJWT } from '../middleware/auth.middleware.js';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist
} from '../controllers/wishlistController.js';

const router = express.Router();

// All routes need authentication
router.use(verifyJWT);

router.route('/')
  .get(getWishlist)
  .post(addToWishlist)
  .delete(clearWishlist);

router.route('/:productId')
  .delete(removeFromWishlist);

export default router;