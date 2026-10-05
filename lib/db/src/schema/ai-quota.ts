import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// Only salted client hashes are stored. No prompts, keys, or raw IP addresses.
export const aiQuotaTable = pgTable("chipscope_ai_quota", {
  scope: text("scope").primaryKey(),
  count: integer("count").notNull().default(0),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

export const insertAiQuotaSchema = createInsertSchema(aiQuotaTable);
export type InsertAiQuota = z.infer<typeof insertAiQuotaSchema>;
export type AiQuota = typeof aiQuotaTable.$inferSelect;
