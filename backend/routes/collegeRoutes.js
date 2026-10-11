const express = require("express");
const router = express.Router();

const COLLEGE_API = "https://all-india-institutions-data.vercel.app";

let statesCache = null;
let statesCacheTime = 0;
const searchCache = new Map();
const CACHE_TIME = 10 * 60 * 1000;

router.get("/states", async (req, res) => {
    try {
        if (statesCache && Date.now() - statesCacheTime < CACHE_TIME) {
            return res.json(statesCache);
        }

        const response = await fetch(`${COLLEGE_API}/api/institutions/states`);

        if (!response.ok) {
            return res.status(502).json({
                message: "Unable to fetch college states right now."
            });
        }

        const data = await response.json();
        statesCache = data;
        statesCacheTime = Date.now();

        res.json(data);
    } catch (error) {
        res.status(502).json({
            message: "College service is currently unavailable."
        });
    }
});

router.get("/search", async (req, res) => {
    try {
        const q = String(req.query.q || "").trim();
        const state = String(req.query.state || "").trim();
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));

        if (q.length < 2 && !state) {
            return res.status(400).json({
                message: "Enter a college or course name, or select a state."
            });
        }

        if (state && !/^[a-zA-Z0-9 -]+$/.test(state)) {
            return res.status(400).json({
                message: "Invalid state filter."
            });
        }

        const cacheKey = `${q.toLowerCase()}|${state.toLowerCase()}|${page}|${limit}`;
        const cached = searchCache.get(cacheKey);

        if (cached && Date.now() - cached.time < CACHE_TIME) {
            return res.json(cached.data);
        }

        const params = new URLSearchParams({
            q,
            page: String(page),
            limit: String(limit)
        });

        if (state) {
            params.set("state", state);
        }

        const response = await fetch(
            `${COLLEGE_API}/api/institutions/search?${params.toString()}`
        );

        const data = await response.json();

        if (!response.ok) {
            return res.status(502).json({
                message: data.detail || data.error || "Unable to search colleges right now."
            });
        }

        searchCache.set(cacheKey, {
            data,
            time: Date.now()
        });

        res.json(data);
    } catch (error) {
        res.status(502).json({
            message: "College service is currently unavailable. Please try again later."
        });
    }
});

module.exports = router;