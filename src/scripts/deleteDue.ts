import "dotenv/config";
import { deleteThreadsPost } from "../threads/client.js";
import { readPendingDeletions, writePendingDeletions, type PendingDeletion } from "../state/store.js";

async function main(): Promise<void> {
  const pending = readPendingDeletions();
  const now = Date.now();

  const due: PendingDeletion[] = [];
  const notYetDue: PendingDeletion[] = [];
  for (const item of pending) {
    if (new Date(item.deleteAt).getTime() <= now) {
      due.push(item);
    } else {
      notYetDue.push(item);
    }
  }

  if (due.length === 0) {
    console.log("No ghost posts due for deletion.");
    return;
  }

  const stillPending: PendingDeletion[] = [...notYetDue];
  for (const item of due) {
    try {
      await deleteThreadsPost(item.mediaId);
      console.log(`Deleted ghost post ${item.mediaId} (was due at ${item.deleteAt}).`);
    } catch (err) {
      console.error(`Failed to delete ${item.mediaId}, will retry on next run.`, err);
      stillPending.push(item);
    }
  }

  writePendingDeletions(stillPending);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
