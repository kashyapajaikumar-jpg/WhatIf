
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const user = require("../models/userModel");
const transporter = require("../config/mailer");

const router = express.Router();


router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Please fill all the fields"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const existingUser = await user.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new user({
            name,
            email: normalizedEmail,
            password: hashedPassword
        });

        await newUser.save();

        return res.status(201).json({
            message: "User registered successfully"
        });
    } catch (error) {
        console.error("Registration error:", error.message);
        return res.status(500).json({
            message: "Registration failed"
        });
    }
});

// USER LOGIN
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const existingUser = await user.findOne({
            email: normalizedEmail
        });

        if (!existingUser) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            existingUser.password
        );

        if (!passwordMatch) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                userId: existingUser._id,
                role: "user"
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: existingUser._id,
                name: existingUser.name,
                email: existingUser.email
            }
        });
    } catch (error) {
        console.error("Login error:", error.message);
        return res.status(500).json({
            message: "Login failed"
        });
    }
});

// ADMIN LOGIN
router.post("/admin-login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        if (
            email !== process.env.ADMIN_EMAIL ||
            password !== process.env.ADMIN_PASSWORD
        ) {
            return res.status(401).json({
                message: "Invalid admin credentials"
            });
        }

        const token = jwt.sign(
            { role: "admin" },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        return res.status(200).json({
            message: "Admin login successful",
            token,
            admin: {
                email,
                role: "admin"
            }
        });
    } catch (error) {
        console.error("Admin login error:", error.message);
        return res.status(500).json({
            message: "Admin login failed"
        });
    }
});


router.get("/profile", async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        const decoded = jwt.verify(
            authHeader.substring(7),
            process.env.JWT_SECRET
        );

        if (decoded.role !== "user") {
            return res.status(403).json({
                message: "User access required"
            });
        }

        const existingUser = await user.findById(decoded.userId);

        if (!existingUser) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            id: existingUser._id,
            name: existingUser.name,
            email: existingUser.email,
            education: existingUser.education,
            skills: existingUser.skills,
            interests: existingUser.interests,
            preferences: existingUser.preferences
        });
    } catch (error) {
        if (
            error.name === "JsonWebTokenError" ||
            error.name === "TokenExpiredError"
        ) {
            return res.status(401).json({
                message: "Invalid or expired token"
            });
        }

        console.error("Profile error:", error.message);
        return res.status(500).json({
            message: "Failed to load profile"
        });
    }
});

// Uupdate userprofile
router.put("/profile", async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        const decoded = jwt.verify(
            authHeader.substring(7),
            process.env.JWT_SECRET
        );

        if (decoded.role !== "user") {
            return res.status(403).json({
                message: "User access required"
            });
        }

        const existingUser = await user.findById(decoded.userId);

        if (!existingUser) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const {
            name,
            email,
            education,
            skills,
            interests
        } = req.body;

        if (!name || !email) {
            return res.status(400).json({
                message: "Name and email are required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const emailOwner = await user.findOne({
            email: normalizedEmail
        });

        if (
            emailOwner &&
            emailOwner._id.toString() !== existingUser._id.toString()
        ) {
            return res.status(400).json({
                message: "Email is already in use"
            });
        }

        existingUser.name = name;
        existingUser.email = normalizedEmail;
        existingUser.education = education || "";
        existingUser.skills = Array.isArray(skills) ? skills : [];
        existingUser.interests = Array.isArray(interests) ? interests : [];

        await existingUser.save();

        return res.status(200).json({
            id: existingUser._id,
            name: existingUser.name,
            email: existingUser.email,
            education: existingUser.education,
            skills: existingUser.skills,
            interests: existingUser.interests,
            preferences: existingUser.preferences
        });
    } catch (error) {
        if (
            error.name === "JsonWebTokenError" ||
            error.name === "TokenExpiredError"
        ) {
            return res.status(401).json({
                message: "Invalid or expired token"
            });
        }

        console.error("Update profile error:", error.message);
        return res.status(500).json({
            message: "Failed to update profile"
        });
    }
});

// to send mai for resetting password
router.post("/forgot-password", async (req, res) => {
    let existingUser;

    try {
        const { email } = req.body;

        if (!email || !email.trim()) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        existingUser = await user.findOne({
            email: normalizedEmail
        });

        if (!existingUser) {
            return res.status(404).json({
                message: "No account found with this email address"
            });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");

        existingUser.resetPasswordToken = resetToken;
        existingUser.resetPasswordExpires = new Date(
            Date.now() + 15 * 60 * 1000
        );

        await existingUser.save();

        const resetLink =
            `http://localhost:5173/reset?email=${encodeURIComponent(normalizedEmail)}&token=${resetToken}`;

        await transporter.sendMail({
            from: `"WHAT IF?" <${process.env.EMAIL_USER}>`,
            to: normalizedEmail,
            subject: "WHAT IF? Password Reset",
            text: `You requested a password reset. Open this link within 15 minutes: ${resetLink}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 560px; margin: auto;">
                    <h2>WHAT IF? Password Reset</h2>
                    <p>You requested a password reset for your account.</p>
                    <p>Click the button below to choose a new password.
                       This link expires in 15 minutes.</p>
                    <p>
                        <a href="${resetLink}"
                           style="display:inline-block;padding:12px 20px;background:#111;color:#fff;text-decoration:none;">
                            Reset my password
                        </a>
                    </p>
                    <p>If the button doesn't work, copy this link into your browser:</p>
                    <p>${resetLink}</p>
                    <p>If you didn't request this, you can ignore this email.</p>
                </div>
            `
        });

        return res.status(200).json({
            message: "Password reset link sent to your email"
        });
    } catch (error) {
        console.error("Forgot password error:", error.message);

        
        if (existingUser) {
            try {
                existingUser.resetPasswordToken = "";
                existingUser.resetPasswordExpires = null;
                await existingUser.save();
            } catch (saveError) {
                console.error("Could not clear reset token:", saveError.message);
            }
        }

        return res.status(500).json({
            message: "Could not send the password reset email. Check your email configuration."
        });
    }
});


router.post("/reset-password", async (req, res) => {
    try {
        const {
            email,
            resetToken,
            newPassword
        } = req.body;

        if (!email || !resetToken || !newPassword) {
            return res.status(400).json({
                message: "Email, reset token and new password are required"
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters long"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await user.findOne({
            email: normalizedEmail,
            resetPasswordToken: resetToken,
            resetPasswordExpires: { $gt: new Date() }
        });

        if (!existingUser) {
            return res.status(400).json({
                message: "Invalid or expired reset token"
            });
        }

        existingUser.password = await bcrypt.hash(newPassword, 10);
        existingUser.resetPasswordToken = "";
        existingUser.resetPasswordExpires = null;

        await existingUser.save();

        return res.status(200).json({
            message: "Password reset successfully"
        });
    } catch (error) {
        console.error("Reset password error:", error.message);
        return res.status(500).json({
            message: "Password reset failed"
        });
    }
});

// this is for admin to get user or see em
router.get("/admin/users", async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Authentication required"
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

        const users = await user.find({})
            .select("name email education skills interests createdAt")
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({
            total: users.length,
            users
        });
    } catch (error) {
        if (
            error.name === "JsonWebTokenError" ||
            error.name === "TokenExpiredError"
        ) {
            return res.status(401).json({
                message: "Invalid or expired token"
            });
        }

        console.error("Admin users error:", error.message);
        return res.status(500).json({
            message: "Failed to load users"
        });
    }
});

module.exports = router;
