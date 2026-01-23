import { Router } from "express";
import {
    createRole,
    getAllRoles,
    getRoleById,
    updateRole,
    deleteRole
} from "../controllers/role.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/").post(createRole);
router.route("/").get(getAllRoles);
router.route("/:id").get(getRoleById);
router.route("/:id").put(updateRole);
router.route("/:id").delete(deleteRole);

export default router;