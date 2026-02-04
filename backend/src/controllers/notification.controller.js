import { asyncHandler } from "../utils/asyncHandler.utils.js";
import { ApiError } from "../utils/ApiError.utils.js";
import { ApiResponse } from "../utils/ApiResponse.utils.js";
import { Notification } from "../models/Notification.model.js";

const getNotifications = asyncHandler(async (req, res) => {
    const defaultNotification = {
        _id: "default-greeting",
        title: "Welcome to the ERP System",
        message: "Hello! Welcome to our Employee Resource Planning system. We're glad to have you on board. Feel free to explore the features and let us know if you need any assistance.",
        type: "info",
        isRead: false,
        createdAt: new Date().toISOString()
    };

    res.status(200).json(new ApiResponse(200, {
        notifications: [defaultNotification]
    }, "Notifications fetched successfully"));
});

const markAsRead = asyncHandler(async (req, res) => {
    res.status(200).json(new ApiResponse(200, {}, "Notification marked as read"));
});

const markAllAsRead = asyncHandler(async (req, res) => {
    res.status(200).json(new ApiResponse(200, {}, "All notifications marked as read"));
});

const createNotification = asyncHandler(async (req, res) => {
    const { userId, title, message, type } = req.body;

    const notification = await Notification.create({
        user: userId,
        title,
        message,
        type: type || "info"
    });

    res.status(201).json(new ApiResponse(201, {
        notification
    }, "Notification created successfully"));
});

export {
    getNotifications,
    markAsRead,
    markAllAsRead,
    createNotification
};
