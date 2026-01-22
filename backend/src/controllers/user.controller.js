import { asyncHandler } from "../utils/asyncHandler.utils.js";
import { ApiError } from "../utils/ApiError.utils.js";
import { ApiResponse } from "../utils/ApiResponse.utils.js";
import { User } from "../models/User.model.js";
import { hashPassword } from "../utils/auth.utils.js"; 

const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}).populate('role').select('-password -refreshToken');

    res.status(200).json(new ApiResponse(200, { users }, "Users fetched successfully"));
});

const getUserById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const user = await User.findById(id).populate('role').select('-password -refreshToken');

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    res.status(200).json(new ApiResponse(200, { user }, "User fetched successfully"));
});

const updateUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, email, role, isActive, password } = req.body; 

    const user = await User.findById(id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;

    if (password) {
        user.password = await hashPassword(password);
    }

    await user.save();

    const updatedUser = await User.findById(id).populate('role').select('-password -refreshToken');

    res.status(200).json(new ApiResponse(200, { user: updatedUser }, "User updated successfully"));
});

const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    await User.findByIdAndDelete(id);

    res.status(200).json(new ApiResponse(200, {}, "User deleted successfully"));
});

export {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
};
