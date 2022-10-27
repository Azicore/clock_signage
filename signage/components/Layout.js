/**
 * 全体レイアウト
 */
class Layout {

	/**
	 * 初期化
	 */
	constructor() {

		/**
		 * 設定値
		 * @type {object}
		 */
		this.conf = {
			// ※以下は画面幅を16としたときの数値
			marginX     : 0.25, // 横方向のボックス間マージン
			marginY     : 0.25, // 縦方向のボックス間マージン
			boxWidth    : 6.5, // 主ボックスの幅
			boxHeight   : 6.5, // 主ボックスの高さ
			borderRadius: 0.4  // ボックスの角丸半径
		};

		/**
		 * 他パーツのリサイズハンドラ
		 * @type {function[]}
		 */
		this.handlers = [];

		this.resize(1000);
	}

	/**
	 * リサイズによる値変更
	 * @param {number} windowWidth - 画面幅
	 * @param {number} windowHeight - 画面高さ
	 */
	resize(windowWidth, windowHeight) {

		// 画面幅を16とする基準値
		const w = windowWidth / 16;
		// 画面高さも与えられた場合は、それを9とする基準値を使う
		const h = windowHeight ? windowHeight / 9 : w;
		// 設定値
		const c = this.conf;

		/**
		 * 1つ目の主ボックスの横位置
		 * @type {number}
		 */
		this.x1 = w * c.marginX;
		/**
		 * 1つ目の主ボックスの縦位置
		 * @type {number}
		 */
		this.y1 = h * c.marginY;
		/**
		 * 主ボックスの幅
		 * @type {number}
		 */
		this.w1 = w * c.boxWidth;
		/**
		 * 主ボックスの高さ
		 * @type {number}
		 */
		this.h1 = h * c.boxHeight;
		/**
		 * 2つ目の主ボックスの横位置
		 * @type {number}
		 */
		this.x2 = this.x1 * 2 + this.w1;
		/**
		 * 右ボックスの横位置
		 * @type {number}
		 */
		this.x3 = this.x1 * 3 + this.w1 * 2;
		/**
		 * 右ボックスの幅
		 * @type {number}
		 */
		this.w3 = windowWidth - this.x1 - this.x3;
		/**
		 * 下ボックスの縦位置
		 * @type {number}
		 */
		this.y2 = this.y1 * 2 + this.h1;
		/**
		 * 下ボックスの幅
		 * @type {number}
		 */
		this.w2 = windowWidth - this.x1 * 2;
		/**
		 * 下ボックスの高さ
		 * @type {number}
		 */
		this.h2 = h * 9 - this.y1 - this.y2;
		/**
		 * 角丸半径
		 * @type {number}
		 */
		this.br = w * c.borderRadius;

		// リサイズハンドラの実行
		for (const f of this.handlers) {
			f(this);
		}
	}

	/**
	 * リサイズハンドラの登録
	 * @param {function} func - リサイズハンドラ
	 */
	registerResizeHandler(func) {
		this.handlers.push(func);
	}

}
