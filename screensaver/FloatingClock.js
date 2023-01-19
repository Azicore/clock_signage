import RoutedLine from './RoutedLine.js';

/**
 * デジタル時計のスクリーンセーバー
 */
export default class FloatingClock {

	/**
	 * 初期化
	 * @param {object} config - 下記プロパティを含む設定オブジェクト
	 * @param {number} config.charWidth - 1文字の幅（線の太さを含む）
	 * @param {number} config.charHeight - 1文字の高さ（線の太さを含む）
	 * @param {number} config.lineWidth - 線の太さ
	 * @param {number} config.charMargin - 文字と文字の間隔
	 * @param {number} config.colonPosition - コロンの点の位置（他の文字の上端からの距離）
	 * @param {number} config.scale - 全体の拡大縮小
	 * @param {string} config.backgroundColor - 背景色
	 * @param {string} config.clockColor - 文字色
	 * @param {boolean} config.roundedLine - trueにすると丸みを帯びた線分にする
	 * @param {number} config.easePower - アニメーションのイージングの指数
	 * @param {number} config.moveSpeed - 移動速度（ピクセル毎秒）
	 */
	constructor(config) {
		// 拡大縮小
		const scale = config.scale;

		/**
		 * 1文字の幅
		 * @type {number}
		 */
		this.CHAR_WIDTH     = scale * config.charWidth;
		/**
		 * 1文字の高さ
		 * @type {number}
		 */
		this.CHAR_HEIGHT    = scale * config.charHeight;
		/**
		 * 線の太さ
		 * @type {number}
		 */
		this.LINE_WIDTH     = scale * config.lineWidth;
		/**
		 * 文字と文字の間隔
		 * @type {number}
		 */
		this.CHAR_MARGIN    = scale * config.charMargin;
		/**
		 * コロンの点の位置
		 * @type {number}
		 */
		this.COLON_POSITION = scale * config.colonPosition;
		/**
		 * 丸みを帯びた線分
		 * @type {boolean}
		 */
		this.ROUNDED_LINE   = config.roundedLine;
		/**
		 * イージングの指数
		 * @type {number}
		 */
		this.EASE_POWER     = config.easePower;
		/**
		 * 移動速度
		 * @type {number}
		 */
		this.MOVE_SPEED     = config.moveSpeed;
		/**
		 * 文字色
		 * @type {string}
		 */
		this.COLOR          = config.clockColor;

		// RoutedLineオブジェクトに渡す設定値
		const lineConfig = {
			hsize: (this.CHAR_WIDTH - this.LINE_WIDTH) * 0.5,
			vsize: (this.CHAR_HEIGHT - this.LINE_WIDTH) * 0.5
		};
		// 変形アニメーションの設定に基づいてRoutedLineオブジェクトを生成
		const f = a => a.map(c => new RoutedLine(...c, lineConfig));

		/**
		 * 変形アニメーションの設定
		 * @type {object}
		 */
		this.lines = {
			'0->1': f([
				['GABH', [0, 2], [1, 3]],
				['BCIG', [0, 3], [2, 3]]
			]),
			'1->2': f([
				['ABCFE', [0, 1], [0, 4]],
				['IGDE',  [0, 1], [0, 3]],
				['EB',    [0, 1], [1, 1]],
				['EH',    [0, 1], [1, 1]]
			]),
			'2->3': f([
				['ACFD', [0, 3], [0, 3]],
				['DGIF', [0, 2], [1, 3]]
			]),
			'3->4': f([
				['GICAD', [0, 3], [3, 4]],
				['DEB',   [0, 1], [0, 2]],
				['FEH',   [0, 1], [0, 2]]
			]),
			'4->5': f([
				['EDAC', [0, 2], [0, 3]],
				['EFIG', [0, 1], [0, 3]],
				['EB',   [0, 1], [1, 1]],
				['EH',   [0, 1], [1, 1]]
			]),
			'5->6': f([
				['CADFIGD', [0, 5], [1, 6]]
			]),
			'6->7': f([
				['FDA',    [0, 2], [1, 2]],
				['DGIFCA', [0, 3], [2, 5]]
			]),
			'7->8': f([
				['CADF', [0, 2], [0, 3]],
				['CIGD', [0, 1], [0, 3]]
			]),
			'8->9': f([
				['DGICADF', [0, 6], [2, 6]]
			]),
			'9->0': f([
				['ICAD', [0, 3], [0, 3]],
				['FDGI', [0, 1], [1, 3]]
			]),
			'5->0': f([ // 5→0のアニメーション（59→00の時に必要）
				['CAD', [0, 2], [0, 2]],
				['GIF', [0, 2], [0, 2]],
				['EDG', [0, 1], [1, 2]],
				['EFC', [0, 1], [1, 2]]
			]),
			'2->0': f([ // 2→0のアニメーション（23→00の時に必要）
				['FCA', [0, 2], [0, 2]],
				['DGI', [0, 2], [0, 2]],
				['EDA', [0, 1], [1, 2]],
				['EFI', [0, 1], [1, 2]]
			]),
			'3->0': f([ // 3→0のアニメーション（23→00の時に必要）
				['DFCAD', [0, 3], [1, 4]],
				['FIGD',  [0, 2], [0, 3]]
			])
		};
		/**
		 * タイムゾーン
		 * @type {number}
		 */
		this.timezone = new Date().getTimezoneOffset() * 60;

		// 背景色を設定
		document.body.style.background = config.backgroundColor;
	}

	/**
	 * 画面リサイズと初期化
	 * @param {number} width - 画面の幅
	 * @param {number} height - 画面の高さ
	 */
	resize(width, height) {
		/**
		 * Canvas要素
		 * @type {HTMLElement}
		 */
		this.canv = this.canv;
		/**
		 * 画面の幅
		 * @type {number}
		 */
		this.width = width;
		/**
		 * 画面の高さ
		 * @type {number}
		 */
		this.height = height;
		/**
		 * 移動可能な領域の幅
		 * @type {number}
		 */
		this.movableWidth = width - this.CHAR_WIDTH * 6 - this.CHAR_MARGIN * 7 - this.LINE_WIDTH * 2;
		/**
		 * 移動可能な領域の高さ
		 * @type {number}
		 */
		this.movableHeight = height - this.CHAR_HEIGHT;

		// 初回はCanvas要素を生成
		if (!this.canv) {
			this.canv = document.createElement('canvas');
			document.body.appendChild(this.canv);
		}
		// Canvasのサイズを変更
		this.canv.width = width;
		this.canv.height = height;
		// Canvasコンテキストを更新
		const ctx = this.canv.getContext('2d');
		ctx.lineWidth = this.LINE_WIDTH;
		if (this.ROUNDED_LINE) {
			ctx.lineCap = 'round';
			ctx.lineJoin = 'round';
		} else {
			ctx.lineCap = 'square';
		}
		ctx.strokeStyle = this.COLOR;

		/**
		 * Canvasコンテキスト
		 * @type {CanvasRenderingContext2D}
		 */
		this.ctx = ctx;
	}

	/**
	 * 時刻情報を返す
	 * @return {object} 下記のプロパティを含むオブジェクト
	 * @property {string} t1 「hhmmss」の文字列で表した現在時刻
	 * @property {string} t2 t1の1秒後の時刻
	 * @property {number} ms 秒の端数（0～1）
	 * @property {number} d 前回のコールからの経過ミリ秒
	 */
	_getTime() {
		const ts = Date.now();
		let u1 = Math.floor(ts / 1000) - this.timezone;
		let u2 = u1 + 1;
		// 高速化のため、UnixTimeから直接時分秒を計算
		const s1 = u1 % 60; u1 = Math.floor(u1 / 60);
		const m1 = u1 % 60; u1 = Math.floor(u1 / 60);
		const h1 = u1 % 24;
		const s2 = u2 % 60; u2 = Math.floor(u2 / 60);
		const m2 = u2 % 60; u2 = Math.floor(u2 / 60);
		const h2 = u2 % 24;
		const d = this.timestamp == null ? null : ts - this.timestamp;
		/**
		 * 最後に_getTime()をコールした時刻
		 * @type {?number}
		 */
		this.timestamp = ts;
		return {
			t1: `${String(h1).padStart(2, '0')}${String(m1).padStart(2, '0')}${String(s1).padStart(2, '0')}`,
			t2: `${String(h2).padStart(2, '0')}${String(m2).padStart(2, '0')}${String(s2).padStart(2, '0')}`,
			ms: ts % 1000 / 1000,
			d: d
		};
	}

	/**
	 * イージング効果をかける
	 * @param {number} t - 0～1の数値
	 * @return {number} イージングした数値（0～1）
	 */
	_makeEase(t) {
		const w = this.EASE_POWER;
		return 0.5 > t ? Math.pow(2 * t, w) * 0.5 : 1 - Math.pow(2 * (1 - t) , w) * 0.5;
	}

	/**
	 * 線分を描画する
	 * @param {object[]} points - {@link RoutedLine}オブジェクトのgetPoints()が返す点情報の配列
	 * @param {object} base - 描画の原点となる座標
	 * @param {number} base.x - 描画の原点となるx座標
	 * @param {number} base.y - 描画の原点となるy座標
	 */
	_drawLine(points, base) {
		const ctx = this.ctx;
		ctx.beginPath();
		ctx.moveTo(points[0].x + base.x, points[0].y + base.y);
		for (let i = 1; points.length > i; i++) {
			ctx.lineTo(points[i].x + base.x, points[i].y + base.y);
		}
		ctx.stroke();
	}

	/**
	 * コロンを描画する
	 * @param {object} base - 描画の原点となる座標
	 * @param {number} base.x - 描画の原点となるx座標
	 * @param {number} base.y - 描画の原点となるy座標
	 */
	_drawColon(base) {
		const ctx = this.ctx;
		const h = this.CHAR_HEIGHT - this.LINE_WIDTH;
		const m = this.COLON_POSITION;
		ctx.beginPath();
		ctx.moveTo(base.x, m + base.y);
		ctx.lineTo(base.x, m + base.y + 0.1);
		ctx.moveTo(base.x, h - m + base.y - 0.1);
		ctx.lineTo(base.x, h - m + base.y);
		ctx.stroke();
	}

	/**
	 * 描画位置を移動する
	 * @param {number} d - 直前の描画からの経過ミリ秒数
	 */
	_movePosition(d) {
		// 最初はランダムに位置と方向を決定
		if (d == null) {
			/**
			 * 描画位置のx座標
			 * @type {number}
			 */
			this.x = Math.floor(Math.random() * this.movableWidth);
			/**
			 * 描画位置のy座標
			 * @type {number}
			 */
			this.y = Math.floor(Math.random() * this.movableHeight);
			/**
			 * x方向の進行方向（1または-1）
			 * @type {number}
			 */
			this.dirX = Math.floor(Math.random() * 2) * 2 - 1;
			/**
			 * y方向の進行方向（1または-1）
			 */
			this.dirY = Math.floor(Math.random() * 2) * 2 - 1;
			return;
		}
		// 経過時間に基づく移動距離
		const a = d / 1000 * this.MOVE_SPEED;
		this.x += a * this.dirX;
		this.y += a * this.dirY;
		// 左の壁での反射
		if (0 > this.x) {
			this.dirX *= -1;
			this.x *= -1;
		}
		// 右の壁での反射
		if (this.x >= this.movableWidth) {
			this.dirX *= -1;
			this.x = this.movableWidth * 2 - this.x;
		}
		// 上の壁での反射
		if (0 > this.y) {
			this.dirY *= -1;
			this.y *= -1;
		}
		// 下の壁での反射
		if (this.y >= this.movableHeight) {
			this.dirY *= -1;
			this.y = this.movableHeight * 2 - this.y;
		}
	}

	/**
	 * デジタル時計を描画する
	 * @param {?object} debug - デバッグ用。
	 */
	draw(debug) {
		const ctx = this.ctx;
		// 全体を消去
		ctx.clearRect(0, 0, this.width, this.height);
		// 時刻情報を取得
		const { t1, t2, ms, d } = debug || this._getTime();
		// 描画位置を移動
		this._movePosition(d);
		// イージング効果を設定
		const r = this._makeEase(ms);

		const s = this.LINE_WIDTH;
		const wa = this.CHAR_WIDTH + this.CHAR_MARGIN;
		const wb = this.CHAR_WIDTH * 2 + this.CHAR_MARGIN * 3 + s;
		// 数字を描画
		for (let i = 0; t1.length > i; i++) {
			let key, ratio;
			// 次の時刻との間で変化の無い文字
			if (t1[i] == t2[i]) {
				key = `${t1[i]}->${(+t1[i] + 1) % 10}`;
				ratio = 0;
			// 次の時刻との間で変化する文字
			} else {
				key = `${t1[i]}->${t2[i]}`;
				ratio = r;
			}
			// 変形アニメーションの設定を取得
			const lines = this.lines[key];
			// 数字の描画位置
			const offsetX = s * 0.5 + (i >> 1) * wb + (i % 2) * wa;
			const offsetY = s * 0.5;
			const pos = { x: offsetX + this.x, y: offsetY + this.y };
			// RoutedLineオブジェクトから変形途中の線分の座標を取得して描画
			for (let j = 0; lines.length > j; j++) {
				this._drawLine(lines[j].getPoints(ratio), pos);
			}
			// コロンの描画
			if (i == 1 || i == 3) {
				pos.x += wa;
				this._drawColon(pos);
			}
		}
	}

}
