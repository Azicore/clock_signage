window.addEventListener('DOMContentLoaded', function() {

	/**
	 * アプリの表示と切り替え
	 */
	const app = new class {

		/**
		 * 初期化
		 */
		constructor() {
			/**
			 * アプリのパスと名前
			 * @type {object}
			 */
			this.apps = {
				'1': { path: '/signage/', name: '時計サイネージ' },
				'2': { path: '/floating_clock/', name: 'デジタル時計' },
				'3': { path: '/photo_slideshow/', name: 'フォトスライドショー' },
				'4': { path: '/kakijun/', name: '書き順' },
				'9': { path: '/shutdown/', name: '再起動/シャットダウン' }
			};
			/**
			 * デフォルトのアプリ
			 * @type {number}
			 */
			this.defaultAppId = 1;
			/**
			 * アプリ表示に使うiframe要素
			 * @type {HTMLElement}
			 */
			this.iframe = document.getElementById('app_frame');
			/**
			 * アプリ表示モードかどうか
			 * @type {boolean}
			 */
			this.isDisplayMode = this.iframe != null;
			/**
			 * ログ表示に使う要素
			 * @type {HTMLElement}
			 */
			this.log = document.getElementById('log');
		}

		/**
		 * 開始
		 * @param {object} ws - wsオブジェクト
		 */
		start(ws) {
			// アプリ表示モード（display.html）
			if (this.isDisplayMode) {
				this.change();
			// リモコンモード（index.html）
			} else {
				// アプリのリストを作成
				const ul = document.getElementById('app_list');
				const keys = Object.keys(this.apps);
				keys.sort((a, b) => a - b);
				for (let i = 0; keys.length > i; i++) {
					const id = keys[i];
					const li = document.createElement('li');
					li.innerHTML = this.apps[id].name;
					// クリックしたらWebSocketでそのアプリのIDを送信
					li.addEventListener('click', () => {
						ws.send(id);
					});
					ul.appendChild(li);
				}
			}
		}

		/**
		 * アプリの切り替え
		 * @param {number} appId - アプリID
		 */
		change(appId) {
			if (appId == null) appId = this.defaultAppId;
			if (!this.apps[appId]) return;
			this.iframe.src = `${this.apps[appId].path}?v=${Date.now()}`;
		}

		/**
		 * エラー情報の表示
		 * @param {string} msg - 表示するテキスト
		 */
		outputError(msg) {
			if (!this.log) return;
			this.log.innerHTML = msg ? `エラー：接続できません。自宅のWiFiに接続していることを確認して、このページをリロードして下さい。<br>${msg}` : '';
		}
	}();

	/**
	 * WebSocketによる通信
	 */
	const ws = new class {

		/**
		 * 初期化
		 * @param {object} app - appオブジェクト
		 * @param {number} port - WebSocketのポート番号
		 */
		constructor(app, port) {
			/**
			 * appオブジェクト
			 * @type {object}
			 */
			this.app = app;
			/**
			 * グループ番号
			 * @type {number}
			 */
			this.groupId = 1;
			/**
			 * WebSocketのポート番号
			 * @type {number}
			 */
			this.port = port;

			this.connect();
			app.start(this);
			setInterval(() => {
				this.checkConnection();
			}, 5000);
		}

		/**
		 * WebSocketの接続
		 */
		connect() {
			const app = this.app;
			const ws = new WebSocket(`ws://${location.hostname}:${this.port}`);
			let checkTimer;
			// 接続開始時
			ws.addEventListener('open', (e) => {
				// アプリ表示モードの場合は受信登録をする
				if (app.isDisplayMode) {
					ws.send(JSON.stringify({ mode: 'listen', group: this.groupId }));
				}
				// 通信チェック
				checkTimer = setInterval(() => {
					ws.send(JSON.stringify({ mode: 'check' }));
				}, 60000);
				app.outputError();
				this.ws = ws;
			});
			// メッセージ受信時
			ws.addEventListener('message', (e) => {
				// 受信メッセージのパース
				let obj;
				try {
					obj = JSON.parse(e.data);
					if (!obj || !obj.message) return;
				} catch (e) {
					return;
				}
				// アプリ表示モードの場合はアプリを切り替える
				const appId = obj.message;
				app.change(appId);
			});
			// 接続切断時
			ws.addEventListener('close', (e) => {
				clearInterval(checkTimer);
				this.ws = null;
				app.outputError('WebSocket: Connection error occurred.');
			});
		}

		/**
		 * 接続の確認
		 * @param {*} appId 
		 */
		checkConnection() {
			if (this.ws) return;
			this.app.outputError('WebSocket: Trying to reconnect ...');
			this.connect();
		}

		/**
		 * WebSocketによるメッセージ送信（リモコンモード用）
		 * @param {number} appId - アプリID
		 */
		send(appId) {
			if (!this.ws) return;
			this.ws.send(JSON.stringify({ mode: 'send', group: this.groupId, message: appId }));
		}

	}(app, window.webSocketPort);

});
