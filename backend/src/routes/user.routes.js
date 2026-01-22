import { Router } from "express";
import {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
} from "../controllers/user.controller.js";
import { verifyJWT, authorize } from "../middleware/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/")
    .get(authorize("admin"), getAllUsers);

router.route("/:id")
    .get(authorize("admin", "user"), getUserById) 
    .patch(authorize("admin", "user"), updateUser) 
    .delete(authorize("admin"), deleteUser); 

export default router;
