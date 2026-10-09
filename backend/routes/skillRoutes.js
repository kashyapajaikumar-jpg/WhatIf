const express=require("express");
const Skill=require("../models/skillModel");
const router=express.Router();

router.get("/",async(req,res)=>{
    try
    {
        const skills=await Skill.find();
        res.status(200).json(skills);
    }
    catch(error)
    {
        res.status(500).json({message:"Failed to fetch skills",error:error.message});
    }
});

router.post("/",async(req,res)=>{
    try
    {
        const {name,category,description}=req.body;
        if(!name||!category)
        {
            return res.status(400).json({message:"Skill name and category are required"});
        }
        const skill=new Skill({
            name,
            category,
            description:description||""
        });
        await skill.save();
        res.status(201).json({
            message:"Skill added successfully",
            skill
        });
    }
    catch(error)
    {
        res.status(500).json({message:"Skill creation failed",error:error.message});
    }
});

router.put("/:id",async(req,res)=>{
    try
    {
        const {name,category,description}=req.body;
        if(!name||!category)
        {
            return res.status(400).json({message:"Skill name and category are required"});
        }
        const skill=await Skill.findByIdAndUpdate(
            req.params.id,
            {name,category,description:description||""},
            {new:true}
        );
        if(!skill)
        {
            return res.status(404).json({message:"Skill not found"});
        }
        res.status(200).json({
            message:"Skill updated successfully",
            skill
        });
    }
    catch(error)
    {
        res.status(500).json({message:"Skill update failed",error:error.message});
    }
});

router.delete("/:id",async(req,res)=>{
    try
    {
        const skill=await Skill.findByIdAndDelete(req.params.id);
        if(!skill)
        {
            return res.status(404).json({message:"Skill not found"});
        }
        res.status(200).json({message:"Skill deleted successfully"});
    }
    catch(error)
    {
        res.status(500).json({message:"Skill deletion failed",error:error.message});
    }
});

module.exports=router;