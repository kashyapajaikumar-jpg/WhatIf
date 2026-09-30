const mongoose = require('mongoose');
const connectDB = async () => 
{
    try{
        await mongoose.connect(process.env.MONGO_URL);
        console.log("MongoDB connected successfullyt");
    }
    catch(error)
    {
        console.log("MongoDB connection failed");
        console.error(error);
    }
};
module.exports = connectDB;