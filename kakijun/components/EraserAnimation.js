/**
 * 消去のアニメーションを行なうクラス
 */
export default class EraserAnimation {

	/**
	 * 初期化
	 * @param {CanvasRenderingContext2D} ctx - Canvasコンテキスト
	 * @param {object} position - 下記プロパティを含む設定オブジェクト
	 * @param {number} position.x - Canvas上の描画位置のx座標
	 * @param {number} position.y - Canvas上の描画位置のy座標
	 * @param {number} position.size - 描画した文字のサイズ
	 * @param {number} position.length - 描画した文字数
	 * @param {object} config - 下記プロパティを含む設定オブジェクト
	 * @param {number} [config.speed=5] - 描画スピード（1秒間に消去する文字数）
	 */
	constructor(ctx, position, config) {
		/**
		 * Canvasコンテキスト
		 * @type {CanvasRenderingContext2D}
		 */
		this.ctx = ctx;
		/**
		 * 描画位置のx座標
		 * @type {number}
		 */
		this.x = position.x;
		/**
		 * 描画位置のy座標
		 * @type {number}
		 */
		this.y = position.y;
		/**
		 * 描画した文字のサイズ
		 * @type {number}
		 */
		this.charSize = position.size;
		/**
		 * 描画した文字数
		 * @type {number}
		 */
		this.charLength = position.length;
		/**
		 * 描画スピード
		 * @type {number}
		 */
		this.speed = config.speed || 5;
		/**
		 * 描画終了位置のクロック数
		 * @type {number}
		 */
		this.eraseEnd = this.charLength * 4 + 1;
		/**
		 * 直前の描画位置（_getErasePoint()が返すオブジェクト）
		 * @type {object}
		 */
		this.prevPoint = null;
		/**
		 * アニメーションの開始時刻
		 * @type {number}
		 */
		this.startedTime = null;
		/**
		 * 元々設定されていたglobalCompositeOperationの値
		 * @type {string}
		 */
		this.savedGlobalCompositeOperation = null;
	}

	/**
	 * 描画クロックに対する座標を返す
	 * @param {number} t - 描画のためのクロック（1クロックで軌跡片道分、4クロックで1文字（＝軌跡2往復）分）
	 */
	_getErasePoint(t) {
		const charSize = this.charSize;
		// セグメント（＝何番目の軌跡を描いているか）
		const segment = Math.floor(t);
		// 1つの軌跡の中での位置
		const s = t % 1;
		let x, y;
		// 上から下へ向かう軌跡
		if (segment % 2 == 0) {
			x = this.x + charSize * (segment + 1 - s) / 4; // 横方向は4分の1文字分戻る
			y = this.y + charSize * s;
		// 下から上へ向かう軌跡
		} else {
			x = this.x + charSize * (segment - 1 + 3 * s) / 4; // 横方向は4分の3文字分進む
			y = this.y + charSize * (1 - s);
		}
		return { segment, x, y };
	}

	/**
	 * 与えられた点まで線を引く
	 * @param {object} point - 次の座標
	 * @param {number} point.x - x座標
	 * @param {number} point.y - y座標
	 * @param {boolean} isFirstPoint - 最初の点かどうか
	 */
	_lineTo(point, isFirstPoint) {
		const {x, y} = point;
		if (isFirstPoint) {
			this.ctx.moveTo(x, y);
		} else {
			this.ctx.lineTo(x, y);
			this.ctx.stroke();
		}
	}

	/**
	 * 消去するラインを描く
	 * @param {number} timestamp - requestAnimationFrameのタイムスタンプ
	 */
	_drawEraseLine(timestamp) {
		// 経過時間（秒）
		const elapsedTime = (timestamp - this.startedTime) / 1000;
		// 描画のためのクロック（4クロックで1文字分）
		const t = elapsedTime * this.speed * 4;
		// クロックに対する座標を取得
		const p = this._getErasePoint(t);
		// 前回の座標と異なるセグメントに進んでいる場合
		while (this.prevPoint && p.segment != this.prevPoint.segment) {
			// 前回のセグメントを終わらせる
			const u = this.prevPoint.segment + 1;
			const q = this._getErasePoint(u);
			this._lineTo(q);
			this.prevPoint = q;
			// 最後まで描画し終わった場合は終了
			if (u > this.eraseEnd) {
				return this.resolve();
			}
		}
		// 次の座標まで描画
		this._lineTo(p, t == 0);
		this.prevPoint = p;
		// 最後まで描画し終わった場合は終了
		if (t > this.eraseEnd) {
			return this.resolve();
		}
		// 次のステップへ
		requestAnimationFrame((ts) => {
			this._drawEraseLine(ts);
		});
	}

	/**
	 * 消去のアニメーションを開始する
	 * @return {Promise} アニメーション終了時に解決するPromise
	 */
	start() {
		return new Promise((resolve, reject) => {
			this.prevPoint = null;
			this.startedTime = null;
			this.ctx.lineWidth = this.charSize / 2;
			this.ctx.lineCap = 'square';
			this.savedGlobalCompositeOperation = this.ctx.globalCompositeOperation;
			this.ctx.globalCompositeOperation = 'destination-out'; // 透明を描画するための合成方法の設定
			this.ctx.beginPath();
			this.resolve = () => {
				this.ctx.globalCompositeOperation = this.savedGlobalCompositeOperation; // 合成方法の設定を元に戻す
				resolve();
			};
			// アニメーションの開始
			requestAnimationFrame((ts) => {
				this.startedTime = ts;
				this._drawEraseLine(ts);
			});
		});
	}

}
