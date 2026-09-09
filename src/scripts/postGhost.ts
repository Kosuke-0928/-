import "dotenv/config";
import { pickPostImageUrl, pickPostText } from "../content/pool.js";
import { createThreadsPost } from "../threads/client.js";
import { readPendingDeletions, writePendingDeletions } from "../state/store.js";

const MIN_DELETE_DELAY_HOURS = 1;
const MAX_DELETE_DELAY_HOURS = 3;

function randomDeleteDelayMs(): number {
  const hours =
    MIN_DELETE_DELAY_HOURS +
    Math.random() * (MAX_DELETE_DELAY_HOURS - MIN_DELETE_DELAY_HOURS);
  return hours * 60 * 60 * 1000;
}

async function main(): Promise<void> {
  const text = pickPostText("ghost");
  const imageUrl = pickPostImageUrl();
  console.log("Selected ghost post text:\n", text);
  console.log("Selected image:", imageUrl);

  const mediaId = await createThreadsPost(text, imageUrl);
  const now = new Date();
  const deleteAt = new Date(now.getTime() + randomDeleteDelayMs());
  console.log(`Posted ghost post. media_id=${mediaId}, deleteAt=${deleteAt.toISOString()}`);

  const pending = readPendingDeletions();
  pending.push({
    mediaId,
    createdAt: now.toISOString(),
    deleteAt: deleteAt.toISOString(),
  });
  writePendingDeletions(pending);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
