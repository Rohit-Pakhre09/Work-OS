import { Router } from "express";
import {
    createPermission,
    getAllPermissions,
    getPermissionById,
    updatePermission,
    deletePermission
} from "../controllers/permission.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.use(verifyJWT); 

router.route("/").post(createPermission);
router.route("/").get(getAllPermissions);
router.route("/:id").get(getPermissionById);
router.route("/:id").put(updatePermission);
router.route("/:id").delete(deletePermission);

export default router;