import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// ✅ Generate Access and Refresh Tokens
const generateAccessAndRefreshTokens = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const accessToken = jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1d" });
    const refreshToken = jwt.sign({ userId: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
};

// ✅ Register User
const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password, gender, mobile, address, role } = req.body;
    if ([username, email, password, gender, mobile, address].some((field) => !field.trim())) {
        throw new ApiError(400, "All fields are required");
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
        throw new ApiError(409, "User with this email or username already exists");
    }

    const user = await User.create({
        username: username.toLowerCase(),
        email,
        password,
        gender,
        mobile,
        address,
        role,
    });

    const createdUser = await User.findById(user._id).select("-password");

    res.status(201).json(new ApiResponse(201, createdUser, "User registered successfully"));
});

// ✅ Login User
const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    if (!username && !email) {
        throw new ApiError(400, "Username or email is required");
    }
    if (!password) {
        throw new ApiError(400, "Password is required");
    }

    const user = await User.findOne({ $or: [{ username }, { email }] });
    if (!user || !(await user.isPasswordCorrect(password))) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    let redirectUrl = user.role === "seller" ? "/admin/dashboard" : "/";

    res.status(200)
        .cookie("accessToken", accessToken, { httpOnly: true, secure: true, sameSite: "Strict" })
        .cookie("refreshToken", refreshToken, { httpOnly: true, secure: true, sameSite: "Strict" })
        .json(new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken, redirectUrl }, "User logged in successfully."));
});

// ✅ Logout User (Fixed)
const logoutUser = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
        console.log("Logout attempt without refresh token");
        throw new ApiError(400, "Refresh token is required");
    }

    const user = await User.findOneAndUpdate(
        { refreshToken },
        { $unset: { refreshToken: 1 } },
        { new: true }
    );

    if (!user) {
        console.log(`Logout failed: User not found for token ${refreshToken}`);
        throw new ApiError(404, "User not found or already logged out");
    }

    console.log(`User ${user._id} logged out successfully`);

    res.status(200)
        .clearCookie("accessToken", { httpOnly: true, secure: true, sameSite: "Strict" })
        .clearCookie("refreshToken", { httpOnly: true, secure: true, sameSite: "Strict" })
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});


// ✅ Refresh Access Token (Fixed)
const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decodedToken.userId);

        if (!user || incomingRefreshToken !== user.refreshToken) {
            throw new ApiError(401, "Invalid or expired refresh token");
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

        res.status(200)
            .cookie("accessToken", accessToken, { httpOnly: true, secure: true, sameSite: "Strict" })
            .cookie("refreshToken", refreshToken, { httpOnly: true, secure: true, sameSite: "Strict" })
            .json(new ApiResponse(200, { accessToken, refreshToken }, "Access token refreshed"));
    } catch (error) {
        throw new ApiError(401, "Invalid refresh token");
    }
});

// ✅ Check Authentication
const checkAuth = asyncHandler(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "User not authenticated",
        });
    }

    return res.status(200).json(new ApiResponse(200, {
        _id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
    }, "User authenticated successfully"));
});

// ✅ Change Password
const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!(await user.isPasswordCorrect(oldPassword))) {
        throw new ApiError(400, "Invalid old password");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"));
});

// ✅ Get Current User
const getCurrentUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select("-password");
    res.status(200).json(new ApiResponse(200, user, "User fetched successfully"));
});

// ✅ Update Account Details
const updateAccountDetails = asyncHandler(async (req, res) => {
    const { username, email } = req.body;
    if (!username || !email) {
        throw new ApiError(400, "All fields are required");
    }

    const updatedUser = await User.findByIdAndUpdate(req.user._id, { username, email }, { new: true }).select("-password");
    res.status(200).json(new ApiResponse(200, updatedUser, "Account details updated successfully"));
});

export {
    registerUser,
    loginUser,
    logoutUser,
    checkAuth,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
};
