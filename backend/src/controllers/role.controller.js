import { asyncHandler } from "../utils/asyncHandler.utils.js";
import { ApiError } from "../utils/ApiError.utils.js";
import { ApiResponse } from "../utils/ApiResponse.utils.js";
import { Role } from "../models/Role.model.js";

const createRole = asyncHandler(async (req, res) => {
    const { name, description, permissions } = req.body;

    const existingRole = await Role.findOne({ name });
    if (existingRole) {
        throw new ApiError(400, "Role with this name already exists");
    }

    const role = await Role.create({
        name,
        description,
        permissions: permissions || []
    });

    const createdRole = await Role.findById(role._id).populate('permissions');

    res.status(201).json(new ApiResponse(201, { role: createdRole }, "Role created successfully"));
});

const getAllRoles = asyncHandler(async (req, res) => {
    const roles = await Role.find({}).populate('permissions');

    res.status(200).json(new ApiResponse(200, { roles }, "Roles fetched successfully"));
});

const getRoleById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const role = await Role.findById(id).populate('permissions');

    if (!role) {
        throw new ApiError(404, "Role not found");
    }

    res.status(200).json(new ApiResponse(200, { role }, "Role fetched successfully"));
});

const updateRole = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, description, permissions } = req.body;

    const role = await Role.findById(id);

    if (!role) {
        throw new ApiError(404, "Role not found");
    }

    if (name && name !== role.name) {
        const existingRole = await Role.findOne({ name });
        if (existingRole) {
            throw new ApiError(400, "Role with this name already exists");
        }
        role.name = name;
    }

    if (description) role.description = description;
    if (permissions) role.permissions = permissions;

    await role.save();

    const updatedRole = await Role.findById(id).populate('permissions');

    res.status(200).json(new ApiResponse(200, { role: updatedRole }, "Role updated successfully"));
});

const deleteRole = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const role = await Role.findById(id);

    if (!role) {
        throw new ApiError(404, "Role not found");
    }

    await Role.findByIdAndDelete(id);

    res.status(200).json(new ApiResponse(200, {}, "Role deleted successfully"));
});

export {
    createRole,
    getAllRoles,
    getRoleById,
    updateRole,
    deleteRole
};
