import { Router } from "express";
import {
    register,
    login,
    logout,
    refreshAccessToken,
    getProfile,
    updateProfile,
    uploadProfilePicture,
    removeProfilePicture
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/profilePic.middleware.js";

const router = Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").post(verifyJWT, logout);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/profile").get(verifyJWT, getProfile).patch(verifyJWT, updateProfile);
router.route("/upload-profile-picture").post(verifyJWT, upload.single('profilePicture'), uploadProfilePicture);
router.route("/remove-profile-picture").delete(verifyJWT, removeProfilePicture);

export default router;