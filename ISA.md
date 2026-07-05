# ISA — Ideal State Artifact

> 対象: タイポグラフィ・ポートフォリオ「静寂と混沌 (Zen & Chaos)」
> 設計書: `C:\Users\user\Documents\Obsidian Vault\ポートフォリオ作成計画.md`

## 1. Problem
ポートフォリオサイトが存在しない。設計書にある「Minimalism(静寂)」と
「Generative Art(混沌)」の2コンセプトを1ページで切り替え表現するサイトが必要。

## 2. Current state
`C:\Users\user\typography-portfolio\` に前回セッションの実装が既に存在
(Zen/Chaos トグル、キネティック・パーティクルテキスト、Swiss グリッド一式)。
不足は「Blender/UE を用いたカオス3D表現」のみ → 既存を壊さず外科的に追加する。
Blender 5.1 が `C:\Program Files\Blender Foundation\Blender 5.1\blender.exe` に
インストール済み。Unreal Engine はローカルに見当たらない → Blender を採用。

## 3. Ideal state
(2026-07-05 ユーザーフィードバックで改訂: モード切替ではなく1画面共存)
1ページの中で静寂と混沌が**同時に**共存する:
- ベースは **Zen**: スイス・スタイル。紙白 × インク黒、厳密グリッド、1px罫線。
- ヒーロー領域に**カーソル追従の境界線**があり、その右側は **Chaos ペイン**:
  漆黒ヴェール + Blender 製破砕タイポ GLB (Three.js) + パーティクルテキスト。
  巨大タイポは境界の左では活字、右ではパーティクルに分解されて漂う。
- トグルは存在しない。境界がマウスと共に呼吸し、二面性を1画面で表現する。
- ヒーローを過ぎてスクロールすると Chaos ペインはフェードし、下層は純粋な Zen。

## 4. Scope
- **In scope:** Vite + Vanilla JS/CSS の1ページ、モードトグル、
  パーティクルテキスト、Blender headless での GLB 生成、Three.js 表示、動作検証。
- **Out of scope:** デプロイ、CMS、複数ページ、Unreal Engine 連携(未インストール)。

## 5. Constraints
- 設計書指定のスタック: Vite / Vanilla JS / Vanilla CSS / Canvas 2D (+Three.js 可)
- フォント: Syne, Space Grotesk, Shippori Mincho (Google Fonts)
- Blender 5.1 API (4.x からの破壊的変更に注意)

## 6. Approach
Blender headless (`blender -b --python`) で「CHAOS」立体文字を文字単位に分解し、
ノイズ変位 + ネオン発光シャード群(破片雲)を加えた GLB を生成。
Three.js (GLTFLoader + RoomEnvironment) で Chaos モード背景として描画。
Cell Fracture アドオンは 4.2+ で同梱外のため使わず、文字分解+破片散布で表現。

## 7. Steps
1. ISA 作成(本ファイル)
2. `tools/build_chaos_asset.py`(Blender スクリプト)作成
3. Web ファイル一式作成(index.html / style.css / main.js / generative.js / chaos3d.js)
4. Blender headless 実行 → `public/assets/chaos_typo.glb` 生成
5. `npm install` → dev サーバー起動
6. ブラウザ検証(両モード・トグル・パーティクル・GLB 表示・コンソールエラー)

## 8. Risks & reversibility
- Blender 5.1 API 差異 → 実行ログで検知し修正(全て再実行可能)
- vite dev サーバーの IPv6 バインド問題(既知) → `--host 127.0.0.1` 指定
- すべて新規フォルダ内の作業で破壊的操作なし

## 9. Dependencies
- npm レジストリ(vite, three)、Google Fonts CDN、Blender 5.1

## 10. Ownership
エージェントが全工程実施。デプロイ判断はユーザー。

## 11. Done criteria
- [x] `public/assets/chaos_typo.glb` が Blender から生成されている (9.9MB, 2026-07-05)
- [ ] ページ左側(Zen)がスイス・スタイル(白基調・グリッド・1px罫線)で表示される
- [ ] ヒーロー右側に Chaos ペイン(漆黒+Blender GLB+パーティクル)が常時表示される
- [ ] 境界線がカーソルXに追従して滑らかに移動する
- [ ] パーティクルテキストがマウスに反応する(反発→復元)
- [ ] ヒーロー通過後のスクロールで Chaos ペインがフェードアウトする
- [ ] コンソールに未処理エラーがない

## 12. Verification
preview サーバー起動 → snapshot / console logs / screenshot で両モードを確認。
結果は完了報告に記録する。
