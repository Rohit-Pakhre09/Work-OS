import { asyncHandler } from "../utils/asyncHandler.utils.js";
import { hashPassword, verifyPassword } from "../utils/auth.utils.js";
import { ApiError } from "../utils/ApiError.utils.js";
import { ApiResponse } from "../utils/ApiResponse.utils.js";
import { User } from "../models/User.model.js";
import { Role } from "../models/Role.model.js";
import { AuthService } from "../service/auth.service.js";

const authService = new AuthService();

const register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    let { role } = req.body;

    if (!name || !email || !password) {
        throw new ApiError(400, "Name, email, and password are required");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ApiError(409, "User with this email already exists");
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
        name,
        email,
        password: hashedPassword,
        role
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
            name: user.name,
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
            name: user.name,
            email: user.email,
            role: user.role
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

export {
    register,
    login,
    logout,
    refreshAccessToken
};
