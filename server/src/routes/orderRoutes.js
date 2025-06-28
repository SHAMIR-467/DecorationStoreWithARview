import express from 'express';
import { 
  createOrder, 
  getUserOrders,
  getOrderDetails,
  cancelOrder,
  getSellerOrders,
  getSellerOrderDetails,
  updateOrderStatus,
  getAllOrders
} from '../controllers/orderController.js';
import { verifyJWT, isSeller, isAdmin,isSellerOrAdmin    } from '../middleware/auth.middleware.js';

const router = express.Router();

// User routes
router.post('/create', verifyJWT, createOrder);
router.get('/user', verifyJWT, getUserOrders);
router.get('/user/:orderId', verifyJWT, getOrderDetails);
router.put('/cancel/:orderId', verifyJWT, cancelOrder);

// Seller routes
router.get('/seller', verifyJWT, isSeller, getSellerOrders);
router.get('/seller/:orderId', verifyJWT, isSeller, getSellerOrderDetails);
// For routes where either seller OR admin is allowed
router.put('/status/:orderId', verifyJWT, isSellerOrAdmin, updateOrderStatus);

// Admin routes
router.get('/admin/all', verifyJWT, isAdmin, getAllOrders);

export default router;