import Anthropic from "@anthropic-ai/sdk";
import { getAnthropicApiKey, getAnthropicModel, type EventConfig } from "../config.js";
import { buildGhostPrompt, buildNormalPrompt } from "./prompts.js";

export type PostKind = "normal" | "ghost";

const MAX_LENGTH_BY_KIND: Record<PostKind, number> = {
  normal: 500,
  ghost: 500,
};

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1)}…`;
}

export async function generatePostText(kind: PostKind, event: EventConfig): Promise<string> {
  const client = new Anthropic({ apiKey: getAnthropicApiKey() });
  const prompt = kind === "normal" ? buildNormalPrompt(event) : buildGhostPrompt(event);

  const message = await client.messages.create({
    model: getAnthropicModel(),
    max_tokens: 400,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();

  if (!text) {
    throw new Error("Anthropic API returned an empty response");
  }

  return truncate(text, MAX_LENGTH_BY_KIND[kind]);
}
