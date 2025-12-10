# コントリビューションガイド（日本語訳）

## 開発環境
- Deno 1.36.1 以上
- Vercel アカウント
- GitHub API v4
- Docker / Docker Compose（任意、Redis利用時）

## ローカル実行
1. プロジェクト直下に `.env` を作成し、GitHubトークンを設定します。Classic PAT を作成し、`repo` または少なくとも `public_repo` と `read:user` を付与してください。
   ```properties
   GITHUB_TOKEN1=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   GITHUB_TOKEN2=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   # Enterprise を使う場合の例:
   # GITHUB_API=https://github.example.com/api/graphql
   ```
2. サーバー起動:
   ```sh
   deno task start
   ```
3. Redis を有効化する場合（任意）:
   ```sh
   docker compose up -d
   ```
   `env-example` を `.env` にリネームし、`ENABLE_REDIS=true` にします。
4. ブラウザで確認: `http://localhost:8080/?username=ryo-ma`

## エディタ設定
`.editorconfig` を参照してください。

## プルリクエスト
- 変更は一つの関心事に絞り、最小限の差分で提出してください。中核機能に関わる場合はIssueで事前に相談するとスムーズです。

## 事前チェック
1. Lint
   ```sh
   deno task lint
   ```
2. Format
   ```sh
   deno task format
   ```
3. Test
   ```sh
   deno task test
   ```

本ドキュメントは参考訳です。正式な規約や最新情報は原文をご確認ください。

