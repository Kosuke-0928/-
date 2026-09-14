# Threads Auto Poster (MASH UP / ネオクリエイターフェス出演者募集)

MASH UP(produced by AiM PISTA)内の新企画「ネオクリエイターフェス」の出演者募集(芸人・
ラッパー・パフォーマー・歌い手、20〜28歳対象、2027.1.23 渋谷ヒカリエ開催)を、Threads公式
アカウントから日本の20代がよく見る時間帯に自動投稿するシステムです。GitHub Actionsの定期実行
だけで動作し、専用サーバーも有料のAPIも不要です。

## 投稿の種類

| 種類 | タイミング(JST) | 内容 | 削除 |
|---|---|---|---|
| 通常投稿 | 8:00 / 12:30(通勤・昼休み) | 出演者募集の告知・応募トーン | しない |
| ゴースト投稿 | 23:00(就寝前の深夜) | 本音寄り・裏アカ風の募集トーン | 投稿から1〜3時間後に自動削除(ランダム) |

## 仕組み

- `.github/workflows/post-normal.yml` … 通常投稿を1日2回投稿
- `.github/workflows/post-ghost.yml` … ゴースト投稿を1日1回投稿し、削除予定時刻を
  `state/pending-deletions.json` に記録してコミット
- `.github/workflows/delete-ghost.yml` … 15分おきに実行し、削除予定時刻を過ぎた
  ゴースト投稿を削除、状態ファイルを更新してコミット

投稿文は、`GEMINI_API_KEY` を設定していればGemini API(無料枠)でその場で生成し、
未設定の場合や生成に失敗した場合は `config/posts.json` の静的な投稿文プールからランダムに
1件選びます。画像は `assets/` 内のフライヤー画像の中から、投稿のたびに独立してランダムに
1枚選ばれます。いずれもThreads API(`src/threads/client.ts`)経由でコンテナ作成→公開の
2段階で投稿します。Gemini APIは無料枠の範囲で使う前提のため、追加の課金は基本的に
発生しません。

## セットアップ

### 1. 依存関係のインストール(ローカル動作確認用)

```bash
npm install
cp .env.example .env
# .env にThreadsアクセストークン・ユーザーIDを設定
```

### 2. 投稿文について

`config/posts.json` に、通常投稿用(`normal`)とゴースト投稿用(`ghost`)の文章をそれぞれ
配列で用意しています。`GEMINI_API_KEY` 未設定時や生成失敗時は、ここからランダムで1件
選ばれます。実際のMASH UPの情報に合わせて自由に書き換え・追加・削除してください。

```json
{
  "normal": ["投稿文1", "投稿文2", "..."],
  "ghost": ["投稿文1", "投稿文2", "..."]
}
```

Gemini APIで自動生成する場合のプロンプト・イベント情報は `src/content/gemini.ts` の
`EVENT` 定数とプロンプト文言で編集できます。

### 3. 投稿画像について

`assets/` 内の複数のフライヤー画像(`neo-creator-fes.png`、`neo-creator-fes-v2.png` など)
を投稿画像として使用しています。投稿のたびにこの中からランダムで1枚選ばれます。画像を
追加・差し替えたい場合は、ファイルを `assets/` に置いた上で `src/config.ts` の
`POST_IMAGE_URLS` にURLを追加・編集してください。Threads APIは画像を「誰でもアクセス
できる公開URL」として要求するため、**このリポジトリはpublic(公開)設定である必要が
あります**。

### 4. GitHub Secretsの設定

リポジトリの Settings → Secrets and variables → Actions で以下を登録します。

| Secret | 説明 |
|---|---|
| `THREADS_ACCESS_TOKEN` | Threads APIのアクセストークン(長期トークン推奨) |
| `THREADS_USER_ID` | 投稿先ThreadsアカウントのユーザーID |
| `GEMINI_API_KEY`(任意) | Gemini APIキー([Google AI Studio](https://aistudio.google.com/apikey)で無料発行)。設定するとAIが投稿文を自動生成する |

### 5. ワークフローの有効化

`.github/workflows/*.yml` はデフォルトブランチにマージされると自動的にスケジュール実行されます。
`workflow_dispatch` にも対応しているので、Actionsタブから手動実行して動作確認できます。

## ローカルでの動作確認

```bash
npm run post:normal   # 通常投稿を1件テスト投稿
npm run post:ghost    # ゴースト投稿を1件テスト投稿(state/pending-deletions.jsonに記録される)
npm run delete:due    # 削除予定時刻を過ぎたゴースト投稿を削除
```

## 注意事項・既知の制約

- **アクセストークンの更新**: Threads APIの長期アクセストークンは60日で失効します。
  このリポジトリにはトークンの自動更新は含まれていないため、期限が近づいたら
  [トークンのリフレッシュ](https://developers.facebook.com/docs/threads/get-started/long-lived-tokens)
  を行い、GitHub Secretsを手動で更新してください。
- **状態ファイルの競合**: `post-ghost.yml` と `delete-ghost.yml` は同じ
  `state/pending-deletions.json` を更新するため、`concurrency` グループで同時実行を防止し、
  push前に `git pull --rebase` することでコンフリクトを避けています。
- **GitHub Actionsのスケジュール精度**: GitHub Actionsの`schedule`は負荷状況により
  数分〜十数分程度遅延することがあります。ゴースト投稿の削除チェックは15分間隔のため、
  実際の削除は予定時刻から最大15分程度後ろにずれる可能性があります。
- **投稿文のマンネリ化**: ランダム選択のため、`config/posts.json` の件数が少ないと
  同じ投稿が短期間で繰り返されることがあります。定期的に文章を追加・更新してください。
- **Gemini APIの無料枠**: 無料枠には回数制限があります。上限に達したりAPIエラーが
  発生した場合は自動的に静的な投稿文プールにフォールバックするため、投稿自体が止まる
  ことはありません。
