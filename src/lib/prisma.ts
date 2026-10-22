import { env } from '../env/index.js';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

/* v8 ignore next 3 */
if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}