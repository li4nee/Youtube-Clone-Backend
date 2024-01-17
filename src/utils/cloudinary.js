import {v2 as cloudinary} from 'cloudinary';
import fs from "fs";
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_APIKEY,
  api_secret: process.env.CLOUD_SECRET
});


const uploadOnCloudinary = async (localFilePath) => {
  try {
      if (!localFilePath) return null
      //upload the file on cloudinary
      const response = await cloudinary.uploader.upload(localFilePath, {
          resource_type: "auto"
      })
      fs.unlinkSync(localFilePath)
      return response;

  } catch (error) {
      fs.unlinkSync(localFilePath) ;
      console.log(error);
      return null;
  }
}

export {uploadOnCloudinary};