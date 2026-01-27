import { asyncHandler } from "../utils/asyncHandler.utils.js";
import { hashPassword } from "../utils/auth.utils.js";
import { ApiError } from "../utils/ApiError.utils.js";
import { ApiResponse } from "../utils/ApiResponse.utils.js";
import { User } from "../models/User.model.js";
import { Otp } from "../models/Otp.model.js";
import { EmailService } from "../service/email.service.js";
import crypto from 'crypto';

const emailService = new EmailService();

const sendOtp = asyncHandler(async (req, res) => {
    const { email, type } = req.body;

    if (!email || !type) {
        throw new ApiError(400, "Email and type are required");
    }

    if (!['verification', 'forgotPassword'].includes(type)) {
        throw new ApiError(400, "Invalid OTP type");
    }

    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Generate 6-digit OTP
    const otpCode = crypto.randomInt(100000, 999999).toString();

    // Set expiration time (10 minutes from now)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Delete any existing OTP for this user and type
    await Otp.deleteMany({ userId: user._id, otpType: type });

    // Create new OTP
    const otp = await Otp.create({
        userId: user._id,
        otpCode,
        otpType: type,
        expiresAt
    });

    // Send email
    await emailService.sendOtpEmail(email, otpCode, type);

    res.status(200).json(new ApiResponse(200, {}, "OTP sent successfully"));
});

const verifyOtp = asyncHandler(async (req, res) => {
    const { email, otpCode, type } = req.body;

    if (!email || !otpCode || !type) {
        throw new ApiError(400, "Email, OTP code, and type are required");
    }

    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const otp = await Otp.findOne({
        userId: user._id,
        otpCode,
        otpType: type,
        expiresAt: { $gt: new Date() }
    });

    if (!otp) {
        throw new ApiError(400, "Invalid or expired OTP");
    }

    // Delete the OTP after successful verification
    await Otp.deleteOne({ _id: otp._id });

    res.status(200).json(new ApiResponse(200, {}, "OTP verified successfully"));
});

const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        throw new ApiError(400, "Email is required");
    }

    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Generate 6-digit OTP for password reset
    const otpCode = crypto.randomInt(100000, 999999).toString();

    // Set expiration time (10 minutes from now)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Delete any existing forgot password OTP
    await Otp.deleteMany({ userId: user._id, otpType: 'forgotPassword' });

    // Create new OTP
    await Otp.create({
        userId: user._id,
        otpCode,
        otpType: 'forgotPassword',
        expiresAt
    });

    // Send email
    await emailService.sendOtpEmail(email, otpCode, 'forgotPassword');

    res.status(200).json(new ApiResponse(200, {}, "Password reset OTP sent successfully"));
});

const resetPassword = asyncHandler(async (req, res) => {
    const { email, otpCode, newPassword } = req.body;

    if (!email || !otpCode || !newPassword) {
        throw new ApiError(400, "Email, OTP code, and new password are required");
    }

    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const otp = await Otp.findOne({
        userId: user._id,
        otpCode,
        otpType: 'forgotPassword',
        expiresAt: { $gt: new Date() }
    });

    if (!otp) {
        throw new ApiError(400, "Invalid or expired OTP");
    }

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);

    // Update user's password
    user.password = hashedPassword;
    await user.save();

    // Delete the OTP
    await Otp.deleteOne({ _id: otp._id });

    // Send confirmation email
    await emailService.sendResetPasswordEmail(email);

    res.status(200).json(new ApiResponse(200, {}, "Password reset successfully"));
});

export {
    sendOtp,
    verifyOtp,
    forgotPassword,
    resetPassword
};
