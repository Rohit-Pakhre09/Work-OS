import { Router } from "express";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  createNotification,
} from "../controllers/notification.controller.js";

const router = Router();

router.get("/", getNotifications);
router.post("/", createNotification);
router.patch("/:id/read", markAsRead);
router.patch("/mark-all-read", markAllAsRead);

export default router;