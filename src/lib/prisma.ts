import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function makePrisma() {
  const url = process.env.DATABASE_URL ?? "";
  // Supabase session pooler: append connection_limit=1 for serverless to avoid pool exhaustion
  const datasourceUrl = url && !url.includes("connection_limit")
    ? `${url}${url.includes("?") ? "&" : "?"}connection_limit=1&pool_timeout=10`
    : url;
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: { db: { url: datasourceUrl } },
  });
}

export const prisma = globalForPrisma.prisma || makePrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
