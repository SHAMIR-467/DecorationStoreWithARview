const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');

// Get all users (restricted to admin)
router.get('/users', authMiddleware.verifyToken, authMiddleware.isAdmin, adminController.getAllUsers);

// Get detailed product data for admin
router.get('/products', authMiddleware.verifyToken, authMiddleware.isAdmin, adminController.getAllProducts);

// Get dashboard statistics
router.get('/dashboard', authMiddleware.verifyToken, authMiddleware.isAdmin, adminController.getDashboardStats);

module.exports = router;
