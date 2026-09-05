import "dotenv/config";
import { POST_IMAGE_URL } from "../config.js";
import { pickPostText } from "../content/pool.js";
import { createThreadsPost } from "../threads/client.js";

async function main(): Promise<void> {
  const text = pickPostText("normal");
  console.log("Selected normal post text:\n", text);

  const mediaId = await createThreadsPost(text, POST_IMAGE_URL);
  console.log(`Posted normal post. media_id=${mediaId}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
