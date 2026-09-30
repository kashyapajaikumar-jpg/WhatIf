

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const courseRoutes = require("./routes/courseRoutes");
const connectDB = require("./connection");
const authRoutes = require("./routes/authRoutes");
app.use(cors());
app.use(express.json());
app.use("/api/courses", courseRoutes);
app.use("/api/auth", authRoutes);
connectDB();
app.get('/', (req, res) => {
    res.send("What If? Backend is running");
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
});