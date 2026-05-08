import AppError from "@/shared/custom-error.js";

export const ALLOWEB_ORIGINS = ["http://localhost:5173"];

export const CORS_OPTIONS = {
  origin(
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void,
  ) {
    if (!origin || ALLOWEB_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new AppError("Not alloweb by CORS", 400));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
  maxAge: 3600,
};

export const RATE_LIMIT_OPTIONS = {
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    status: "error",
    message: "To many request. Please try later",
  },
  standardHeaders: "draft-7",
  legacyHeaders: false,
} as const;
