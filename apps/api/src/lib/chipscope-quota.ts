import { createHmac } from "node:crypto";
import { db, aiQuotaTable } from "@workspace/db";
import { lt, sql } from "drizzle-orm";

export class DailyLimitError extends Error {}

/** Atomic, shared across replicas and restarts. Failed reservations roll back. */
export async function reserveAnswer(address: string): Promise<void> {
  const salt = process.env.SESSION_SECRET;
  if (!salt) throw new Error("Quota configuration unavailable");
  const day = new Date().toISOString().slice(0, 10);
  const expiresAt = new Date(`${day}T00:00:00Z`);
  expiresAt.setUTCDate(expiresAt.getUTCDate() + 1);
  const client = createHmac("sha256", salt).update(address).digest("hex");
  await db.transaction(async (tx) => {
    // Delete expired counters, not user data.
    await tx.delete(aiQuotaTable).where(lt(aiQuotaTable.expiresAt, new Date()));
    for (const [scope, limit] of [[`global:${day}`, 200], [`client:${client}:${day}`, 10]] as const) {
      const rows = await tx.insert(aiQuotaTable).values({ scope, count: 1, expiresAt })
        .onConflictDoUpdate({
          target: aiQuotaTable.scope,
          set: { count: sql`${aiQuotaTable.count} + 1` },
          setWhere: sql`${aiQuotaTable.count} < ${limit}`,
        }).returning({ count: aiQuotaTable.count });
      if (!rows.length) throw new DailyLimitError("Daily AI limit reached");
    }
  });
}
