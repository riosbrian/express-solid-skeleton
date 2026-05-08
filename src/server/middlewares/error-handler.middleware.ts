import { envs } from "@/config/envs.js";
import AppError from "@/shared/custom-error.js";
import type { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";

type ErrorResponse = {
  statusCode: number;
  status: string;
  message: string;
  stack?: string;
};

function sendError(res: Response, error: ErrorResponse) {
  const { statusCode, ...responseBody } = error;
  return res.status(statusCode).json(responseBody);
}

function handleMongoError(err: any): ErrorResponse | null {
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue ?? {})[0] ?? "unknown";

    return {
      statusCode: 409,
      status: "fail",
      message: `Duplicated value for field: ${field}`,
    };
  }

  if (err instanceof mongoose.Error.CastError) {
    return {
      statusCode: 400,
      status: "fail",
      message: `Invalid value for field '${err.path}': ${err.value}`,
    };
  }

  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(err.errors)
      .map((el) => el.message)
      .join(". ");

    return {
      statusCode: 400,
      status: "fail",
      message: `Validation failed: ${errors}`,
    };
  }

  return null;
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
