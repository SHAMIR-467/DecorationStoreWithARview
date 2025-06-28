import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

// Corrected cloud_name configuration (removed extra 'C')
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Fixed typo here
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET, 
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      console.error("Cloudinary Upload Error: No file path provided");
      return null;
    }

    console.log("Uploading file to Cloudinary:", localFilePath);

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    console.log("Upload Success:", response);

    fs.unlinkSync(localFilePath); // Delete the file after successful upload
    return response;
  } catch (error) {
    console.error("Cloudinary Upload Error:", error.message);

    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath); // Ensure the local file is removed even on error
    }

    return null;
  }
};


export { uploadOnCloudinary };