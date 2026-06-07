"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const pg_1 = require("pg");
const adapter_pg_1 = require("@prisma/adapter-pg");
const client_1 = require("@prisma/client");
const globalForPrisma = global;
// 1. Create a standard PostgreSQL connection pool using your env string
const pool = new pg_1.Pool({ connectionString: process.env.DATABASE_URL });
// 2. Wrap it neatly inside Prisma's v7 Driver Adapter layer
const adapter = new adapter_pg_1.PrismaPg(pool);
exports.prisma = globalForPrisma.prisma ||
    new client_1.PrismaClient({
        adapter, // 👈 Hand the adapter directly to Prisma here!
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
if (process.env.NODE_ENV !== 'production')
    globalForPrisma.prisma = exports.prisma;
