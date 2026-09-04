import { readFileSync } from "node:fs";
import path from "node:path";

export type PostKind = "normal" | "ghost";

interface PostPool {
  normal: string[];
  ghost: string[];
}

function loadPostPool(): PostPool {
  const filePath = path.join(process.cwd(), "config", "posts.json");
  const raw = readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as PostPool;
}

export function pickPostText(kind: PostKind): string {
  const pool = loadPostPool()[kind];
  if (!pool || pool.length === 0) {
    throw new Error(`config/posts.json has no entries for "${kind}"`);
  }
  return pool[Math.floor(Math.random() * pool.length)] as string;
}
