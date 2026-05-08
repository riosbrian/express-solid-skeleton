import rateLimit from "express-rate-limit";

export const rateLimitConfig = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    status: "error",
    message: "To many request. Please try later",
  },
  standardHeaders: "draft-7",
  legacyHeaders: false,
});
