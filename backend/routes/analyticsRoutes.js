const express = require("express");
const jwt = require("jsonwebtoken");
const Analytics = require("../models/analyticsModel");

const router = express.Router();

const allowedPages = [
    "dashboard",
    "courses",
    "course",
    "career",
    "skills",
    "jobs",
    "job",
    "cover",
    "scenario",
    "saved",
    "profile"
];

function verifyAdmin(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Admin login required"
            });
        }

        const decoded = jwt.verify(
            authHeader.substring(7),
            process.env.JWT_SECRET
        );

        if (decoded.role !== "admin") {
            return res.status(403).json({
                message: "Admin access required"
            });
        }

        next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
}

// Record a page visit from an authenticated user
router.post("/track", async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Login required"
            });
        }

        const decoded = jwt.verify(
            authHeader.substring(7),
            process.env.JWT_SECRET
        );

        if (decoded.role !== "user" || !decoded.userId) {
            return res.status(403).json({
                message: "User login required"
            });
        }

        const { page } = req.body;

        if (!allowedPages.includes(page)) {
            return res.status(400).json({
                message: "Invalid page"
            });
        }

        await Analytics.create({
            eventType: "page_visit",
            page,
            userId: decoded.userId
        });

        return res.status(201).json({
            message: "Page visit recorded"
        });
    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
});

// Admin: page visit summary only
router.get("/summary", verifyAdmin, async (req, res) => {
    try {
        const days = Math.min(
            Math.max(parseInt(req.query.days, 10) || 30, 1),
            365
        );

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const filter = {
            eventType: "page_visit",
            userId: { $ne: null },
            page: { $in: allowedPages },
            createdAt: { $gte: startDate }
        };

        const totalPageVisits = await Analytics.countDocuments(filter);

        const mostVisitedPages = await Analytics.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: "$page",
                    visits: { $sum: 1 }
                }
            },
            { $sort: { visits: -1, _id: 1 } }
        ]);

        return res.status(200).json({
            days,
            totalPageVisits,
            mostVisitedPages: mostVisitedPages.map(item => ({
                page: item._id,
                visits: item.visits
            }))
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to load page analytics"
        });
    }
});

module.exports = router;