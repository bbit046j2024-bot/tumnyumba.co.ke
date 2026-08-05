import { v2 as cloudinary } from "cloudinary";

// Credentials are loaded exclusively from environment variables.
// Do NOT add hardcoded fallbacks here — a typo in a fallback secret
// causes silent Cloudinary authentication failures (500 on /api/upload).
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.warn("[cloudinary] Missing one or more CLOUDINARY_* env vars. Uploads will fail.");
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;
