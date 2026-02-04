import express from "express";
import { getAdminStats, getEmployeeStats } from "../controllers/stats.controller.js";
import { verifyJWT, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/admin", verifyJWT, authorize("admin"), getAdminStats);
router.get("/employee", verifyJWT, getEmployeeStats);

export default router;
