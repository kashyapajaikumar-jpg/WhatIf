

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const courseRoutes = require("./routes/courseRoutes");
const connectDB = require("./connection");
const authRoutes = require("./routes/authRoutes");
const careerRoutes = require("./routes/careerRoutes");
const jobRoutes = require("./routes/jobRoutes");
const skillRoutes = require("./routes/skillRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const collegeRoutes = require("./routes/collegeRoutes");

app.use(cors());
app.use(express.json());
app.use("/api/courses", courseRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/careers",careerRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/colleges", collegeRoutes);
app.use("/api/analytics", analyticsRoutes);

connectDB();
app.get('/', (req, res) => {
    res.send("What If? Backend is running");
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
});