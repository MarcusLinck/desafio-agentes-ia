import { env } from '../env/index.js';
import pino from 'pino';

const isProduction = env.NODE_ENV === 'production';

export const logger = pino({
  level: env.LOG_LEVEL || 'info',
  /* v8 ignore next 3 */
  redact: {
    // Nunca logar esses campos sensíveis, mesmo se vierem no corpo da requisição
    paths: ['headers', 'body', 'query'],
    remove: true,
  },
  transport: !isProduction
    ? {
        target: 'pino-pretty',
        options: {
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
});