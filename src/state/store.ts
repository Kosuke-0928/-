import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

export interface PendingDeletion {
  mediaId: string;
  createdAt: string;
  deleteAt: string;
}

const STATE_FILE = path.join(process.cwd(), "state", "pending-deletions.json");

export function readPendingDeletions(): PendingDeletion[] {
  const raw = readFileSync(STATE_FILE, "utf-8");
  return JSON.parse(raw) as PendingDeletion[];
}

export function writePendingDeletions(list: PendingDeletion[]): void {
  writeFileSync(STATE_FILE, `${JSON.stringify(list, null, 2)}\n`, "utf-8");
}
