import { envs } from "@/config/envs.js";
import AppError from "@/shared/custom-error.js";
import type { Request, Response, NextFunction } from "express";

interface NormalizedError {
  statusCode: number;
  status: "fail" | "error";
  message: string;
  stack?: string;
}

function handleMongoError(err: any): NormalizedError | null {
  // Duplicate key (e.g. unique index violation)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue ?? {})[0] ?? "unknown";
    return {
      statusCode: 409,
      status: "fail",
      message: `Duplicated value for field: ${field}`,
    };
  }

  // Invalid ObjectId / bad cast
  if (err.name === "CastError") {
    return {
      statusCode: 400,
      status: "fail",
      message: `Invalid value for field '${err.path}': ${err.value}`,
    };
  }

  // Mongoose schema validation
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors)
      .map((el: any) => el.message)
      .join(". ");
    return {
      statusCode: 400,
      status: "fail",
      message: `Validation failed: ${errors}`,
    };
  }

  return null;
}

function normalizeError(err: any): NormalizedError {
  // Known operational error
  if (err instanceof AppError) {
    return {
      statusCode: err.statusCode,
      status: err.status as "fail" | "error",
      message: err.message,
    };
  }

  // Mongoose errors
  const mongoResult = handleMongoError(err);
  if (mongoResult) return mongoResult;

  // Unknown / programming error — don't leak details in production
  return {
    statusCode: 500,
    status: "error",
    message:
      envs.NODE_ENV === "production"
        ? "Internal Server Error"
        : (err.message ?? "Internal Server Error"),
  };
}

function buildResponseBody(
  normalized: NormalizedError,
  err: any,
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    status: normalized.status,
    message: normalized.message,
  };

  if (envs.NODE_ENV === "development") {
    body.stack = err?.stack ?? "No stack available";
    // Surface the raw error name to aid debugging
    body.errorName = err?.name;
  }

  return body;
}

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Always log unexpected errors server-side
  if (!err?.isOperational) {
    console.error("[Unhandled Error]", err);
  }

  const normalized = normalizeError(err);
  const body = buildResponseBody(normalized, err);

  res.status(normalized.statusCode).json(body);
}
