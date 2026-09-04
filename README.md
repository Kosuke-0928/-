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

投稿文は `config/posts.json` に用意したテキストの中からランダムに1件選び、Threads API
(`src/threads/client.ts`)経由でコンテナ作成→公開の2段階で投稿します。AIによる自動生成は
行わないため、追加の課金は発生しません。

## セットアップ

### 1. 依存関係のインストール(ローカル動作確認用)

```bash
npm install
cp .env.example .env
# .env にThreadsアクセストークン・ユーザーIDを設定
```

### 2. 投稿文の編集

`config/posts.json` に、通常投稿用(`normal`)とゴースト投稿用(`ghost`)の文章をそれぞれ
配列で用意しています。実際のMASH UPの情報(日程・会場・チケットURLなど)に合わせて
自由に書き換え・追加・削除してください。投稿のたびにこの中からランダムで1件選ばれます。

```json
{
  "normal": ["投稿文1", "投稿文2", "..."],
  "ghost": ["投稿文1", "投稿文2", "..."]
}
```

### 3. GitHub Secretsの設定

リポジトリの Settings → Secrets and variables → Actions で以下を登録します。

| Secret | 説明 |
|---|---|
| `THREADS_ACCESS_TOKEN` | Threads APIのアクセストークン(長期トークン推奨) |
| `THREADS_USER_ID` | 投稿先ThreadsアカウントのユーザーID |

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
- **投稿文のマンネリ化**: ランダム選択のため、`config/posts.json` の件数が少ないと
  同じ投稿が短期間で繰り返されることがあります。定期的に文章を追加・更新してください。
