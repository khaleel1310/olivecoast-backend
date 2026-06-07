import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// 1. Create a standard PostgreSQL connection pool using your env string
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// 2. Wrap it neatly inside Prisma's v7 Driver Adapter layer
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter, // 👈 Hand the adapter directly to Prisma here!
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;