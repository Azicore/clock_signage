/**
 * メッセージ
 */
class Message {

	/**
	 * 初期化
	 * @param {Layout} layout - レイアウト情報（{@link Layout}オブジェクト）
	 * @param {object} messages - メッセージ定義（config/messages.js が window.Messages に定義したオブジェクト）
	 * @param {Array[]} holidays - 祝日情報（config/holidays.js が window.Holidays に定義した配列）
	 * @param {object} config - 設定情報
	 */
	constructor(layout, messages, holidays, config) {
		/**
		 * メッセージの定義
		 * @type {object[]}
		 */
		this.messages = messages.definitions;
		/**
		 * 祝日情報
		 * @type {Array[]}
		 */
		this.holidays = holidays;
		/**
		 * メッセージの更新間隔
		 * @type {number}
		 */
		this.updateInterval = config.updateInterval;
		/**
		 * サーバーメッセージのJSONのURL
		 * @type {string}
		 */
		this.serverMessageUrl = config.serverMessageUrl;
		/**
		 * サーバーメッセージ確認のタイミング
		 * @type {RegExp}
		 */
		this.serverCheckTiming = config.serverCheckTiming;
		/**
		 * サーバーから取得してきたメッセージ
		 * @type {object}
		 */
		this.serverMessages = null;

		/**
		 * ブロック要素
		 * @type {HTMLElement}
		 */
		this.elem = document.createElement('div');
		/**
		 * 画像
		 * @type {HTMLElement}
		 */
		this.imageBlock = document.createElement('div');
		/**
		 * 吹き出しの先端
		 * @type {HTMLElement}
		 */
		this.tipBlock = document.createElement('div');
		/**
		 * 吹き出しの先端の上半分
		 * @type {HTMLElement}
		 */
		this.tipUpper = document.createElement('div');
		/**
		 * 吹き出しの先端の下半分
		 * @type {HTMLElement}
		 */
		this.tipLower = document.createElement('div');
		/**
		 * 吹き出しの枠
		 * @type {HTMLElement}
		 */
		this.messageBlock = document.createElement('div');
		/**
		 * メッセージ
		 * @type {HTMLElement}
		 */
		this.messageBox = document.createElement('div');
		/**
		 * CSS変数設定用の要素
		 * @type {HTMLElement}
		 */
		this.root = document.querySelector(':root');

		this.elem.id = 'message';
		document.body.appendChild(this.elem);
		this.tipBlock.appendChild(this.tipUpper);
		this.tipBlock.appendChild(this.tipLower);
		this.messageBlock.appendChild(this.messageBox);
		this.elem.appendChild(this.messageBlock);
		this.elem.appendChild(this.tipBlock);
		this.elem.appendChild(this.imageBlock);

		// CSSの設定
		this._setStyle(this.elem, {
			left        : 'var(--message-left)',
			top         : 'var(--message-top)',
			width       : 'var(--message-width)',
			height      : 'var(--message-height)',
			borderRadius: 'var(--message-radius)',
			background  : '#ffffff',
			overflow    : 'hidden',
			fontFamily  : 'subsetfont'
		});
		this._setStyle(this.imageBlock, {
			left  : '0px',
			top   : '0px',
			width : 'var(--message-img-width)',
			height: 'var(--message-img-height)'
		});
		this._setStyle(this.tipBlock, {
			left      : 'var(--message-tip-left)',
			top       : 'var(--message-tip-top)',
			background: '#fffff0',
			position  : 'absolute'
		});
		this._setStyle(this.tipUpper, {
			width                  : 'var(--message-tip-radius)',
			height                 : 'var(--message-tip-radius)',
			borderRight            : 'var(--message-tip-border)',
			borderBottom           : 'var(--message-tip-border)',
			borderBottomRightRadius: 'var(--message-tip-radius)',
			boxSizing              : 'border-box'
		});
		this._setStyle(this.tipLower, {
			width                  : 'var(--message-tip-radius)',
			height                 : 'var(--message-tip-radius)',
			marginTop              : 'var(--message-tip-margin)',
			borderTop              : 'var(--message-tip-border)',
			borderRight            : 'var(--message-tip-border)',
			borderTopRightRadius   : 'var(--message-tip-radius)',
			boxSizing              : 'border-box'
		});
		this._setStyle(this.messageBlock, {
			left        : 'var(--message-msg-left)',
			top         : 'var(--message-msg-top)',
			height      : 'var(--message-msg-height)',
			border      : 'var(--message-msg-border)',
			background  : '#fffff0',
			borderRadius: 'var(--message-tip-radius)',
			boxSizing   : 'border-box',
			position    : 'absolute'
		});
		this._setStyle(this.messageBox, {
			fontSize  : 'var(--message-msg-fontsize)',
			lineHeight: 'var(--message-msg-line)',
			margin    : 'var(--message-msg-margin)'
		});

		// リサイズハンドラの登録
		layout.registerResizeHandler((layout) => {
			this.resize(layout);
		});

		this.update();
	}

	/**
	 * リサイズハンドラ
	 * @param {Layout} layout - レイアウト情報（{@link Layout}オブジェクト）
	 */
	resize(layout) {
		const h = layout.h2 / 100; // 設定値の基準となる値
		const c = {
			imageBlockWidth : 0 | h * 100, // 画像表示エリアの幅
			imageSize       : 0 | h * 85,  // 画像自体の幅
			tipBoxPosition  : 0 | h * 100, // 吹き出し左端の位置
			tipRadius       : 0 | h * 15,  // 吹き出しの角丸半径
			boxBorderSize   : 0 | h * 2,   // 吹き出しの枠線
			boxHeight       : 0 | h * 70,  // 吹き出しの高さ
			boxFontSize     : 0 | h * 20,  // 吹き出しのフォントサイズ
			boxMargin       : 0 | h * 15   // 吹き出し内の左右パディング
		};
		// CSSの可変値を変更
		this._setRootStyle({
			messageLeft         : `${layout.x1}px`,
			messageTop          : `${layout.y2}px`,
			messageWidth        : `${layout.w2}px`,
			messageHeight       : `${layout.h2}px`,
			messageRadius       : `${layout.br}px`,
			messageImgWidth     : `${c.imageBlockWidth}px`,
			messageImgHeight    : `${layout.h2}px`,
			messageImgSize      : `${c.imageSize}px`,
			messageImgMarginLeft: `${(c.imageBlockWidth - c.imageSize) * 0.5}px`,
			messageImgMarginTop : `${(layout.h2 - c.imageSize) * 0.5}px`,
			messageTipLeft      : `${c.tipBoxPosition}px`,
			messageTipTop       : `${(layout.h2 - c.tipRadius * 2 + c.boxBorderSize) * 0.5}px`,
			messageTipBorder    : `${c.boxBorderSize}px solid #000000`,
			messageTipRadius    : `${c.tipRadius}px`,
			messageTipMargin    : `-${c.boxBorderSize}px`,
			messageMsgLeft      : `${c.tipBoxPosition + c.tipRadius - c.boxBorderSize + 0}px`,
			messageMsgTop       : `${(layout.h2 - c.boxHeight) * 0.5}px`,
			messageMsgHeight    : `${c.boxHeight}px`,
			messageMsgBorder    : `${c.boxBorderSize}px solid #000000`,
			messageMsgFontsize  : `${c.boxFontSize}px`,
			messageMsgLine      : `${c.boxHeight - c.boxBorderSize * 2}px`,
			messageMsgMargin    : `0px ${c.boxMargin}px 0px`
		});
	}

	/**
	 * CSSを設定
	 * @param {HTMLElement} elems - 対象の要素
	 * @param {object} css - CSSの値
	 */
	_setStyle(elem, css) {
		for (const i in css) {
			elem.style[i] = css[i];
		}
	}

	/**
	 * CSS変数を変更
	 * @param {object} css - CSS変数の値
	 */
	_setRootStyle(css) {
		for (const i in css) {
			const p = '--' + i.replace(/([A-Z])/g, (str, s1) => `-${s1.toLowerCase()}`);
			this.root.style.setProperty(p, css[i]);
		}
	}

	/**
	 * メッセージの選択
	 * @param {Array[]} cand - 選択肢（[選択率, 値]の配列。選択率Nは選択率1に対して1/Nの確率で選ばれる）
	 * @return {object} 選択された値（任意のオブジェクト）
	 */
	_select(cand) {
		const p = [];
		for (let i = 0; cand.length > i; i++) {
			const a = i == 0 ? 0 : p[i - 1];
			p[i] = 1 / cand[i][0] + a;
		}
		const s = Math.random() * p[p.length - 1];
		for (let i = 0; cand.length > i; i++) {
			if (p[i] > s) {
				return cand[i][1];
			}
		}
	}

	/**
	 * 任意のサーバー上のメッセージを取得
	 */
	_getServerMessage() {
		if (!this.serverMessageUrl) return;
		const xhr = new XMLHttpRequest();
		xhr.open('get', `${this.serverMessageUrl}?t=${Date.now()}`);
		xhr.responseType = 'json';
		xhr.onload = () => {
			if (xhr.response.messages) {
				this.serverMessages = {};
				for (const msg of xhr.response.messages) {
					const t = msg.time.split(/\D/);
					const key = `${t[1]}${t[2]}${t[3]}${t[4]}00`; // MMDDhhmmss
					this.serverMessages[key] = msg.text;
				}
			}
		};
		xhr.send();
	}

	/**
	 * メッセージの変更
	 */
	update() {
		// メッセージ選択のための条件パラメーター
		const now = new Date();
		const updateInterval = this.updateInterval;
		const params = {
			year : now.getFullYear(),  // 年（4桁）
			mon  : now.getMonth() + 1, // 月（1～12）
			date : now.getDate(),      // 日（1～31）
			dow  : now.getDay(),       // 曜日（0～6）
			hour : now.getHours(),     // 時（0～23）
			min  : now.getMinutes(),   // 分（0～59）
			sec  : Math.floor(now.getSeconds() / updateInterval) * updateInterval, // 秒（0、15、30、45）
			utime: now.getTime()       // Unix Time
		};
		params.ampm = 12 > params.hour ? 0 : 1; // 午前・午後（0、1）
		params.dateStr = `${params.mon * 100 + params.date}`.padStart(4, '0'); // 日付文字列（"MMDD"）
		params.timeStr = `${params.hour * 10000 + params.min * 100 + params.sec}`.padStart(6, '0'); // 時刻文字列（"hhmmss"）
		params.holidays = this.holidays; // 祝日情報
		params.serverMessages = this.serverMessages || {}; // サーバーメッセージ
		// メッセージ表示条件の確認
		const msgCand = {};
		let maxPriority = -1;
		for (const msg of this.messages) {
			let c = msg.cond(params);
			if (typeof c != 'object') c = { condition: c };
			// cond()の戻り値が0の場合は、表示しない
			if (c.condition == 0) continue;
			// 表示条件に合致するものの中から優先度が最も高いものを選ぶ
			const priority = c.condition > 0 ? c.condition : 0;
			if (priority >= maxPriority) {
				if (priority > maxPriority) {
					maxPriority = priority;
					msgCand[priority] = [];
				}
				// cond()の戻り値が負の場合は、優先度を最低とし、絶対値を選択率（大きいほど選ばれにくい）にする
				const ratio = c.condition > 0 ? 1 : -c.condition;
				msgCand[priority].push([ratio, [msg, c.values]]);
			}
		}
		// 優先度が最も高い候補の中から、選択率に応じてランダムに選ぶ
		const [msg, values] = this._select(msgCand[maxPriority]);
		const messageText = msg.text(params, this._select, values);
		
		// 現在の画像とメッセージを非表示にする
		this.imageBlock.innerHTML = '';
		this.tipBlock.style.display = 'none';
		this.messageBlock.style.display = 'none';
		setTimeout(() => {
			// 画像を再生成
			this.imageBlock.innerHTML = `<img src="message_icons/${msg.icon(params, this._select, values)}">`;
			const img = this.imageBlock.firstElementChild;
			img.style.width      = 'var(--message-img-size)';
			img.style.height     = 'var(--message-img-size)';
			img.style.marginLeft = 'var(--message-img-margin-left)';
			img.style.marginTop  = 'calc(var(--message-img-height) + var(--message-img-margin-top))';
			img.style.transition = 'margin-top 1s ease-out';
			// 画像が下から出てくるアニメーションを発動（margin-topのtransition）
			setTimeout(() => {
				img.style.marginTop  = 'var(--message-img-margin-top)';
			}, 0);
			// 吹き出しとメッセージの表示
			setTimeout(() => {
				this.messageBox.innerHTML = messageText;
				this.tipBlock.style.display = 'block';
				this.messageBlock.style.display = 'block';
			}, 1000);
		}, 500);

		// 音を鳴らす（※ブラウザで自動再生を許可しておく必要あり）
		if (msg.sound) {
			const soundFile = msg.sound(params, this._select, values);
			if (soundFile) {
				new Audio(`message_sounds/${soundFile}`).play();
			}
		}
		
		// 15分ごとにサーバーメッセージを確認
		if (this.serverMessageUrl) {
			const isServerCheckTiming = this.serverCheckTiming.test(params.timeStr);
			if (!this.serverMessages || isServerCheckTiming) this._getServerMessage();
		}

		// 一定間隔でメッセージを変更
		setTimeout(() => {
			this.update();
		}, updateInterval * 1000);
	}

}
