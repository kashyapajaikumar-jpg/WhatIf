const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const user = require("../models/userModel");
const router = express.Router();

const transporter = nodemailer.createTransport(
{
    service:"gmail",
    auth:
    {
        user:process.env.EMAIL_USER,
        pass:process.env.EMAIL_PASSWORD
    }
});

router.post("/register",async(req,res)=>
{
    try
    {
        const {name,email,password} = req.body;

        if(!name || !email || !password)
        {
            return res.status(400).json({
                message:"Please fill all the fields"
            });
        }

        const existingUser = await user.findOne({email});

        if(existingUser)
        {
            return res.status(400).json({
                message:"User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password,10);

        const newuser = new user({
            name,
            email,
            password:hashedPassword
        });

        await newuser.save();

        res.status(201).json({
            message:"User registered successfully"
        });
    }
    catch(error)
    {
        res.status(500).json({
            message:"Registration failed",
            error:error.message
        });
    }
});

router.post("/login",async(req,res)=>
{
    try
    {
        const {email,password} = req.body;

        if(!email || !password)
        {
            return res.status(400).json({
                message:"Email and password are required"
            });
        }

        const existingUser = await user.findOne({email});

        if(!existingUser)
        {
            return res.status(400).json({
                message:"Invalid email or password"
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            existingUser.password
        );

        if(!passwordMatch)
        {
            return res.status(400).json({
                message:"Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                userId:existingUser._id,
                role:"user"
            },
            process.env.JWT_SECRET,
            {
                expiresIn:"1d"
            }
        );

        res.status(200).json({
            message:"Login successful",
            token,
            user:
            {
                id:existingUser._id,
                name:existingUser.name,
                email:existingUser.email
            }
        });
    }
    catch(error)
    {
        res.status(500).json({
            message:"Login failed",
            error:error.message
        });
    }
});

router.post("/admin-login",async(req,res)=>
{
    try
    {
        const {email,password} = req.body;

        if(!email || !password)
        {
            return res.status(400).json({
                message:"Email and password are required"
            });
        }

        if(
            email !== process.env.ADMIN_EMAIL ||
            password !== process.env.ADMIN_PASSWORD
        )
        {
            return res.status(401).json({
                message:"Invalid admin credentials"
            });
        }

        const token = jwt.sign(
            {
                role:"admin"
            },
            process.env.JWT_SECRET,
            {
                expiresIn:"1d"
            }
        );

        res.status(200).json({
            message:"Admin login successful",
            token,
            admin:
            {
                email,
                role:"admin"
            }
        });
    }
    catch(error)
    {
        res.status(500).json({
            message:"Admin login failed",
            error:error.message
        });
    }
});

router.get("/profile",async(req,res)=>
{
    try
    {
        const token = req.headers.authorization;

        if(!token)
        {
            return res.status(401).json({
                message:"Access denied. No token provided"
            });
        }

        const decoded = jwt.verify(
            token.replace("Bearer ",""),
            process.env.JWT_SECRET
        );

        if(decoded.role !== "user")
        {
            return res.status(403).json({
                message:"User access required"
            });
        }

        const existingUser = await user.findById(decoded.userId);

        if(!existingUser)
        {
            return res.status(404).json({
                message:"User not found"
            });
        }

        res.status(200).json({
            id:existingUser._id,
            name:existingUser.name,
            email:existingUser.email,
            education:existingUser.education,
            skills:existingUser.skills,
            interests:existingUser.interests,
            preferences:existingUser.preferences
        });
    }
    catch(error)
    {
        res.status(401).json({
            message:"Invalid or expired token"
        });
    }
});

router.put("/profile",async(req,res)=>
{
    try
    {
        const token = req.headers.authorization;

        if(!token)
        {
            return res.status(401).json({
                message:"Access denied. No token provided"
            });
        }

        const decoded = jwt.verify(
            token.replace("Bearer ",""),
            process.env.JWT_SECRET
        );

        if(decoded.role !== "user")
        {
            return res.status(403).json({
                message:"User access required"
            });
        }

        const existingUser = await user.findById(decoded.userId);

        if(!existingUser)
        {
            return res.status(404).json({
                message:"User not found"
            });
        }

        const {
            name,
            email,
            education,
            skills,
            interests
        } = req.body;

        if(!name || !email)
        {
            return res.status(400).json({
                message:"Name and email are required"
            });
        }

        const emailOwner = await user.findOne({email});

        if(
            emailOwner &&
            emailOwner._id.toString() !== existingUser._id.toString()
        )
        {
            return res.status(400).json({
                message:"Email is already in use"
            });
        }

        existingUser.name = name;
        existingUser.email = email;
        existingUser.education = education || "";
        existingUser.skills = Array.isArray(skills) ? skills : [];
        existingUser.interests = Array.isArray(interests) ? interests : [];

        await existingUser.save();

        res.status(200).json({
            id:existingUser._id,
            name:existingUser.name,
            email:existingUser.email,
            education:existingUser.education,
            skills:existingUser.skills,
            interests:existingUser.interests,
            preferences:existingUser.preferences
        });
    }
    catch(error)
    {
        res.status(401).json({
            message:"Invalid or expired token"
        });
    }
});

router.post("/forgot-password",async(req,res)=>
{
    try
    {
        const {email} = req.body;

        if(!email)
        {
            return res.status(400).json({
                message:"Email is required"
            });
        }

        const existingUser = await user.findOne({email});

        if(!existingUser)
        {
            return res.status(404).json({
                message:"User not found"
            });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");

        existingUser.resetPasswordToken = resetToken;
        existingUser.resetPasswordExpires =
            new Date(Date.now() + 15 * 60 * 1000);

        await existingUser.save();

        const resetLink =
            `http://localhost:5173/reset?email=${encodeURIComponent(email)}&token=${resetToken}`;

        await transporter.sendMail(
        {
            from:process.env.EMAIL_USER,
            to:email,
            subject:"WHAT IF? Password Reset",
            html:
            `
            <h2>WHAT IF? Password Reset</h2>
            <p>You requested a password reset.</p>
            <p>Use the following link to reset your password:</p>
            <a href="${resetLink}">${resetLink}</a>
            <p>This link will expire in 15 minutes.</p>
            `
        });

        res.status(200).json({
            message:"Password reset link sent to your email"
        });
    }
    catch(error)
    {
        res.status(500).json({
            message:"Forgot password failed",
            error:error.message
        });
    }
});

router.post("/reset-password",async(req,res)=>
{
    try
    {
        const {
            email,
            resetToken,
            newPassword
        } = req.body;

        if(!email || !resetToken || !newPassword)
        {
            return res.status(400).json({
                message:"Email, reset token and new password are required"
            });
        }

        const existingUser = await user.findOne(
        {
            email,
            resetPasswordToken:resetToken,
            resetPasswordExpires:{$gt:new Date()}
        });

        if(!existingUser)
        {
            return res.status(400).json({
                message:"Invalid or expired reset token"
            });
        }

        const hashedPassword = await bcrypt.hash(
            newPassword,
            10
        );

        existingUser.password = hashedPassword;
        existingUser.resetPasswordToken = "";
        existingUser.resetPasswordExpires = null;

        await existingUser.save();

        res.status(200).json({
            message:"Password reset successfully"
        });
    }
    catch(error)
    {
        res.status(500).json({
            message:"Password reset failed",
            error:error.message
        });
    }
});

module.exports = router;