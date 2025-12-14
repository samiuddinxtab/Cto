import "server-only";

import { serverEnvSchema } from "@/lib/validators/env";

export const env = serverEnvSchema.parse(process.env);
