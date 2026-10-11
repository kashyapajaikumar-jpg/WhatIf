const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        education: {
            type: String,
            default: ""
        },
        skills: {
            type: [String],
            default: []
        },
        interests: {
            type: [String],
            default: []
        },
        preferences: {
            type: [String],
            default: []
        },
        resetPasswordToken: {
            type: String,
            default: ""
        },
        resetPasswordExpires: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.models.User || mongoose.model("User",userSchema);