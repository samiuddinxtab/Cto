import { z } from "zod";

export const serverEnvSchema = z.object({
  DIRECTUS_URL: z.string().url(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional()
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
