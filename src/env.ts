import { z } from "zod"; // Or any other validation library

const envSchema = z.object({
  VITE_API_URL: z.string().url(),
  VITE_APP_NAME: z.string().min(3),
});

type Env = z.infer<typeof envSchema>;

const parsedEnv = envSchema.safeParse(import.meta.env); // Or process.env
if (!parsedEnv.success) {
  console.error(
    "Invalid or missing env variables:",
    parsedEnv.error.flatten().fieldErrors
  );
  throw new Error("Invalid environment variables");
}

export const env: Env = parsedEnv.data;
