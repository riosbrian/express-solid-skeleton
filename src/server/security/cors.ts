import AppError from "@/shared/custom-error.js";
import cors from "cors";

export const ALLOWEB_ORIGINS = ["http://localhost:5173"];

export const corsConfig = cors({
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 3600,
  origin(requestOrigin, callback) {
    if (!requestOrigin || ALLOWEB_ORIGINS.includes(requestOrigin))
      callback(null, true);
    else callback(new AppError("Not alloweb by CORS", 400));
  },
});
