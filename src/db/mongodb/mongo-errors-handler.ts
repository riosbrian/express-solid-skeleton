import type { ErrorResponse } from "@/config/constants.js";
import mongoose from "mongoose";

export function handleMongoError(err: unknown): ErrorResponse | null {
  if (err instanceof mongoose.mongo.MongoError && err.code === 11000) {
    const field =
      Object.keys((err as mongoose.mongo.MongoServerError).keyValue ?? {})[0] ??
      "unknown";

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
