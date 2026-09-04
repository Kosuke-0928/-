# Threads Auto Poster (MASH UP)

MASH UP(エンタメイベント)のThreads公式アカウント向けに、Claude APIで生成した投稿文を
日本の20代がよく見る時間帯に自動投稿するシステムです。GitHub Actionsの定期実行だけで動作し、
専用サーバーは不要です。

## 投稿の種類

| 種類 | タイミング(JST) | 内容 | 削除 |
|---|---|---|---|
| 通常投稿 | 8:00 / 12:30(通勤・昼休み) | イベント告知・宣伝トーン | しない |
| ゴースト投稿 | 23:00(就寝前の深夜) | 本音寄り・裏アカ風のトーン | 投稿から1〜3時間後に自動削除(ランダム) |

## 仕組み

- `.github/workflows/post-normal.yml` … 通常投稿を1日2回投稿
- `.github/workflows/post-ghost.yml` … ゴースト投稿を1日1回投稿し、削除予定時刻を
  `state/pending-deletions.json` に記録してコミット
- `.github/workflows/delete-ghost.yml` … 15分おきに実行し、削除予定時刻を過ぎた
  ゴースト投稿を削除、状態ファイルを更新してコミット

投稿文はClaude API(`src/content/prompts.ts`)で生成し、Threads API
(`src/threads/client.ts`)経由でコンテナ作成→公開の2段階で投稿します。

## セットアップ

### 1. 依存関係のインストール(ローカル動作確認用)

```bash
npm install
cp .env.example .env
# .env にThreadsアクセストークン・ユーザーID・Anthropic APIキーを設定
```

### 2. イベント情報の編集

`config/event.json` を実際のMASH UPのイベント情報に書き換えてください。

```json
{
  "name": "MASH UP",
  "tagline": "夜を彩るエンタメの祭典",
  "date": "開催日",
  "venue": "会場",
  "ticketUrl": "チケット購入URL",
  "hashtags": ["#MASHUP", "#マッシュアップ"]
}
```

投稿トーンや文字数制限を変えたい場合は `src/content/prompts.ts` を編集してください。

### 3. GitHub Secretsの設定

リポジトリの Settings → Secrets and variables → Actions で以下を登録します。

| Secret | 説明 |
|---|---|
| `THREADS_ACCESS_TOKEN` | Threads APIのアクセストークン(長期トークン推奨) |
| `THREADS_USER_ID` | 投稿先ThreadsアカウントのユーザーID |
| `ANTHROPIC_API_KEY` | Claude APIキー |

モデルを変更したい場合は Variables に `ANTHROPIC_MODEL` を追加してください(未設定時は `claude-sonnet-5`)。

### 4. ワークフローの有効化

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
- 投稿文はAI生成のため、公開前に内容を確認したい場合は `workflow_dispatch` で手動実行し、
  投稿結果をThreads上で確認する運用を推奨します。
