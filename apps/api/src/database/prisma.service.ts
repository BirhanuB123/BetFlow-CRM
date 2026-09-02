import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

if (!process.env.DATABASE_URL) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'CRITICAL SECURITY FAILURE: DATABASE_URL environment variable is missing in production environment.',
    );
  }
  process.env.DATABASE_URL =
    'postgresql://betflow:betflowpassword@localhost:5432/betflow_db?schema=public';
}

const poolMax = parseInt(process.env.DB_POOL_MAX || '20', 10);
const isSsl =
  process.env.DB_SSL === 'true' ||
  (process.env.DATABASE_URL &&
    (process.env.DATABASE_URL.includes('sslmode=require') ||
      process.env.DATABASE_URL.includes('sslmode=no-verify')));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: poolMax,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ...(isSsl ? { ssl: { rejectUnauthorized: false } } : {}),
});

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      adapter: new PrismaPg(pool) as any,
    });
  }
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
    if (!pool.ending && !pool.ended) {
      try {
        await pool.end();
      } catch {
        // pool already terminated
      }
    }
  }
}
