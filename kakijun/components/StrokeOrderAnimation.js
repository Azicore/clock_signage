/**
 * 書き順のアニメーションを行なうクラス
 */
export default class StrokeOrderAnimation {

	/**
	 * 初期化
	 * @param {CanvasRenderingContext2D} ctx - Canvasコンテキスト
	 * @param {Stroke[]} strokeList - 一筆が通る座標を表す{@link Stroke}オブジェクトの配列
	 * @param {object} position - 下記プロパティを含む設定オブジェクト
	 * @param {number} position.x - Canvas上の描画位置のx座標
	 * @param {number} position.y - Canvas上の描画位置のy座標
	 * @param {number} position.width - Canvas上の描画範囲の幅
	 * @param {number} position.height - Canvas上の描画範囲の高さ
	 * @param {object} config - 下記プロパティを含む設定オブジェクト
	 * @param {number} [config.speed=10] - 描画スピード（1秒間に進む点の数）※20程度以下を推奨
	 * @param {number} [config.lineWidth=1] - 線の太さ
	 * @param {string} [config.lineColor="#000000"] - 線の色（#rrggbb）
	 * @param {string} [config.lineCap="round"] - 線の端の処理
	 * @param {string} [config.lineJoin="round"] - 線の結合部の処理
	 */
	constructor(ctx, strokeList, position, config) {
		/**
		 * Canvasコンテキスト
		 * @type {CanvasRenderingContext2D}
		 */
		this.ctx = ctx;
		/**
		 * 一筆が通る座標を表す{@link Stroke}オブジェクトの配列
		 * @type {Stroke[]}
		 */
		this.strokeList = strokeList;
		/**
		 * Canvas上の描画位置に関する設定オブジェクト
		 * @type {object}
		 */
		this.position = position;
		/**
		 * 現在描画中の字画を表す{@link Stroke}オブジェクト
		 * @type {Stroke}
		 */
		this.stroke = null;
		/**
		 * 現在描画中のスプライン曲線を表す{@link SplineCurve}オブジェクト
		 * @type {SplineCurve}
		 */
		this.splineCurve = null;
		/**
		 * 一筆のアニメーション終了時にPromiseを解決するための関数
		 * @type {function}
		 */
		this.resolve = null;
		/**
		 * 一筆のアニメーション開始時のタイムスタンプ
		 * @type {number}
		 */
		this.startedTime = null;
		/**
		 * 直前の点番号
		 * @type {number}
		 */
		this.prevPointNumber = null;
		/**
		 * 描画スピード（1秒間に進む点の数）
		 * @type {number}
		 */
		this.speed = config.speed || 10;

		// Canvasの設定
		ctx.lineWidth   = config.lineWidth || 1;
		ctx.strokeStyle = config.lineColor || '#000000';
		ctx.lineCap     = config.lineCap || 'round';
		ctx.lineJoin    = config.lineJoin || 'round';
		// 新規パスを開始
		ctx.beginPath();
	}

	/**
	 * 与えられた点まで線を引く
	 * @param {object} point - 次の座標
	 * @param {number} point.x - x座標
	 * @param {number} point.y - y座標
	 * @param {boolean} isFirstPoint - 最初の点かどうか
	 */
	_lineTo(point, isFirstPoint) {
		const pos = this.position;
		const x = pos.x + point.x * pos.width;
		const y = pos.y + point.y * pos.height;
		if (isFirstPoint) {
			this.ctx.moveTo(x, y);
		} else {
			this.ctx.lineTo(x, y);
		}
	}

	/**
	 * アニメーションの1フレームの処理
	 * @param {number} timestamp - requestAnimationFrameのタイムスタンプ
	 */
	_drawStep(timestamp) {
		const elapsedTime = (timestamp - this.startedTime) / 1000;
		const t = elapsedTime * this.speed;
		const n = Math.floor(t);
		const u = t % 1;
		const ctx = this.ctx;
		// 次の区間に進んだとき
		if (n > this.prevPointNumber) {
			this.prevPointNumber = n;
			// スプライン曲線を生成
			this.splineCurve = this.stroke.getSplineCurve(n);
			// 直前の区間の最後まで描画
			this._lineTo(this.splineCurve.getPoint(0), n == 0);
			// 終端点の場合はそこで終了
			if (this.stroke.isLastPoint(n)) {
				ctx.stroke();
				// 字画がまだ残っている場合はtrue、全て書き終わった場合はfalseでPromiseを解決
				this.resolve(this.strokeList.length > 0);
				return;
			}
		}
		// 区間の途中まで描画
		this._lineTo(this.splineCurve.getPoint(u));
		ctx.stroke();
		// 次のステップへ
		requestAnimationFrame((ts) => {
			this._drawStep(ts);
		});
	}

	/**
	 * 一定時間待機する
	 * @param {number} ms - 待機するミリ秒数
	 */
	wait(ms) {
		return new Promise((resolve, reject) => {
			setTimeout(resolve, ms);
		});
	}

	/**
	 * 次の一筆のアニメーションを開始する
	 * @return {Promise} アニメーション終了時に解決するPromise
	 */
	next() {
		return new Promise((resolve, reject) => {
			// 次の字画がもう無い場合はfalseで解決
			if (this.strokeList.length == 0) return resolve(false);
			// 次の字画を表すStrokeオブジェクト
			this.stroke = this.strokeList.shift();
			this.resolve = resolve;
			this.prevPointNumber = -1;
			// アニメーションの開始
			requestAnimationFrame((ts) => {
				this.startedTime = ts;
				this._drawStep(ts);
			});
		});
	}

	/**
	 * 全てのアニメーションを開始する
	 * @param {number} [wait=0] - 一筆と一筆の間の待機時間（ミリ秒）
	 */
	async start(wait) {
		while (await this.next()) {
			await this.wait(+wait || 0);
		}
	}

}
