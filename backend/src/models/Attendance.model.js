import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    punchInTime: {
        type: Date,
        required: false
    },
    punchOutTime: {
        type: Date,
        required: false
    },
    status: {
        type: String,
        enum: ["Present", "Absent", "Late", "Half Day"],
        default: "Absent"
    },
    totalHours: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

attendanceSchema.index({ user: 1, date: 1 }, { unique: true });

export const Attendance = mongoose.model("Attendance", attendanceSchema);
