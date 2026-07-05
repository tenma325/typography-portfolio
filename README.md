# 静寂と混沌 — Zen & Chaos Typography Portfolio

「デザインとは、シンプルで、カオスだ。」

Minimalism(静寂)と Generative Art(混沌)、相反する2つのコンセプトを
1つの画面に共存させたタイポグラフィ・ポートフォリオ。

## 体験

- **静/沌の境界** — ヒーロー領域の境界線がカーソルに追従し、左は紙白の
  スイス・スタイル、右は漆黒のジェネラティブ空間。巨大タイポは境界の左では
  活字、右ではパーティクルに分解される
- **破砕タイポグラフィ (Blender)** — Blender 5.1 headless で生成した
  シャッター文字 + ネオン破片雲の GLB を Three.js で描画
- **星座背景** — スクロール後の下層では、点と線が入り乱れるインクの
  コンステレーションが紙の上を漂う

## 技術

Vite / Vanilla JS / Vanilla CSS / Canvas 2D / Three.js / Blender 5.1 (headless)

フォント: Syne, Space Grotesk, Shippori Mincho (Google Fonts)

## 開発

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # dist/
```

3D アセットの再生成:

```
blender -b --python tools/build_chaos_asset.py
```

## デプロイ

`main` への push で GitHub Actions が Vite ビルド → GitHub Pages へ自動デプロイ
(`.github/workflows/deploy.yml`)。
