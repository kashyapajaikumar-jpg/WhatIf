
const mongoose = require("mongoose");

const analyticsSchema = new mongoose.Schema(
    {
        eventType: {
            type: String,
            enum: ["page_visit", "user_action"],
            required: true
        },
        page: {
            type: String,
            required: true,
            maxlength: 40
        },
        action: {
            type: String,
            default: "",
            maxlength: 80
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },
        sessionId: {
            type: String,
            default: "",
            maxlength: 80
        }
    },
    { timestamps: true }
);

analyticsSchema.index({ createdAt: -1 });
analyticsSchema.index({ eventType: 1, page: 1 });

module.exports =
    mongoose.models.Analytics ||
    mongoose.model("Analytics", analyticsSchema);
