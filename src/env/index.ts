import 'dotenv/config'
import { z } from 'zod'

//process.env: {NODE_ENV: 'dev', ...}

const envSchema = z.object({
    NODE_ENV: z.enum(['dev', 'test', 'production']).default('production'),
    NODE_PORT: z.coerce.number().default(3333), // coerce converte o valor que for para um numero
    GCP_SPREADSHEET_ID: z.string(),
    GCP_SPREADSHEET_RANGE: z.string(),
    GCP_CLIENT_EMAIL: z.string(),
    GCP_PRIVATE_KEY: z.string(),
    JWT_SECRET: z.string(),
    KEEP_ALIVE_TIMEOUT: z.coerce.number().default(300000),
    FILE_SIZE: z.coerce.number().default(2097152), //2MB
    DATABASE_PORT:z.string(),
    DATABASE_HOST:z.string(),
    DATABASE_USER:z.string(),
    DATABASE_PASSWORD:z.string(),
    DATABASE_NAME:z.string(),
    DATABASE_SCHEMA:z.string(),
    DATABASE_URL:z.string(),
});

const _env = envSchema.safeParse(process.env);

if (_env.success == false) {
    console.error('Invalid environment variables.', _env.error.format())
    throw new Error('Invalid environment variables.');
}

export const env = _env.data