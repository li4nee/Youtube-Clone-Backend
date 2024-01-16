import {v2 as cloudinary} from 'cloudinary';
import fs from "fs";

cloudinary.config({ 
  cloud_name:process.env.CLOUD_NAME, 
  api_key: process.env.CLOUD_APIKEY, 
  api_secret:process.env.CLOUD_SECRET 
});

const uploadOnCloudinary = async (LocalPath)=>{
try {
    if(!LocalPath)
    {
        return null;
    }
  const response = await cloudinary.uploader.upload(LocalPath,{resource_type:auto});
    // file uploaded sucessfully
    console.log("file uploaded on cloudinary");
    return response;

} catch (error) {
    fs.unlinkSync(LocalPath);  // removes locally saved temporary file as the upload operation got failed
    return null;
}
}

export {uploadOnCloudinary};