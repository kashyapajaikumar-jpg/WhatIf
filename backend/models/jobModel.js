const mongoose=require("mongoose");

const jobSchema=new mongoose.Schema(
{
    name:{
        type:String,
        required:true
    },
    company:{
        type:String,
        required:true
    },
    location:{
        type:String,
        required:true
    },
    salary:{
        type:String,
        default:""
    },
    type:{
        type:String,
        default:"Full-time"
    },
    description:{
        type:String,
        default:""
    },
    skills:{
        type:[String],
        default:[]
    }
},
{
    timestamps:true
});

module.exports=mongoose.models.Job||mongoose.model("Job",jobSchema);