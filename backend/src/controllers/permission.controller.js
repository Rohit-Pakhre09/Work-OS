import { asyncHandler } from "../utils/asyncHandler.utils.js";
import { ApiError } from "../utils/ApiError.utils.js";
import { ApiResponse } from "../utils/ApiResponse.utils.js";
import { Permission } from "../models/Permission.model.js";

const createPermission = asyncHandler(async (req, res) => {
    const { name, description, resource, action } = req.body;

    const existingPermission = await Permission.findOne({ name });
    if (existingPermission) {
        throw new ApiError(400, "Permission with this name already exists");
    }

    const permission = await Permission.create({
        name,
        description,
        resource,
        action
    });

    res.status(201).json(new ApiResponse(201, { permission }, "Permission created successfully"));
});

const getAllPermissions = asyncHandler(async (req, res) => {
    const permissions = await Permission.find({});

    res.status(200).json(new ApiResponse(200, { permissions }, "Permissions fetched successfully"));
});

const getPermissionById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const permission = await Permission.findById(id);

    if (!permission) {
        throw new ApiError(404, "Permission not found");
    }

    res.status(200).json(new ApiResponse(200, { permission }, "Permission fetched successfully"));
});

const updatePermission = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, description, resource, action } = req.body;

    const permission = await Permission.findById(id);

    if (!permission) {
        throw new ApiError(404, "Permission not found");
    }

    if (name && name !== permission.name) {
        const existingPermission = await Permission.findOne({ name });
        if (existingPermission) {
            throw new ApiError(400, "Permission with this name already exists");
        }
        permission.name = name;
    }

    if (description) permission.description = description;
    if (resource) permission.resource = resource;
    if (action) permission.action = action;

    await permission.save();

    res.status(200).json(new ApiResponse(200, { permission }, "Permission updated successfully"));
});

const deletePermission = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const permission = await Permission.findById(id);

    if (!permission) {
        throw new ApiError(404, "Permission not found");
    }

    await Permission.findByIdAndDelete(id);

    res.status(200).json(new ApiResponse(200, {}, "Permission deleted successfully"));
});

export {
    createPermission,
    getAllPermissions,
    getPermissionById,
    updatePermission,
    deletePermission
};
