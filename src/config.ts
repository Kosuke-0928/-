export interface ThreadsConfig {
  accessToken: string;
  userId: string;
}

// GitHubリポジトリがpublicであることが前提(Threads APIはimage_urlに
// 誰でもアクセスできるURLを要求するため)。
export const POST_IMAGE_URL =
  "https://raw.githubusercontent.com/Kosuke-0928/-/main/assets/neo-creator-fes.png";

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
