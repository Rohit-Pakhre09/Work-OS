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

    const otpCode = crypto.randomInt(100000, 999999).toString();

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await Otp.deleteMany({ userId: user._id, otpType: type });

    const otp = await Otp.create({
        userId: user._id,
        otpCode,
        otpType: type,
        expiresAt
    });

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

    const otpCode = crypto.randomInt(100000, 999999).toString();

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await Otp.deleteMany({ userId: user._id, otpType: 'forgotPassword' });

    await Otp.create({
        userId: user._id,
        otpCode,
        otpType: 'forgotPassword',
        expiresAt
    });

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

    const hashedPassword = await hashPassword(newPassword);

    user.password = hashedPassword;
    await user.save();

    await Otp.deleteOne({ _id: otp._id });
    await emailService.sendResetPasswordEmail(email);

    res.status(200).json(new ApiResponse(200, {}, "Password reset successfully"));
});

export {
    sendOtp,
    verifyOtp,
    forgotPassword,
    resetPassword
};
