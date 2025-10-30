import { BadRequestError } from "../utils/errors.js";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const validateProfileImage = (req, res, next) => {
  try {
    const file = req.file;

    if (!file) {
      throw new BadRequestError("No file uploaded");
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestError(
        "Invalid file type. Allowed types: image/jpeg, image/png, image/webp"
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestError("File too large. Maximum allowed size is 5MB");
    }

    return next();
  } catch (err) {
    return next(err);
  }
};
