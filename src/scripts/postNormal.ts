import "dotenv/config";
import { tryGenerateWithGemini } from "../content/gemini.js";
import { pickPostImageUrl, pickPostText } from "../content/pool.js";
import { createThreadsPost } from "../threads/client.js";

async function main(): Promise<void> {
  const generated = await tryGenerateWithGemini("normal");
  const text = generated ?? pickPostText("normal");
  const imageUrl = pickPostImageUrl();
  console.log(`Post text source: ${generated ? "Gemini" : "static pool"}`);
  console.log("Selected normal post text:\n", text);
  console.log("Selected image:", imageUrl);

  const mediaId = await createThreadsPost(text, imageUrl);
  console.log(`Posted normal post. media_id=${mediaId}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
