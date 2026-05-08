import { corsConfig } from "@/server/security/cors.js";
import { helmetConfig } from "@/server/security/helmet.js";
import { rateLimitConfig } from "@/server/security/rate-limiter.js";
import type { Application } from "express";

export function setSecurityMiddlewares(app: Application) {
  app.use(helmetConfig);
  app.use(corsConfig);
  app.use(rateLimitConfig);
}
