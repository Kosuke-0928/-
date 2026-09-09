export interface ThreadsConfig {
  accessToken: string;
  userId: string;
}

// GitHubリポジトリがpublicであることが前提(Threads APIはimage_urlに
// 誰でもアクセスできるURLを要求するため)。投稿のたびにこの中からランダムで1枚選ぶ。
const RAW_BASE = "https://raw.githubusercontent.com/Kosuke-0928/-/main/assets";
export const POST_IMAGE_URLS = [
  `${RAW_BASE}/neo-creator-fes.png`,
  `${RAW_BASE}/neo-creator-fes-v2.png`,
  `${RAW_BASE}/neo-creator-fes-v3.png`,
  `${RAW_BASE}/neo-creator-fes-v4.png`,
  `${RAW_BASE}/neo-creator-fes-v5.png`,
];

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
