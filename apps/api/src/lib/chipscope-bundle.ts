import { ReplitConnectors } from "@replit/connectors-sdk";
import { GetChipScopeBundleResponse } from "@workspace/api-zod";
import type { ChipScopeBundle } from "@workspace/api-zod";

let cached: { value: ChipScopeBundle; expires: number } | undefined;
let pending: Promise<ChipScopeBundle> | undefined;

/** Serve data only; private source and GitHub credentials never reach clients. */
export async function loadBundle(): Promise<ChipScopeBundle> {
  if (cached && cached.expires > Date.now()) return cached.value;
  if (pending) return pending;
  pending = fetchBundle().finally(() => { pending = undefined; });
  return pending;
}

async function fetchBundle(): Promise<ChipScopeBundle> {
  const connectors = new ReplitConnectors();
  const response = await connectors.proxy(
    "github",
    "/repos/shubhamaggarwalee-prog/chipscope/contents/data/bundle.json?ref=main",
    { method: "GET" },
  );
  if (!response.ok) throw new Error("Dataset source unavailable");
  const file = await response.json() as { content?: string; encoding?: string };
  if (file.encoding !== "base64" || typeof file.content !== "string") {
    throw new Error("Invalid dataset source response");
  }
  const value = GetChipScopeBundleResponse.parse(
    JSON.parse(Buffer.from(file.content, "base64").toString("utf8")),
  );
  cached = { value, expires: Date.now() + 60_000 };
  return value;
}
