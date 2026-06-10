import "dotenv/config";
import { PrismaClient } from "./generated/prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

console.log("DATABASE_URL =", process.env.DATABASE_URL);
console.log("DATABASE_URL =", process.env.DATABASE_URL);
console.log("TYPE =", typeof process.env.DATABASE_URL);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter, // ✅ THIS is the correct way in Prisma 7
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}