import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

// --- ADD THIS DEBUG BLOCK ---
const url = process.env.DATABASE_URL;
if (url) {
  // Log the protocol only (to keep password safe)
  console.log("DEBUG: Actual Protocol in use:", url.split('://')[0]); 
  console.log("DEBUG: Full URL starts with:", url.substring(0, 15));
} else {
  console.log("DEBUG: DATABASE_URL is UNDEFINED/MISSING");
}
// -----------------------------

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: ['query', 'error', 'warn'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma