import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  PORT: z.coerce.number().default(3000),
  MONGO_URI: z.url(),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  const errors = result.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join(",\n");
  const message = `Invalid environment variables:\n${errors}`;
  console.error(message);
  process.exit(1);
}

export const envs = result.data;
