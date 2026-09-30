import { Prisma, PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * Logs a loud, specific line when a query fails because the live database is
 * missing a table or column that `schema.prisma` expects (P2021 / P2022) —
 * the schema is out of sync with the database, most often because a deploy's
 * `prisma db push` step (see the "Database schema" section in the README)
 * hasn't run since a model changed. Always rethrows; it never swallows the
 * error, it only makes the cause obvious in the logs before the route
 * returns its normal error response.
 */
export function logIfSchemaOutOfSync(error: unknown, context: string): void {
  if (error instanceof Prisma.PrismaClientKnownRequestError && (error.code === 'P2021' || error.code === 'P2022')) {
    console.error(
      `[${context}] The database schema is out of sync with schema.prisma (${error.code}): ${error.message.split('\n').pop()?.trim()}. ` +
        `Redeploy so the build's "prisma db push" step can create it, or run it manually against DATABASE_URL.`
    );
  }
} 