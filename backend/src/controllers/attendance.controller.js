import { asyncHandler } from "../utils/asyncHandler.utils.js";
import { ApiError } from "../utils/ApiError.utils.js";
import { ApiResponse } from "../utils/ApiResponse.utils.js";
import { Attendance } from "../models/Attendance.model.js";

const getTodayDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
};

const punchIn = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const today = getTodayDate();

    let attendance = await Attendance.findOne({ user: userId, date: today });

    if (attendance && attendance.punchInTime) {
        throw new ApiError(400, "Already punched in for today");
    }

    const punchInTime = new Date();

    if (!attendance) {
        attendance = new Attendance({
            user: userId,
            date: today,
            punchInTime: punchInTime,
            status: "Present"
        });
    } else {
        attendance.punchInTime = punchInTime;
        attendance.status = "Present";
    }

    await attendance.save();

    res.status(200).json(new ApiResponse(200, {
        attendance: {
            _id: attendance._id,
            date: attendance.date,
            punchInTime: attendance.punchInTime,
            status: attendance.status
        }
    }, "Punched in successfully"));
});

const punchOut = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const today = getTodayDate();

    const attendance = await Attendance.findOne({ user: userId, date: today });

    if (!attendance) {
        throw new ApiError(400, "No attendance record found for today. Please punch in first.");
    }

    if (!attendance.punchInTime) {
        throw new ApiError(400, "Cannot punch out without punching in first");
    }

    if (attendance.punchOutTime) {
        throw new ApiError(400, "Already punched out for today");
    }

    const punchOutTime = new Date();
    const totalHours = (punchOutTime - attendance.punchInTime) / (1000 * 60 * 60); 

    attendance.punchOutTime = punchOutTime;
    attendance.totalHours = Math.round(totalHours * 100) / 100; 

    if (totalHours >= 8) {
        attendance.status = "Present";
    } else if (totalHours >= 4) {
        attendance.status = "Half Day";
    } else {
        attendance.status = "Absent";
    }

    await attendance.save();

    res.status(200).json(new ApiResponse(200, {
        attendance: {
            _id: attendance._id,
            date: attendance.date,
            punchInTime: attendance.punchInTime,
            punchOutTime: attendance.punchOutTime,
            totalHours: attendance.totalHours,
            status: attendance.status
        }
    }, "Punched out successfully"));
});

const getTodayAttendance = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const today = getTodayDate();

    const attendance = await Attendance.findOne({ user: userId, date: today });

    if (!attendance) {
        return res.status(200).json(new ApiResponse(200, {
            attendance: null
        }, "No attendance record for today"));
    }

    res.status(200).json(new ApiResponse(200, {
        attendance: {
            _id: attendance._id,
            date: attendance.date,
            punchInTime: attendance.punchInTime,
            punchOutTime: attendance.punchOutTime,
            totalHours: attendance.totalHours,
            status: attendance.status
        }
    }, "Today's attendance fetched successfully"));
});

const getAttendanceHistory = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const attendanceRecords = await Attendance.find({ user: userId })
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .select('date punchInTime punchOutTime totalHours status');

    const totalRecords = await Attendance.countDocuments({ user: userId });

    res.status(200).json(new ApiResponse(200, {
        attendance: attendanceRecords,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalRecords / limit),
            totalRecords,
            hasNext: page * limit < totalRecords,
            hasPrev: page > 1
        }
    }, "Attendance history fetched successfully"));
});

export {
    punchIn,
    punchOut,
    getTodayAttendance,
    getAttendanceHistory
};
