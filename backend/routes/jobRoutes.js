const express=require("express");
const Job=require("../models/jobModel");
const router=express.Router();

router.get("/",async(req,res)=>{
    try
    {
        const jobs=await Job.find();
        res.status(200).json(jobs);
    }
    catch(error)
    {
        res.status(500).json({message:"Failed to fetch jobs",error:error.message});
    }
});

router.post("/",async(req,res)=>{
    try
    {
        const {
            name,
            company,
            location,
            salary,
            type,
            description,
            skills
        }=req.body;

        if(!name||!company||!location)
        {
            return res.status(400).json({
                message:"Job name, company and location are required"
            });
        }

        const job=new Job({
            name,
            company,
            location,
            salary:salary||"",
            type:type||"Full-time",
            description:description||"",
            skills:Array.isArray(skills)?skills:[]
        });

        await job.save();

        res.status(201).json({
            message:"Job added successfully",
            job
        });
    }
    catch(error)
    {
        res.status(500).json({
            message:"Job creation failed",
            error:error.message
        });
    }
});

router.put("/:id",async(req,res)=>{
    try
    {
        const {
            name,
            company,
            location,
            salary,
            type,
            description,
            skills
        }=req.body;

        const job=await Job.findByIdAndUpdate(
            req.params.id,
            {
                name,
                company,
                location,
                salary:salary||"",
                type:type||"Full-time",
                description:description||"",
                skills:Array.isArray(skills)?skills:[]
            },
            {new:true}
        );

        if(!job)
        {
            return res.status(404).json({message:"Job not found"});
        }

        res.status(200).json({
            message:"Job updated successfully",
            job
        });
    }
    catch(error)
    {
        res.status(500).json({
            message:"Job update failed",
            error:error.message
        });
    }
});

router.delete("/:id",async(req,res)=>{
    try
    {
        const job=await Job.findByIdAndDelete(req.params.id);

        if(!job)
        {
            return res.status(404).json({message:"Job not found"});
        }

        res.status(200).json({
            message:"Job deleted successfully"
        });
    }
    catch(error)
    {
        res.status(500).json({
            message:"Job deletion failed",
            error:error.message
        });
    }
});

module.exports=router;