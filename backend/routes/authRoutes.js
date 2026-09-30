const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const user = require("../models/userModel");
const router = express.Router();
router.post("/register",async(req,res)=>{
    try{
        const{name,email,password} = req.body;
        if(!name || !email || !password)
        {
            return res.status(400).json({message:"Please fill all the fields"});
        }
        const existingUser = await user.findOne({email});
        if(existingUser)
        {
            return res.status(400).json({message:"User already exists"});
        }
        const hashedPassword = await bcrypt.hash(password,10);
        const newuser=new user({
            name,
            email,
            password:hashedPassword
        });
        await newuser.save();
        res.status(201).json({message:"User registered successfully"});
    }
    catch(error)
    {
        res.status(500).json({message:"Registration failed",
                              error: error.message
        });
    }
});
router.post("/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const existingUser = await user.findOne({ email });

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
            { userId: existingUser._id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: existingUser._id,
                name: existingUser.name,
                email: existingUser.email
            }
        });

    } catch (error) {

        res.status(500).json({
            message: "Login failed",
            error: error.message
        });

    }

});
router.get("/profile", async(req,res)=>{

    try{

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
module.exports=router;