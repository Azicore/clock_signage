# Raspberry Pi用オリジナル時計サイネージ

noteに簡単な製作記を投稿しました。まずはこちらをお読み下さい。

* https://note.com/azicore/n/na8fcca7d4bed

## 注意

* 私的な作品ですので、改善依頼やプルリクエスト等は受け付けません。
* 当リポジトリ内のコードの使用や以下に説明の手順の実行は、全て自己責任にてお願いいたします。
* コードに関する質問は、Twitter（[@Azicore](https://twitter.com/Azicore)）でお願いします。

## 推奨環境

* Raspberry Pi 4 Model Bで実行することを前提としています。
* 13インチ程度のサイズで、横縦比16:9のモニターで表示することを想定しています。

## ファイル構成

* `index.html` … 外枠ページ。ドキュメントルートに設置し、ブラウザで表示する。`<iframe>`で`signage/index.html`を読み込む。
* `startup.sh` … OS起動時にcrontabに叩かれるスクリプト。
* `update.sh` … アプリ更新時に手動で叩くスクリプト。
* `update.json` … `index.html`が監視する更新フラグファイル。

以下は、`signage`ディレクトリ内。

* `index.html` … 時計サイネージの本体ページ。
* `components` … 各パーツのJSファイル。
* `config` … 祝日の設定とメッセージの設定のJSファイル。
* `message_icons` … メッセージに使うアイコン画像。
* `weather_icons` … 天気に使うアイコン画像。


## デプロイ方法

※Raspberry Pi自体のセットアップについては省略しています。環境に合わせて以下の手順は適宜読み替えて下さい。

1. 本リポジトリのルートディレクトリを、`/home/pi/www/`などに設置し、ドキュメントルートとする。
1. 「`crontab crontab.txt`」でcrontabを設定する。
1. 「`sudo apt install unclutter`」でunclutterをインストールする。
1. 「`sudo shutdown -r now`」で再起動する。

## 更新方法

1. scp等で`signage`以下のファイルを更新する。
1. `update.sh`を実行する。
1. 少し待つと、自動的にブラウザがリロードされる。

## 運用方法

* メッセージを修正・追加する場合は、`signage/config/messages.js`を修正する。
* 祝日を修正・追加する場合は、`signage/config/holidays.js`を修正する。
* 画面上で、半角数字・ひらがな・カタカナ以外の文字種を使用する場合はサブセットフォントの作り直しが必要。
