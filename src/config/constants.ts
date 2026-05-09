// Types
export type ErrorResponse = {
  statusCode: number;
  status: string;
  message: string;
  stack?: string;
};

// Constants
export const DB_STATES = {
  0: "disconnected",
  1: "connected",
  2: "connecting",
  3: "disconnecting",
};
