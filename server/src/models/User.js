import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    gender: { type: String, enum: ["male", "female", "other"], required: true },
    mobile: { type: String, required: true },
    address: { type: String, required: true },
    role: { type: String, enum: ["buyer", "seller"], default: "buyer" },
    createdAt: { type: Date, default: Date.now },
});

// Password hashing before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Method to compare passwords
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// JWT generation methods
userSchema.methods.generateAccessToken = function () {
    return jwt.sign({ userId: this._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" });
};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign({ userId: this._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
};

const User = mongoose.model("User", userSchema);

export default User;