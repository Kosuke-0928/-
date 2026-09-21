import { getGeminiApiKey, getGeminiModel } from "../config.js";
import type { PostKind } from "./pool.js";

const EVENT = {
  name: "ネオクリエイターフェス",
  parentBrand: "MASH UP",
  date: "2027.1.23",
  venue: "渋谷ヒカリエ",
  roles: ["芸人", "ラッパー", "パフォーマー", "歌い手"],
  ageRange: "20〜28歳",
};

function buildPrompt(kind: PostKind): string {
  const common = `あなたは「${EVENT.parentBrand}」内の新企画「${EVENT.name}」を主催している本人です。
Threadsで日本の20代に向けて発信する出演者募集の投稿を1件だけ作成してください。

# イベント情報
- 名称: ${EVENT.name}(${EVENT.parentBrand}内の新企画)
- 開催日: ${EVENT.date}
- 会場: ${EVENT.venue}
- 募集対象: ${EVENT.roles.join("・")}、ジャンル不問、${EVENT.ageRange}
- 出演料などの詳細は面談で説明する
- 応募導線: この投稿への「いいね」またはメッセージ

# 必ず守る条件
- 主催者本人が丁寧語(です/ます、〜いたします)で語る、主体的なトーン
- 「〜らしい」「〜みたい」「〜って」といった伝聞・他人事のような表現は使わない
- 「おはよう」「今日も一日お疲れさま」等のくだけた挨拶や前置きは使わない
- ネガティブな表現(集まっていない、足りていない等)は使わない
- 「本気で頑張りたい人にとってのチャンスである」というメッセージを自然に含める
- LINEやURLなどのリンクは書かない
- 絵文字は0〜2個まで
- 文字数は400文字以内
- 本文のみを出力する(前置き・説明・カギカッコは不要)`;

  if (kind === "normal") {
    return `${common}

# トーン
通勤時間帯(7〜9時)や昼休み(12〜13時)に読まれることを想定した、前向きで明るいトーン。`;
  }

  return `${common}

# トーン
深夜(22〜25時)に読まれることを想定した、少し個人的で本音寄りのトーン。ただし主催者本人の言葉であることは変わらない。`;
}

interface GeminiResponse {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
}

export async function tryGenerateWithGemini(kind: PostKind): Promise<string | null> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return null;
  }

  try {
    const model = getGeminiModel();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildPrompt(kind) }] }],
      }),
    });

    if (!res.ok) {
      console.error(`Gemini API returned ${res.status}: ${await res.text()}`);
      return null;
    }

    const data = (await res.json()) as GeminiResponse;
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return text && text.length > 0 ? text : null;
  } catch (err) {
    console.error("Gemini generation failed:", err);
    return null;
  }
}
