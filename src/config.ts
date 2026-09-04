import { readFileSync } from "node:fs";
import path from "node:path";

export interface EventConfig {
  name: string;
  tagline: string;
  date: string;
  venue: string;
  ticketUrl: string;
  hashtags: string[];
}

export interface ThreadsConfig {
  accessToken: string;
  userId: string;
}

export function getThreadsConfig(): ThreadsConfig {
  const accessToken = process.env.THREADS_ACCESS_TOKEN;
  const userId = process.env.THREADS_USER_ID;
  if (!accessToken || !userId) {
    throw new Error(
      "THREADS_ACCESS_TOKEN and THREADS_USER_ID must be set in the environment",
    );
  }
  return { accessToken, userId };
}

export function getAnthropicApiKey(): string {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY must be set in the environment");
  }
  return apiKey;
}

export function getAnthropicModel(): string {
  return process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5";
}

export function loadEventConfig(): EventConfig {
  const filePath = path.join(process.cwd(), "config", "event.json");
  const raw = readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as EventConfig;
}
