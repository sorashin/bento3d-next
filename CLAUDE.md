# CLAUDE.md

このファイルは、このリポジトリでコードを操作する際にClaude Code (claude.ai/code) にガイダンスを提供します。

## 開発コマンド

### 基本的なコマンド
- `yarn dev` - 開発サーバーを起動
- `yarn build` - プロダクションビルドを実行（TypeScriptコンパイル後にViteビルド）
- `yarn lint` - ESLintによるコードチェック
- `yarn preview` - ビルド済みアプリケーションのプレビュー

### 開発時の注意点
- Node.js 22.0を使用（.node-versionで管理）
- Yarnパッケージマネージャーを使用（v4.4.1）

## アーキテクチャ概要

### アプリケーション構造
これは3Dジオメトリエディタアプリケーションで、React + TypeScript + Viteで構築されています。

### 主要な技術スタック
- **フロントエンド**: React 19, TypeScript, Tailwind CSS v4
- **3D レンダリング**: Three.js, React Three Fiber, React Three Drei
- **状態管理**: Zustand
- **ルーティング**: React Router v7
- **ビルドツール**: Vite 6
- **ジオメトリ処理**: nodi-modular, manifold-3d (WebAssembly)

### ページ構造
アプリケーションは3つの主要なページを持ちます：
- `/tray` - トレイエディタ（デフォルト）
- `/bento3d` - ベント箱エディタ
- `/gridfinity` - Gridfinityエディタ

各ページは動的インポートによる遅延読み込みが実装されています。

### 状態管理アーキテクチャ
#### Zustandストア
- `modular.ts` - nodi-modularライブラリとのインテグレーション、ジオメトリ生成・評価
- `navigation.ts` - ページ内ナビゲーション状態
- `settings.ts` - アプリケーション設定とUI状態
- `tray.ts` - トレイエディタの状態

#### nodi-modular統合
- JSONグラフファイル（`src/assets/graph/`）に基づいてジオメトリを生成
- WebAssemblyベースのmanifold-3dライブラリを使用
- リアルタイムでのパラメータ変更とジオメトリ再計算

### コンポーネント構造
```
src/components/
├── common/          # 共通コンポーネント
│   ├── 3d/         # 3D関連の汎用コンポーネント
│   └── ui/         # UI コンポーネント
├── bento3d/        # ベント箱専用コンポーネント
├── gridfinity/     # Gridfinity専用コンポーネント
└── tray/           # トレイ専用（現在は共通コンポーネントを使用）
```

### 重要な設定
- エイリアス: `@` -> `/src`
- WebAssembly最適化: nodi-modular, manifold-3dは最適化対象から除外
- SVGRプラグイン: SVGファイルのReactコンポーネント化

### Firebase統合
- `cloud-functions/` ディレクトリにFirebase Functionsが含まれる
- `firebase.json` でFirebaseプロジェクト設定を管理

### アセット管理
- `src/assets/filaments.json` - 3Dプリンタフィラメント情報
- `src/assets/graph/` - nodi-modularグラフ定義ファイル
- `public/images/` - 静的画像リソース