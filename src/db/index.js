import mongoose from "mongoose";
import {DB_NAME} from "../constant.js"


const connectDB = async()=>{
    try{
     const connectionInfo =   await mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}`);
     console.log(`DB connected !! DBhost :${connectionInfo.connection.host} `);
    }
    catch(err)
    {
        console.log("MongoDB Connection Error",err);
        process.exit(1);
    }
}

export default connectDB;