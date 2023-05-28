# Raspberry Pi用オリジナル時計サイネージ

noteに簡単な製作記を投稿しました。まずはこちらをお読み下さい。

* https://note.com/azicore/n/na8fcca7d4bed
* https://note.com/azicore/n/n1579bf70e407 （続編）

※記事執筆後も改良を続けているため、一部記事の内容と仕様が変わっている部分があります。

## 注意

* 私的な作品ですので、改善依頼やプルリクエスト等は受け付けません。
* 当リポジトリ内のコードの使用や以下に説明の手順の実行は、全て自己責任にてお願いいたします。
* コードに関する質問は、Twitter（[@Azicore](https://twitter.com/Azicore)）でお願いします。

## 推奨環境

* Raspberry Pi 4 Model Bで実行することを前提としています。
* 13インチ程度のサイズで、横縦比16:9のモニターで表示することを想定しています。

## ファイル構成

### 主要ファイル：

* `startup.sh` … OS起動時にcrontabに叩かれるスクリプト。
* `server.js` … Node.jsによるウェブサーバー。`startup.sh`により起動。
* `main/display.html` … 外枠ページ。Raspberry Pi上のブラウザで表示する。`<iframe>`でアプリの画面を読み込む。
* `main/index.html` … リモコンページ。スマホ等の別デバイスで表示し、`display.html`が読み込むアプリを切り替えることができる。

### `signage`ディレクトリ内：

* `index.html` … 時計サイネージの本体ページ。
* `components` … 各パーツのJSファイル。
* `config` … 設定のJSファイル。
* `weather_icons` … 天気に使うアイコン画像。
* `message_icons` … メッセージに使うアイコン画像。
* `message_sounds` … メッセージに使うサウンド。

### `floating_clock`ディレクトリ内：

* `index.html` … スクリーンセーバー（デジタル時計）の本体ページ。
* `config.js` … スクリーンセーバー（デジタル時計）の設定。

### `shutdown`ディレクトリ内：

* `index.html` … 再起動/シャットダウン画面の本体ページ。
* `config.js` … 再起動/シャットダウン画面の設定。
* `shutdown.sh` … 再起動/シャットダウンの実行スクリプト。

### `photo_slideshow`ディレクトリ内：

* `index.html` … フォトスライドショーの本体ページ。
* `config.js` … フォトスライドショーの設定。
* `filelist.sh` … ファイルリスト作成スクリプト。
* `sample_images` … サンプル画像。

### `kakijun`ディレクトリ内

* `index.html` … 書き順アニメーションの本体ページ。
* `config.js` … 書き順アニメーションの設定。

## デプロイ方法

※Raspberry Pi自体のセットアップについては省略しています。環境に合わせて以下の手順は適宜読み替えて下さい。

1. 本リポジトリのルートディレクトリを、`/home/pi/www/`などに設置し、ドキュメントルートとする。
1. 「`crontab crontab.txt`」でcrontabを設定する。
1. 「`sudo apt install unclutter`」でunclutterをインストールする。
1. 「`curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash`」でnvmをインストールする。
1. 「`. ~/.bashrc`」を実行してnvmを有効化し、「`nvm install 18`」でNode.jsをインストールする。
1. 「`npm install`」で依存モジュールをインストールする。
1. Chromiumの設定画面で「設定 > プライバシーとセキュリティ > サイトの設定 > 音声」を開き、許可サイトに「`http://localhost:ポート番号`」を追加しておく。
1. 「`sudo shutdown -r now`」で再起動する。

## 更新方法

1. scp等で必要なファイルをRaspberry Piに転送して更新する。
1. リモコンページを開いて対象アプリのボタンをクリックする。

## 運用方法

### 時計サイネージ

* メッセージを修正・追加する場合は、`signage/config/messages.js`を修正する。
* 祝日を修正・追加する場合は、`signage/config/holidays.js`を修正する。
* 画面上で、半角数字・ひらがな・カタカナ以外の文字種を使用する場合はサブセットフォントの作り直しが必要。

### その他

* ウェブサーバーのポート番号を変更するには、`startup.sh`の`HTTP_PORT`、`WS_PORT`を変更する。
* アプリを追加するには、`signage`や`floating_clock`同様にディレクトリを切り、`main/main.js`にパスと名前を追加すると、リモコンに追加される。

## 更新履歴

### 2023/05/28

* 「書き順アニメーション」（`kakijun/`）を追加。

### 2023/03/10

* 「フォトスライドショー」（`photo_slideshow/`）を追加。

### 2023/03/07

* 「スクリーンセーバー（デジタル時計）」のディレクトリ名と構成を変更（`screensaver/`→`floating_clock/`）。

### 2023/03/04

* リモコンでRaspberry Pi本体の再起動/シャットダウンができる画面（`shutdown/`）を追加。

### 2023/01/19

* 時計サイネージと切り替えて表示できる第二のアプリとして「スクリーンセーバー（デジタル時計）」（`screensaver/`）を追加。

### 2023/01/15

* 時計サイネージのJSコンポーネント（`signage/components/*.js`）をES modules形式に書き換え。

### 2023/01/14

* Pythonサーバーの使用を廃止し、代わりにNode.jsによるオリジナルのウェブサーバー（`server.js`）を作成。
* 別デバイスからアプリを切り替えるためのリモコンページ（`main/index.html`）を製作。それに伴い、外枠ページも大幅に修正し、場所も`index.html`→`main/display.html`に変更。
* 自作サーバーとリモコンページで更新が可能となったため、`update.sh`による更新方法を廃止。

### 2022/11/12

* メッセージ表示時に、外部サーバーに保存した任意のメッセージを表示できる機能を追加。

### 2022/11/07

* 天気予報の地域などの個人的な設定を`signage/config/config.js`に分割。

### 2022/11/06

* メッセージ表示時に、サウンドを再生できる機能を追加。
* 毎時00分と30分のメッセージでチャイムを鳴らすように設定。

### 2022/11/04

* 時計サイネージの背景パターンが月ごとに変わる機能を追加。

### 2022/10/28

* 最初のバージョン。
* 時計サイネージ（カレンダー、アナログ時計、天気予報、メッセージ）を公開。
