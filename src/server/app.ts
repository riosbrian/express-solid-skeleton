import { errorHandler } from "@/server/middlewares/error-handler.middleware.js";
import { notFoundHandler } from "@/server/middlewares/not-found.middleware.js";
import { setSecurityMiddlewares } from "@/server/security/setup-security-middlewares.js";
import express from "express";

const app = express();

setSecurityMiddlewares(app);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.use("/{*splat}", notFoundHandler);
app.use(errorHandler);

export function startServer(port: number, environment: string) {
  app.listen(port, () =>
    console.log(`Server running at PORT: ${port} on ${environment} mode`),
  );
}
