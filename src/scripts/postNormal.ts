import "dotenv/config";
import { loadEventConfig } from "../config.js";
import { generatePostText } from "../content/generator.js";
import { createThreadsPost } from "../threads/client.js";

async function main(): Promise<void> {
  const event = loadEventConfig();
  const text = await generatePostText("normal", event);
  console.log("Generated normal post text:\n", text);

  const mediaId = await createThreadsPost(text);
  console.log(`Posted normal post. media_id=${mediaId}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
