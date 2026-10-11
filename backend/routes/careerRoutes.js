const express=require("express");
const Career=require("../models/careerModel");
const router=express.Router();

router.get("/",async(req,res)=>{
    try
    {
        const careers=await Career.find();
        res.status(200).json(careers);
    }
    catch(error)
    {
        res.status(500).json({message:"Failed to fetch careers",error:error.message});
    }
});

router.get("/:id",async(req,res)=>{
    try
    {
        const career=await Career.findById(req.params.id);
        if(!career)
        {
            return res.status(404).json({message:"Career not found"});
        }
        res.status(200).json(career);
    }
    catch(error)
    {
        res.status(500).json({message:"Failed to fetch career",error:error.message});
    }
});

router.post("/",async(req,res)=>{
    try
    {
        const {name,description,industry,salary,opportunity,requiredSkills}=req.body;
        if(!name||!description||!industry)
        {
            return res.status(400).json({message:"Please fill all required fields"});
        }
        const career=new Career({
            name,
            description,
            industry,
            salary,
            opportunity,
            requiredSkills:Array.isArray(requiredSkills)?requiredSkills:[]
        });
        await career.save();
        res.status(201).json({
            message:"Career added successfully",
            career
        });
    }
    catch(error)
    {
        res.status(500).json({message:"Career creation failed",error:error.message});
    }
});

router.put("/:id",async(req,res)=>{
    try
    {
        const {name,description,industry,salary,opportunity,requiredSkills}=req.body;
        if(!name||!description||!industry)
        {
            return res.status(400).json({message:"Please fill all required fields"});
        }
        const career=await Career.findByIdAndUpdate(
            req.params.id,
            {
                name,
                description,
                industry,
                salary,
                opportunity,
                requiredSkills:Array.isArray(requiredSkills)?requiredSkills:[]
            },
            {new:true}
        );
        if(!career)
        {
            return res.status(404).json({message:"Career not found"});
        }
        res.status(200).json({
            message:"Career updated successfully",
            career
        });
    }
    catch(error)
    {
        res.status(500).json({message:"Career update failed",error:error.message});
    }
});

router.delete("/:id",async(req,res)=>{
    try
    {
        const career=await Career.findByIdAndDelete(req.params.id);
        if(!career)
        {
            return res.status(404).json({message:"Career not found"});
        }
        res.status(200).json({message:"Career deleted successfully"});
    }
    catch(error)
    {
        res.status(500).json({message:"Career deletion failed",error:error.message});
    }
});

module.exports=router;