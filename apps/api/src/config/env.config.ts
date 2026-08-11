import { z } from 'zod';

export const envSchema = z.object({
  DATABASE_URL: z
    .string()
    .min(1, 'DATABASE_URL is required')
    .default('postgresql://betflow:betflowpassword@localhost:5432/betflow_db?schema=public'),
  PORT: z.coerce.number().default(4000),
  JWT_SECRET: z
    .string()
    .min(16, 'JWT_SECRET must be at least 16 characters long')
    .default('super-secret-betflow-jwt-key'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DOCUMENTS_STORAGE_PATH: z.string().default('./uploads/documents'),
  ALLOWED_ORIGINS: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().optional().default('http://localhost:3000'),
});


export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): EnvConfig {
  const result = envSchema.safeParse(config);

  if (result.success && result.data.NODE_ENV === 'production') {
    if (result.data.JWT_SECRET === 'super-secret-betflow-jwt-key') {
      console.error(
        '\n❌ [Security Alert] Cannot use default JWT_SECRET in production environment.\n',
      );
      throw new Error('Insecure default JWT_SECRET in production mode');
    }
  }

  if (!result.success) {
    const formattedErrors = result.error.issues
      .map((err: z.ZodIssue) => `  - ${err.path.join('.')}: ${err.message}`)
      .join('\n');
    console.error(`\n❌ [Environment Validation Error]\n${formattedErrors}\n`);
    throw new Error('Invalid environment configuration');
  }

  return result.data;
}

