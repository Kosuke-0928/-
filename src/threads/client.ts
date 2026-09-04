import { getThreadsConfig } from "../config.js";

const THREADS_API_BASE = "https://graph.threads.net/v1.0";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function parseErrorBody(res: Response): Promise<string> {
  try {
    return await res.text();
  } catch {
    return `HTTP ${res.status}`;
  }
}

/**
 * Threads APIは投稿作成が「コンテナ作成」→「公開」の2段階になっている。
 * https://developers.facebook.com/docs/threads/posts
 */
export async function createThreadsPost(text: string): Promise<string> {
  const { accessToken, userId } = getThreadsConfig();

  const createParams = new URLSearchParams({
    media_type: "TEXT",
    text,
    access_token: accessToken,
  });
  const createRes = await fetch(`${THREADS_API_BASE}/${userId}/threads`, {
    method: "POST",
    body: createParams,
  });
  if (!createRes.ok) {
    throw new Error(
      `Failed to create Threads media container: ${await parseErrorBody(createRes)}`,
    );
  }
  const { id: creationId } = (await createRes.json()) as { id: string };

  // Metaはコンテナ作成後、公開までに数秒待つことを推奨している
  await sleep(2000);

  const publishParams = new URLSearchParams({
    creation_id: creationId,
    access_token: accessToken,
  });
  const publishRes = await fetch(`${THREADS_API_BASE}/${userId}/threads_publish`, {
    method: "POST",
    body: publishParams,
  });
  if (!publishRes.ok) {
    throw new Error(
      `Failed to publish Threads post: ${await parseErrorBody(publishRes)}`,
    );
  }
  const { id: mediaId } = (await publishRes.json()) as { id: string };
  return mediaId;
}

export async function deleteThreadsPost(mediaId: string): Promise<void> {
  const { accessToken } = getThreadsConfig();
  const params = new URLSearchParams({ access_token: accessToken });
  const res = await fetch(`${THREADS_API_BASE}/${mediaId}?${params.toString()}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error(`Failed to delete Threads post ${mediaId}: ${await parseErrorBody(res)}`);
  }
}
