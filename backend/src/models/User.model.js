import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    employeeId: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    dateOfBirth: {
        type: Date,
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other']
    },
    nationalId: {
        type: String,
        trim: true
    },
    contactInfo: {
        phone: String,
        address: String
    },
    dateOfHire: {
        type: Date,
        default: Date.now
    },
    jobTitle: {
        type: String
    },
    department: {
        type: String 
    },
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' 
    },
    employmentStatus: {
        type: String,
        enum: ['Active', 'On-Leave', 'Terminated'],
        default: 'Active'
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    refreshToken: {
        type: String
    },
    profilePicture: {
        type: String
    }
}, {
    timestamps: true
});

export const User = mongoose.model("User", userSchema);
