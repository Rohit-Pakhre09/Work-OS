import { Router } from "express";
import {
    sendOtp,
    verifyOtp,
    forgotPassword,
    resetPassword
} from "../controllers/otp.controller.js";

const router = Router();

router.route("/send-otp").post(sendOtp);
router.route("/verify-otp").post(verifyOtp);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password").post(resetPassword);

export default router;
