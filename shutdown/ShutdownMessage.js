import ShutdownStatus from './ShutdownStatus.js';

/**
 * シャットダウンの手順でメッセージを表示するためのクラス
 */
export default class ShutdownMessage {

	/**
	 * 初期化
	 * @param {object} config - 下記プロパティを含む設定オブジェクト
	 * @param {number} config.confirmDelay - 最初の選択画面での猶予時間（秒）
	 * @param {number} config.confirmRestartDelay - 再起動の選択画面での猶予時間（秒）
	 * @param {number} config.confirmShutdownDelay - シャットダウンの選択画面での猶予時間（秒）
	 * @param {number} config.restartDelay - 再起動実行までの猶予時間（秒）
	 * @param {number} config.shutdownDelay - シャットダウン実行までの猶予時間（秒）
	 */
	constructor(config) {
		/**
		 * 設定
		 * @type {object}
		 */
		this.config = config;
		/**
		 * ShutdownStatusオブジェクト
		 * @type {ShutdownStatus}
		 */
		this.status = new ShutdownStatus();
		const steps = this.status.steps;
		// ##FONT_SCOPE_START##
		/**
		 * デフォルトのYesボタンのテキスト
		 * @type {string}
		 */
		this.defaultYesText = 'リモコンでもう一度<br>「再起動/シャットダウン」<br>を選択して下さい。';
		/**
		 * デフォルトのNoボタンのテキスト
		 * @type {string}
		 */
		this.defaultNoText = '何もせずにお待ち下さい。';
		/**
		 * 画面ごとのメッセージとボタンのテキスト
		 * @type {object}
		 */
		this.messages = {
			// 最初の選択画面
			[steps.CONFIRM]: {
				text: '本当に再起動またはシャットダウンしますか？',
				yes: 'はい',
				no: 'いいえ'
			},
			// 再起動の選択画面
			[steps.CONFIRM_RESTART]: {
				text: '再起動しますか？',
				yes: '再起動する',
				no: 'シャットダウン<br>またはキャンセル'
			},
			// シャットダウンの選択画面
			[steps.CONFIRM_SHUTDOWN]: {
				text: 'シャットダウンしますか？',
				yes: 'シャットダウンする',
				no: 'キャンセル'
			},
			// 再起動の実行
			[steps.RESTART]: {
				text: '再起動します。',
				yes: 'キャンセルする',
				no: '続行',
				noText: '自動的に再び画面が表示<br>されるまでお待ち下さい。'
			},
			// シャットダウンの実行
			[steps.SHUTDOWN]: {
				text: 'シャットダウンします。',
				yes: 'キャンセルする',
				no: '続行',
				noText: '画面が完全に消えてから<br>30秒経過後にコンセントを<br>抜いて下さい。'
			},
			// 中止画面
			[steps.CANCELED]: {
				text: 'キャンセルされました。',
				yes: '最初からやり直す',
				no: 'やめる',
				noText: 'リモコンで他のアプリを<br>選択して下さい。'
			}
		};
		const loadingText = '処理中です…';
		const titleText = '再起動/シャットダウン';
		// ##FONT_SCOPE_END##
		/**
		 * メッセージを表示する要素
		 * @type {HTMLElement}
		 */
		this.elText = document.getElementById('text');
		/**
		 * Yesボタンの要素
		 * @type {HTMLElement}
		 */
		this.elYes = document.getElementById('yes');
		/**
		 * Noボタンの要素
		 * @type {HTMLElement}
		 */
		this.elNo = document.getElementById('no');
		/**
		 * Yesボタンのテキストを表示する要素
		 * @type {HTMLElement}
		 */
		this.elYesText = document.getElementById('yes_text');
		/**
		 * Noボタンのテキストを表示する要素
		 * @type {HTMLElement}
		 */
		this.elNoText = document.getElementById('no_text');
		/**
		 * タイマーの要素
		 * @type {HTMLElement}
		 */
		this.elTimer = document.getElementById('timer');
		/**
		 * タイマーの秒数を表示する要素
		 * @type {HTMLElement}
		 */
		this.elTimerNum = document.getElementById('timer_num');
		/**
		 * body要素
		 * @type {HTMLElement}
		 */
		this.body = document.body;
		// 読み込み中メッセージ
		this.elText.innerHTML = loadingText;
		this.body.classList.add('loading');
		document.getElementById('title').innerText = titleText;
		// 画面を選択
		setTimeout(() => {
			this._selectMessage();
		}, 500);
	}

	/**
	 * 直前の状態に応じて次のメッセージを選択する
	 */
	_selectMessage() {
		const status = this.status;
		const steps = status.steps;
		const config = this.config
		// この画面が表示された時刻を記録
		status.updateTimestamp();
		// 以下に当てはまらない場合は「(5)中止画面」とする
		let step = steps.CANCELED;
		// 直前が「(0)最初の画面」の場合
		if (status.step == steps.CONFIRM) {
			// confirmDelay経過前の場合は「(1)再起動の選択画面」へ進む
			if (config.confirmDelay >= status.elapsed) {
				step = steps.CONFIRM_RESTART;
				this._enableReload(config.confirmRestartDelay);
			}
		// 直前が「(1)再起動の選択画面」の場合
		} else if (status.step == steps.CONFIRM_RESTART) {
			// confirmRestartDelay経過前の場合は「(3)再起動の実行画面」へ進む
			if (config.confirmRestartDelay >= status.elapsed) {
				step = steps.RESTART;
				this._enableShutdown(config.restartDelay, true);
			// confirmRestartDelay経過直後の場合は「(2)シャットダウンの選択画面」へ進む
			} else if (config.confirmRestartDelay + 1 >= status.elapsed) {
				step = steps.CONFIRM_SHUTDOWN;
				this._enableReload(config.confirmShutdownDelay);
			}
		// 直前が「(2)シャットダウンの選択画面」の場合
		} else if (status.step == steps.CONFIRM_SHUTDOWN) {
			// confirmShutdownDelay経過前の場合は「(4)シャットダウンの実行画面」へ進む
			if (config.confirmShutdownDelay >= status.elapsed) {
				step = steps.SHUTDOWN;
				this._enableShutdown(config.shutdownDelay, false);
			}
		// 直前が「(5)中止画面」の場合
		} else if (status.step == steps.CANCELED) {
			// 「(0)最初の画面」を表示する
			step = steps.CONFIRM;
			this._enableReload(config.confirmDelay);
		}
		// 選択された画面を記録
		status.updateStep(step);
		// 文言を表示
		const msg = this.messages[step];
		this.elText.innerHTML = msg.text;
		this.elYes.innerHTML = msg.yes || '';
		this.elNo.innerHTML = msg.no || '';
		this.elYesText.innerHTML = msg.yesText || (msg.yes ? this.defaultYesText : '');
		this.elNoText.innerHTML = msg.noText || (msg.no ? this.defaultNoText : '');
		this.body.classList.remove('loading');
	}

	/**
	 * 指定秒数後の自動リロードを設定する
	 * @param {number} delay - 自動でリロードするまでの秒数
	 */
	_enableReload(delay) {
		setTimeout(() => {
			location.reload();
		}, delay * 1000 + 10);
		this._startTimer(delay);
	}

	/**
	 * 指定秒数後の自動再起動（またはシャットダウン）を設定する
	 * @param {number} delay - 自動で再起動（またはシャットダウン）を実行するまでの秒数
	 * @param {boolean} isRestart - tureなら再起動、falseならシャットダウン
	 */
	_enableShutdown(delay, isRestart) {
		setTimeout(() => {
			// ./shutdown.shをリクエストすると即座に再起動（またはシャットダウン）を実行する
			const param = [isRestart ? 'restart' : 'shutdown'];
			const xhr = new XMLHttpRequest();
			xhr.open('post', './shutdown.sh');
			xhr.setRequestHeader('X-Command-Exec', 'yes');
			xhr.setRequestHeader('Content-Type', 'application/json');
			xhr.responseType = 'json';
			xhr.onload = function() { };
			xhr.send(JSON.stringify({ params: param }));
		}, delay * 1000);
		this._startTimer(delay);
	}

	/**
	 * タイマーのアニメーションを開始する
	 * @param {number} delay - タイマーの秒数
	 */
	_startTimer(delay) {
		let start = null;
		let sec = delay;
		this.elTimerNum.innerHTML = sec;
		delay *= 1000;
		const progress = (ts) => {
			if (start == null) start = ts;
			let rest = delay - ts + start;
			let deg = rest * 360 / delay;
			if (0 > deg) deg = 0;
			this.elTimer.style.background = `conic-gradient(var(--timer-color) 0deg, var(--timer-color) ${deg}deg, var(--page-bgcolor) ${deg}deg)`;
			rest = Math.ceil(rest / 1000);
			if (sec != rest) {
				sec = rest;
				this.elTimerNum.innerHTML = sec;
			}
			if (deg > 0) requestAnimationFrame(progress);
		};
		requestAnimationFrame(progress);
	}

}
