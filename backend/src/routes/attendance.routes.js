import { Router } from "express";
import {
    punchIn,
    punchOut,
    getTodayAttendance,
    getAttendanceHistory
} from "../controllers/attendance.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.use(verifyJWT); 

router.route("/punch-in").post(punchIn);
router.route("/punch-out").post(punchOut);
router.route("/today").get(getTodayAttendance);
router.route("/history").get(getAttendanceHistory);

export default router;
