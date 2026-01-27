import { asyncHandler } from "../utils/asyncHandler.utils.js";
import { ApiError } from "../utils/ApiError.utils.js";
import { ApiResponse } from "../utils/ApiResponse.utils.js";
import { User } from "../models/User.model.js";
import { hashPassword } from "../utils/auth.utils.js";

const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}).populate('role').populate('manager', 'firstName lastName').select('-password -refreshToken');

    res.status(200).json(new ApiResponse(200, { users }, "Users fetched successfully"));
});

const getUserById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const user = await User.findById(id).populate('role').populate('manager', 'firstName lastName').select('-password -refreshToken');

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    res.status(200).json(new ApiResponse(200, { user }, "User fetched successfully"));
});

const updateUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const {
        firstName, lastName, email, role, isActive, password,
        dateOfBirth, gender, nationalId, contactInfo, jobTitle,
        department, manager, employmentStatus
    } = req.body;

    const user = await User.findById(id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (email && email !== user.email) {
        const existingUser = await User.findOne({ email });
        if (existingUser && existingUser._id.toString() !== id) {
            throw new ApiError(409, "Email already in use by another user.");
        }
        user.email = email;
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;
    if (gender) user.gender = gender;
    if (nationalId) user.nationalId = nationalId;
    if (contactInfo) user.contactInfo = { ...user.contactInfo, ...contactInfo };
    if (jobTitle) user.jobTitle = jobTitle;
    if (department) user.department = department;
    if (manager) user.manager = manager;
    if (employmentStatus) user.employmentStatus = employmentStatus;

    if (password) {
        user.password = await hashPassword(password);
    }

    await user.save({ validateBeforeSave: false });

    const updatedUser = await User.findById(id).populate('role').populate('manager', 'firstName lastName').select('-password -refreshToken');

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
