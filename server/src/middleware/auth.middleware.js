import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Verify JWT token
const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken.userId).select("-password -refreshToken");

        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }

        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});

// Verify user role
const verifyRole = (...allowedRoles) => {
    return asyncHandler(async (req, res, next) => {
        if (!req?.user?.role) {
            throw new ApiError(401, "Unauthorized request");
        }
        
        if (!allowedRoles.includes(req.user.role)) {
            throw new ApiError(403, "You are not authorized to perform this action");
        }
        
        next();
    });
};

// Check if user is authenticated and active
const isAuthenticated = asyncHandler(async (req, res, next) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        throw new ApiError(401, "Please login to access this resource");
    }

    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken.userId).select("-password -refreshToken");

        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }

        if (!user.isActive) {
            throw new ApiError(403, "User account is deactivated");
        }

        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, "Invalid or expired token");
    }
});

// Verify seller middleware
const isSeller = asyncHandler(async (req, res, next) => {
    if (req.user.role !== "seller") {
        throw new ApiError(403, "Only sellers can access this resource");
    }
    next();
});

// Verify seller or admin middleware
const isSellerOrAdmin = asyncHandler(async (req, res, next) => {
    if (req.user.role !== "seller" && req.user.role !== "admin") {
        throw new ApiError(403, "Only sellers or admins can access this resource");
    }
    next();
});
// Verify buyer middleware
const isBuyer = asyncHandler(async (req, res, next) => {
    if (req.user.role !== "buyer") {
        throw new ApiError(403, "Only buyers can access this resource");
    }
    next();
});

// Verify admin middleware
const isAdmin = asyncHandler(async (req, res, next) => {
    if (req.user.role !== "admin") {
        throw new ApiError(403, "Only admins can access this resource");
    }
    next();
});

// Rate limiting middleware
const rateLimiter = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later.",
};

// Check if user owns the resource
const isResourceOwner = (model) => {
    return asyncHandler(async (req, res, next) => {
        const resourceId = req.params.id;
        const userId = req.user._id;

        const resource = await model.findById(resourceId);
        
        if (!resource) {
            throw new ApiError(404, "Resource not found");
        }

        if (resource.user.toString() !== userId.toString()) {
            throw new ApiError(403, "You don't have permission to modify this resource");
        }

        req.resource = resource;
        next();
    });
};

export {
    verifyJWT,
    verifyRole,
    isAuthenticated,
    isSeller,
    isBuyer,
    isAdmin,
    rateLimiter,
    isResourceOwner,
    isSellerOrAdmin
};