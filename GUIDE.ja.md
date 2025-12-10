# GitHub Profile Trophy 詳細ガイド

このガイドは日本語での使い方と設定手順、PAT権限、トラブルシュートをまとめたものです。正式仕様や最新情報は英語版README/CONTRIBUTINGも参照してください。

## 1. 必要なPATスコープ
- 最低限（公開リポのみで十分な場合）  
  - `read:user`（ユーザー情報、フォロワー数取得）  
  - `public_repo`（公開リポのスター数・PR/Issueカウント）
- 非公開リポやプライベート組織も集計したい場合  
  - `repo`（privateを含む全リポのスター・PR/Issue/コミット計上）  
  - `read:org`（プライベート組織所属数の参照に必要なことがあります）
- Fine-grainedトークンより Classic PAT が推奨。権限不足があると400/403/404相当のエラーになります。

## 2. デプロイ（Vercel）
1) フォーク → Vercelで新規プロジェクトとしてインポート  
2) 環境変数（Project Settings → Environment Variables）  
   - `GITHUB_TOKEN1` … Classic PAT（上記スコープ）  
   - `GITHUB_TOKEN2` … 任意の予備トークン  
   - `ALLOWED_USERNAME` … サービスを提供する唯一のユーザー（例: `Takuto-2005`）  
   - `GITHUB_API` … 任意。既定は `https://api.github.com/graphql`
3) 保存後、再デプロイ。  
4) 動作確認: `https://<your-vercel-domain>/`（`username`未指定でも `ALLOWED_USERNAME` が適用）。別ユーザー指定は403となります。  
5) 障害調査: Vercelのデプロイ/ログを確認。例: https://vercel.com/takus-projects-3ca1349f/github-profile-trophy/7p8fPHL8iGTwsd6di4jQDiV2LtdE

## 3. ローカル開発
1) `.env` を作成（`env-example` をコピー）。  
2) 必須: `GITHUB_TOKEN1`（Classic PAT）, 任意: `GITHUB_TOKEN2`, `GITHUB_API`。  
3) サーバー起動: `deno task start` → `http://localhost:8080/?username=<you>`  
4) Redis を使う場合: `docker compose up -d` → `.env` で `ENABLE_REDIS=true`。

## 4. 主要なトロフィー判定条件（指標と閾値）
- Stars: 所有リポ合計スター数（上位50件から集計）  
  - SSS 2000, SS 700, S 200, AAA 100, AA 50, A 30, B 10, C 1
- Commits: 年間コミット＋制限付きコミット合計  
  - SSS 4000, SS 2000, S 1000, AAA 500, AA 200, A 100, B 10, C 1
- Followers: フォロワー数  
  - SSS 1000, SS 400, S 200, AAA 100, AA 50, A 20, B 10, C 1
- Issues: Open + Closed の合計  
  - SSS 1000, SS 500, S 200, AAA 100, AA 50, A 20, B 10, C 1
- PullRequest: PR総数  
  - SSS 1000, SS 500, S 200, AAA 100, AA 50, A 20, B 10, C 1
- Repositories: 所有リポ数  
  - SSS 50, SS 45, S 40, AAA 35, AA 30, A 20, B 10, C 1
- Reviews: PRレビュー数  
  - SSS 70, SS 57, S 45, AAA 30, AA 20, A 8, B 3, C 1
- Experience (AccountDuration): 最古リポ作成日からの経過を日換算したスコア  
  - SSS 70, SS 55, S 40, AAA 28, AA 18, A 11, B 6, C 2
- Secret系  
  - AllSuperRank: すべてのトロフィーがS以上  
  - MultiLanguage: 使用言語10種以上  
  - LongTimeUser: 最古リポから約10年以上  
  - AncientUser: 最古リポが2010年以前  
  - OGUser: 最古リポが2008年以前  
  - Joined2020: 最古リポが2020年  
  - Organizations: 所属組織数3以上  

## 5. よく使うクエリパラメータ
- `username`（必須）  
- `theme` … `onedark`, `gruvbox`, `dracula`, `tokyonight` など  
- `title` … 表示したい/除外したいタイトル（例: `title=Followers,Stars` / `title=-Issues`）  
- `rank` … 表示したい/除外したいランク（例: `rank=S,AAA` / `rank=-C,-B`）  
- `row`, `column` … 最大行/列数（`column=-1` で自動幅）  
- `margin-w`, `margin-h` … 余白指定  
- `no-bg`, `no-frame` … 背景・枠の非表示

## 6. トラブルシュート
- 400/403/404系: PAT権限不足、環境変数未設定、`ALLOWED_USERNAME` と異なるユーザー指定。  
- レートリミット: トークンを複数設定（`GITHUB_TOKEN2`）し、しばらく待機。  
- データが少ない: リポが50件を超える場合は上位スター順50件のみ集計。必要ならGraphQLのクエリを拡張してください。

## 7. ライセンス
MIT（`LICENSE`）。本ファイルは参考訳です。

