import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "fjura4cj",
  api_key: process.env.CLOUDINARY_API_KEY || "137654152958423",
  api_secret: process.env.CLOUDINARY_API_SECRET || "3v-fGI7nqQN-elaikUtmDhvSC4Q",
  secure: true,
});

export default cloudinary;
