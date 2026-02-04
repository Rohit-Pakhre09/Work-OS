import "dotenv/config";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.utils.js";
import { hashPassword, verifyPassword } from "../utils/auth.utils.js";
import { ApiError } from "../utils/ApiError.utils.js";
import { ApiResponse } from "../utils/ApiResponse.utils.js";
import { User } from "../models/User.model.js";
import { Role } from "../models/Role.model.js";
import { AuthService } from "../service/auth.service.js";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

const authService = new AuthService();

const register = asyncHandler(async (req, res) => {
    const { firstName, lastName, email, password, dateOfBirth, gender, nationalId, phone, address, jobTitle, department } = req.body;
    let { role } = req.body;

    if (!firstName || !lastName || !email || !password) {
        throw new ApiError(400, "First name, last name, email, and password are required");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ApiError(409, "User with this email already exists");
    }

    let employeeId;
    let isIdUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isIdUnique && attempts < maxAttempts) {
        const lastUser = await User.findOne({ employeeId: { $exists: true } })
            .sort({ employeeId: -1 })
            .select('employeeId');

        let nextNumber = 1;
        if (lastUser && lastUser.employeeId) {
            const lastNumber = parseInt(lastUser.employeeId.replace('EMP', ''), 10);
            if (!isNaN(lastNumber)) {
                nextNumber = lastNumber + 1;
            }
        }

        employeeId = `EMP${String(nextNumber).padStart(5, '0')}`;

        const existingUser = await User.findOne({ employeeId });
        if (!existingUser) {
            isIdUnique = true;
        }
        attempts++;
    }

    if (!isIdUnique) {
        throw new ApiError(500, "Unable to generate unique employee ID after multiple attempts");
    }
    if (!role) {
        let defaultEmployeeRole = await Role.findOne({ name: "Employee" });
        if (!defaultEmployeeRole) {
            defaultEmployeeRole = new Role({
                name: "Employee",
                description: "Standard employee role",
                permissions: []
            });
            await defaultEmployeeRole.save();
        }
        role = defaultEmployeeRole._id;
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
        employeeId,
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role,
        dateOfBirth,
        gender,
        nationalId,
        contactInfo: {
            phone,
            address
        },
        jobTitle,
        department
    });

    const accessToken = authService.generateAccessToken({ _id: user._id, email: user.email });
    const refreshToken = authService.generateRefreshToken({ _id: user._id });

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000
    });

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json(new ApiResponse(201, {
        user: {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role
        },
    }, "User registered successfully"));
});

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    const user = await User.findOne({ email }).populate('role');
    if (!user) {
        throw new ApiError(401, "Invalid credentials");
    }

    const isPasswordValid = await verifyPassword(user.password, password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials");
    }

    if (!user.isActive) {
        throw new ApiError(401, "Account is deactivated");
    }

    const accessToken = authService.generateAccessToken({ _id: user._id, email: user.email });
    const refreshToken = authService.generateRefreshToken({ _id: user._id });

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000
    });

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json(new ApiResponse(200, {
        user: {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            profilePicture: user.profilePicture
        },
        accessToken,
        refreshToken
    }, "Login successful"));
});

const logout = asyncHandler(async (req, res) => {
    const user = req.user;

    await User.findByIdAndUpdate(user._id, { refreshToken: null });

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.status(200).json(new ApiResponse(200, {}, "Logout successful"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Refresh token is required");
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        const user = await User.findById(decodedToken._id);
        if (!user || user.refreshToken !== incomingRefreshToken) {
            throw new ApiError(401, "Invalid refresh token");
        }

        const accessToken = authService.generateAccessToken({ _id: user._id, email: user.email });
        const refreshToken = authService.generateRefreshToken({ _id: user._id });

        user.refreshToken = refreshToken;
        await user.save();

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 15 * 60 * 1000
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json(new ApiResponse(200, {
            accessToken,
            refreshToken
        }, "Access token refreshed"));
    } catch (error) {
        throw new ApiError(401, "Invalid refresh token");
    }
});

const getProfile = asyncHandler(async (req, res) => {
    const user = req.user;

    const userProfile = await User.findById(user._id)
        .populate('role')
        .populate('manager', 'firstName lastName')
        .select('-password -refreshToken');

    if (!userProfile) {
        throw new ApiError(404, "User not found");
    }

    res.status(200).json(new ApiResponse(200, {
        user: userProfile
    }, "Profile fetched successfully"));
});

const updateProfile = asyncHandler(async (req, res) => {
    const user = req.user;
    const updateData = req.body;

    delete updateData.password;
    delete updateData.role;
    delete updateData.isActive;
    delete updateData.employeeId;
    delete updateData.refreshToken;
    delete updateData.manager;
    delete updateData.employmentStatus;

    if (updateData.contactInfo) {
        updateData.contactInfo = {
            phone: updateData.contactInfo.phone || '',
            address: updateData.contactInfo.address || ''
        };
    }

    const updatedUser = await User.findByIdAndUpdate(
        user._id,
        { $set: updateData },
        { new: true }
    )
        .populate('role')
        .populate('manager', 'firstName lastName')
        .select('-password -refreshToken');

    if (!updatedUser) {
        throw new ApiError(404, "User not found");
    }

    res.status(200).json(new ApiResponse(200, {
        user: updatedUser
    }, "Profile updated successfully"));
});

const uploadProfilePicture = asyncHandler(async (req, res) => {
    const user = req.user;

    if (!req.file) {
        throw new ApiError(400, "Profile picture is required");
    }

    try {
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream({
                folder: 'profile-pictures',
                width: 300,
                height: 300,
                crop: 'fill',
                gravity: 'face',
                quality: 'auto',
                fetch_format: 'auto',
                resource_type: 'auto'
            }, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
            uploadStream.end(req.file.buffer);
        });

        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            { profilePicture: result.secure_url },
            { new: true }
        ).populate('role').populate('manager', 'firstName lastName').select('-password -refreshToken');

        if (!updatedUser) {
            throw new ApiError(404, "User not found");
        }

        res.status(200).json(new ApiResponse(200, {
            user: updatedUser
        }, "Profile picture updated successfully"));
    } catch (error) {
        console.error('Profile picture upload error:', error);

        if (error.message && error.message.includes('api_key')) {
            throw new ApiError(500, "Cloudinary configuration error: API key not found");
        }

        throw new ApiError(500, `Failed to upload profile picture: ${error.message}`);
    }
});

const removeProfilePicture = asyncHandler(async (req, res) => {
    const user = req.user;

    try {
        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            { profilePicture: null },
            { new: true }
        ).populate('role').populate('manager', 'firstName lastName').select('-password -refreshToken');

        if (!updatedUser) {
            throw new ApiError(404, "User not found");
        }

        res.status(200).json(new ApiResponse(200, {
            user: updatedUser
        }, "Profile picture removed successfully"));
    } catch (error) {
        console.error('Profile picture removal error:', error);
        throw new ApiError(500, `Failed to remove profile picture: ${error.message}`);
    }
});

export {
    register,
    login,
    logout,
    refreshAccessToken,
    getProfile,
    updateProfile,
    uploadProfilePicture,
    removeProfilePicture
};
