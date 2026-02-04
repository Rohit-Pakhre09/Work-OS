import { User } from "../models/User.model.js";
import { Role } from "../models/Role.model.js";
import { Permission } from "../models/Permission.model.js";
import { asyncHandler } from "../utils/asyncHandler.utils.js";

export const getAdminStats = asyncHandler(async (req, res) => {
  const userCount = await User.countDocuments();
  const roleCount = await Role.countDocuments();
  const permissionCount = await Permission.countDocuments();

  res.status(200).json({
    success: true,
    data: {
      users: userCount,
      roles: roleCount,
      permissions: permissionCount,
    },
  });
});

export const getEmployeeStats = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      pendingTasks: 5,
      upcomingDeadlines: 2,
    },
  });
});
