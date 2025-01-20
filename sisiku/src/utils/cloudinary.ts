// import { v2 as cloudinary } from "cloudinary";
// import fs from "fs";

// // Configure Cloudinary
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// // Define the response type from Cloudinary
// const uploadOnCloudinary = async (
//   compressedFilePath: string | undefined
// ): Promise<any | null> => {
//   try {
//     if (!compressedFilePath) return null;
//     // Upload the file to Cloudinary
//     const response: any = await cloudinary.uploader.upload(
//       compressedFilePath,
//       {
//         resource_type: "auto",
//       }
//     );
//     // Remove the locally saved temporary file
//     fs.unlinkSync(compressedFilePath);
//     return response;
//   } catch (error) {
//     // Log the error if needed
//     console.error("Error uploading to Cloudinary:", error);
//     // Remove the locally saved temporary file as the upload operation failed
//     if (compressedFilePath) {
//       fs.unlinkSync(compressedFilePath);
//     }
//     return null;
//   }
// };

// export { uploadOnCloudinary };



import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Define the response type from Cloudinary
const uploadOnCloudinary = async (
  compressedFilePath: string | undefined,
  localFilePath: string | undefined
): Promise<any | null> => {
  try {
    if (!compressedFilePath) return null;
    if (!localFilePath) return null;
    // Upload the file to Cloudinary
    const response: any = await cloudinary.uploader.upload(compressedFilePath, {
      resource_type: "auto",
    });
    // Remove the locally saved temporary file
    fs.unlinkSync(compressedFilePath);
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) { 
    // Log the error if needed
    console.error("Error uploading to Cloudinary:", error);
    // Remove the locally saved temporary file as the upload operation failed
    if (compressedFilePath && localFilePath) {
      fs.unlinkSync(compressedFilePath);
      fs.unlinkSync(localFilePath);
    }
    return null;
  }
};

export { uploadOnCloudinary };
