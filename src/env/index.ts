import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.url('DATABASE_URL deve ser uma URL válida.'),
  PORT: z.coerce.number().default(3333),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  FAKE_STORE_BASE_URL: z.url().default('https://fakestoreapi.com'),
  GOOGLE_GENERATIVE_AI_API_KEY: z.string().min(1, {
    message: 'A chave GOOGLE_GENERATIVE_AI_API_KEY é obrigatória.',
  }),
  GEMINI_MODEL: z.string().default('gemini-3.6-flash'),
});

const _env = envSchema.safeParse(process.env);

if (_env.success === false) {
  console.error('❌ Variáveis de ambiente inválidas:', _env.error.format());

  throw new Error('Falha na inicialização: Variáveis de ambiente inválidas.');
}

export const env = _env.data;