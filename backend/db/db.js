const { PrismaClient } = require('@prisma/client');

const globalForPrisma = globalThis;

const db = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV === 'development') {
  globalForPrisma.prisma = db;  // Changed from 'db' to 'prisma' to match the check above
}

module.exports = db;