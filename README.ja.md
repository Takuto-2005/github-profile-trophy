# GitHub Profile Trophy（日本語版概要）

GitHubプロフィールに動的なトロフィー画像（SVG）を表示するサービスです。フォークしてVercelにデプロイすれば自分専用のエンドポイントを持てます。

## クイックスタート（公開デモを使う場合）
READMEに以下を貼り付け、`?username=` を自分のGitHubユーザー名に置き換えます。

```
[![trophy](https://github-profile-trophy.vercel.app/?username=ryo-ma)](https://github.com/ryo-ma/github-profile-trophy)
```

主なクエリパラメータ: `username`（必須）, `theme`, `title`, `rank`, `row`, `column`, `margin-w`, `margin-h`, `no-bg`, `no-frame`。テーマ一覧や詳細なパラメータ例は英語版READMEを参照してください。

## Vercelでのセルフホスト（個人専用）
1. このリポジトリをフォークし、Vercelで新規Projectとしてデプロイ。
2. Project Settings → Environment Variables に設定  
   - `GITHUB_TOKEN1`: Classic PAT（`read:user` + `public_repo`。私用リポを含めたい場合は `repo`）  
   - `GITHUB_TOKEN2`: 任意の予備トークン  
   - `ALLOWED_USERNAME`: 配信を許可する唯一のユーザー名（例: `Takuto-2005`）  
   - `GITHUB_API`: 省略可。既定は `https://api.github.com/graphql`
3. 環境変数を保存後に再デプロイ。  
4. 利用例: `https://<your-vercel-domain>/` （`ALLOWED_USERNAME` が自動適用。別ユーザー指定は403）。

トラブルシュート（400/403が続く場合）
- PATが Classic か確認（Fine-grainedでは権限不足になりやすい）
- スコープ: `read:user`, `public_repo`（私用リポも反映したい場合は `repo`）  
- Production環境に環境変数が入っているか、デプロイログで反映を確認する  
- 参考: Vercelデプロイ詳細 https://vercel.com/takus-projects-3ca1349f/github-profile-trophy/7p8fPHL8iGTwsd6di4jQDiV2LtdE

## ランクとシークレット
- ランクは `SSS` `SS` `S` `AAA` `AA` `A` `B` `C` `?`（UNKNOWN）`SECRET`。  
- 一部トロフィーは条件を満たすと `SECRET` で表示（例: 多言語利用、古参アカウント、組織数など）。

## テーマ
`theme=<name>` を付けて配色を変更できます（例: `onedark`, `gruvbox`, `dracula`, `tokyonight` など）。完全な一覧は英語版READMEの「Apply theme」を参照してください。

## ライセンス
[MIT License](./LICENSE)（本ファイルは参考訳）。

## コントリビュート
開発手順やlint/test実行方法は `CONTRIBUTING.ja.md` を参照してください。

