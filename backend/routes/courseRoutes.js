const express = require("express");

const Course = require("../models/courseModel");

const router = express.Router();

router.post("/", async(req,res)=>{

    try{

        const {name,description,category,duration,source} = req.body;

        if(!name || !description || !category || !duration)
        {
            return res.status(400).json({
                message:"Please fill all the required fields"
            });
        }

        const newCourse = new Course({
            name,
            description,
            category,
            duration,
            source
        });

        await newCourse.save();

        res.status(201).json({
            message:"Course added successfully",
            course:newCourse
        });

    }

    catch(error)
    {

        res.status(500).json({
            message:"Course creation failed",
            error:error.message
        });

    }

});

router.get("/", async(req,res)=>{

    try{

        const courses = await Course.find();

        res.status(200).json(courses);

    }

    catch(error)
    {

        res.status(500).json({
            message:"Failed to fetch courses",
            error:error.message
        });

    }

});

router.put("/:id", async(req,res)=>{

    try{

        const {name,description,category,duration,source} = req.body;

        const updatedCourse = await Course.findByIdAndUpdate(
            req.params.id,
            {
                name,
                description,
                category,
                duration,
                source
            },
            {new:true}
        );

        if(!updatedCourse)
        {
            return res.status(404).json({
                message:"Course not found"
            });
        }

        res.status(200).json({
            message:"Course updated successfully",
            course:updatedCourse
        });

    }

    catch(error)
    {

        res.status(500).json({
            message:"Course update failed",
            error:error.message
        });

    }

});

router.delete("/:id", async(req,res)=>{

    try{

        const deletedCourse = await Course.findByIdAndDelete(req.params.id);

        if(!deletedCourse)
        {
            return res.status(404).json({
                message:"Course not found"
            });
        }

        res.status(200).json({
            message:"Course deleted successfully"
        });

    }

    catch(error)
    {

        res.status(500).json({
            message:"Course deletion failed",
            error:error.message
        });

    }

});
module.exports = router;