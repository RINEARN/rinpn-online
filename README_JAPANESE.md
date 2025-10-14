# RINPn オンライン版

( &raquo; [English](./README.md) )


関数電卓 [RINPn](https://github.com/RINEARN/rinpn) の、ブラウザ上でも利用可能な簡易版です。


## 使い方

以下のHTMLファイルをWebブラウザで開いてください（普通にダブルクリックすると開けます）：

    Japanese/index.html

すると、ブラウザの画面内に電卓が表示されます。


## ビルド方法

このアプリはオープンソースです。
以下のようにソースコードを入手・ビルドできます：

    # ソースコードを入手
    git clone https://github.com/RINEARN/rinpn-online.git

    # アプリのフォルダ内に移動
    cd ./rinpn-online/Japanese

    # 環境構築
    npm init   # "package.json" をまだ初期化していない場合のみ
    npm install --save-dev typescript
    npm install --save-dev @types/node 
    npm install --save-dev esbuild

    # ビルド
    npx esbuild rinpn-online.ts --bundle --outfile=rinpn-online-bundled.js

全てのビルド手順が正常に完了すると、一枚化されたJavaScriptファイル「rinpn-online-bundled.js」が生成されます。このファイルは index.html から読み込まれます。


## ライセンス

* RINPnオンライン版の本体: MIT License

依存ライブラリ: 

* [Exevalator](https://github.com/RINEARN/exevalator) (数式計算ライブラリ): Unlicense


## 開発元について

RINPn や RINPn オンライン版は、日本の個人運営の開発スタジオ [RINEARN](https://www.rinearn.com/) が開発しています。著者は松井文宏です。ご質問やフィードバックなどをお持ちの方は、ぜひ御気軽にどうぞ！

