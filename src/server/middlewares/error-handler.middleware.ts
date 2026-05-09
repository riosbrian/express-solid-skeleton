import type { ErrorResponse } from "@/config/constants.js";
import { envs } from "@/config/envs.js";
import { handleMongoError } from "@/db/mongodb/mongo-errors-handler.js";
import AppError from "@/shared/custom-error.js";
import type { NextFunction, Request, Response } from "express";

function sendError(res: Response, error: ErrorResponse) {
  const { statusCode, ...responseBody } = error;
  return res.status(statusCode).json(responseBody);
}

function normalizeError(err: Error): ErrorResponse {
  const isOperational = err instanceof AppError;

  return {
    statusCode: isOperational ? err.statusCode : 500,
    status: isOperational ? err.status : "error",
    message: isOperational ? err.message : "Internal Server Error",
    ...(envs.NODE_ENV === "development" && {
      stack: err.stack,
    }),
  };
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  console.error(err);

  const mongoError = handleMongoError(err);
  if (mongoError) {
    return sendError(res, mongoError);
  }

  if (err instanceof Error) {
    return sendError(res, normalizeError(err));
  }

  return res.status(500).json({
    status: "error",
    message: "Internal Server Error",
  });
}
