import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // cb(null, path.join( "/var/www/uploads"));
    cb(null, path.join(process.cwd(), "uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

export const upload = multer({
  storage: storage,
  // limits: {
  //   // 100 MB in bytes
  //   fileSize: 100 * 1024 * 1024,
  // },
});

// upload single image
const uploadSingle = upload.single("carImage");

// upload multiple image
const uploadMultiple = upload.fields([
  { name: "singleImage", maxCount: 10 },
  { name: "galleryImage", maxCount: 10 },
]);

export const fileUploader = {
  upload,
  uploadSingle,
  uploadMultiple,
};

// import multer from "multer";
// import path from "path";

// // Set the maximum file size limit (in bytes)
// const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB in bytes

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, path.join(process.cwd(), "uploads"));
//   },
//   filename: function (req, file, cb) {
//     cb(null, `${Date.now()}-${file.originalname}`);
//   },
// });

// // Configure multer to handle file uploads and set size limit
// export const upload = multer({
//   storage: storage,
//   limits: {
//     fileSize: MAX_FILE_SIZE, // Limit the file size to 100 MB
//   },
//   fileFilter: function (req, file, cb) {
//     // Optional: Check for file type (e.g., allow only videos)
//     const allowedTypes = ["video/mp4", "video/avi", "video/mkv"]; // Example video formats
//     if (!allowedTypes.includes(file.mimetype)) {
//       return cb(new Error("Invalid file type. Only videos are allowed."));
//     }
//     cb(null, true); // Allow the file upload
//   },
// });

// // upload single image or video
// const uploadSingle = upload.single("carImage");

// // upload multiple images or videos
// const uploadMultiple = upload.fields([
//   { name: "singleImage", maxCount: 10 },
//   { name: "galleryImage", maxCount: 10 },
// ]);

// export const fileUploader = {
//   upload,
//   uploadSingle,
//   uploadMultiple,
// };
