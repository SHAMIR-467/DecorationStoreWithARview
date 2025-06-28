// src/routes/authRoutes.js

import express from 'express';
import {
    registerUser,
    loginUser,
    logoutUser,
    checkAuth,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    /////////////////////
     
} from '../controllers/authController.js';
import { 
    verifyJWT, 
    isAuthenticated, 
    rateLimiter, 
    verifyRole 
} from '../middleware/auth.middleware.js';

const router = express.Router();

// Public Routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refresh-token', refreshAccessToken);

// Protected Routes
router.use(verifyJWT); // Middleware for all routes below

// User routes
router.get('/me', getCurrentUser);
router.post('/logout', logoutUser);
router.get('/check-auth', checkAuth);
router.put('/update-profile', updateAccountDetails);
router.put('/change-password', changeCurrentPassword);

// Role-based routes
router.get('/seller/profile', verifyJWT, (req, res, next) => {
    verifyRole(['seller'])(req, res, next);
}, getCurrentUser);

router.get('/buyer/profile', verifyJWT, (req, res, next) => {
    verifyRole(['buyer'])(req, res, next);
}, getCurrentUser);

router.get('/admin/profile', verifyJWT, (req, res, next) => {
    verifyRole(['admin'])(req, res, next);
}, getCurrentUser);

// Account Management
router.put('/seller/update-profile', 
    verifyJWT, 
    (req, res, next) => verifyRole(['seller'])(req, res, next),
    updateAccountDetails
);

router.put('/buyer/update-profile', 
    verifyJWT, 
    (req, res, next) => verifyRole(['buyer'])(req, res, next),
    updateAccountDetails
);

export default router;