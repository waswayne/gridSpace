import multer from 'multer';

// Memory storage keeps uploaded files in RAM until they are forwarded to Cloudinary.
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for profile images
  },
});
