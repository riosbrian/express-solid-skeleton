import { envs } from "@/config/envs.js";
import mongoose from "mongoose";

const MONGOOSE_OPTIONS = {
  autoIndex: false,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  heartbeatFrequencyMS: 10000,
};

const MAX_RETRIES = 5;
const BASE_DELAY_MS = 1000; // 1s → 2s → 4s → 8s → 16s

export async function connectToMongoDB(attempt: number = 1) {
  try {
    await mongoose.connect(envs.MONGO_URI, MONGOOSE_OPTIONS);
  } catch (error) {
    if (attempt >= MAX_RETRIES) {
      console.error(
        `[MONGO_DB] - Unable to establish a connection after ${attempt} attempts: ${(error as Error).message}`,
      );
      process.exit(1);
    }

    const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
    console.warn(
      `[MONGO_DB] - Failed attempt ${attempt}/${MAX_RETRIES} (${(error as Error).message}). Retrying in ${delay}ms`,
    );

    await new Promise((resolve) => setTimeout(resolve, delay));
    return connectToMongoDB(attempt + 1);
  }
}

export async function disconnectedFromMongoDB() {
  await mongoose.connection.close();
}

export function getMongoDBConnectionState() {
  return mongoose.connection.readyState;
}

// Connection events
mongoose.connection.on("connected", () => {
  console.log("[MONGO_DB] - Connection established successfully");
});

mongoose.connection.on("disconnected", () => {
  console.warn("[MONGO_DB] - Connection lost or disconnected");
});

mongoose.connection.on("reconnected", () => {
  console.log("[MONGO_DB] - Reconnected");
});

mongoose.connection.on("error", (err) => {
  console.error(`[MONGO_DB] - Connection error: ${err.message}`);
});

// Graceful Shutdown
async function gracefulShutdown(signal: string, callback?: () => void) {
  console.log(
    `[APP] - Received signal ${signal}. Initiating graceful shutdown...`,
  );
  try {
    await mongoose.connection.close();
    // Mensaje de éxito explícito solo cuando cerramos a propósito
    console.log(
      "[MONGO_DB] - Connection closed successfully due to app termination",
    );

    if (callback) {
      callback();
    } else {
      process.exit(0);
    }
  } catch (error) {
    console.error(
      `[MONGO_DB] - Error closing connection: ${(error as Error).message}`,
    );
    process.exit(1);
  }
}

// For local restarts (nodemon)
process.once("SIGUSR2", () => {
  gracefulShutdown("SIGUSR2", () => {
    process.kill(process.pid, "SIGUSR2");
  });
});

// For manual terminal interruptions (Ctrl + C)
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// For orchestrator shutdowns (Docker, Kubernetes, Heroku)
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
