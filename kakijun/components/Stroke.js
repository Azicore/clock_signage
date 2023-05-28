import SplineCurve from './SplineCurve.js';

/**
 * 字画が通る点列を表すクラス
 */
export default class Stroke {

	/**
	 * 初期化
	 * @param {Object[]|String} initialData - 点列の情報（x、y、sの3つのキーを持つオブジェクトの配列か、またはそれを表すJSON文字列）
	 */
	constructor(initialData) {
		/**
		 * 点を表すオブジェクト（x、y座標とシャープな点かどうかの情報を持つ）の配列
		 * @type {object[]}
		 */
		this.points = [];

		if (typeof initialData == 'string') {
			try {
				initialData = JSON.parse(initialData);
			} catch (e) { }
		}
		if (Array.isArray(initialData)) {
			for (const p of initialData) {
				this._addPoint(p.x, p.y, p.s);
			}
		}
	}

	/**
	 * 座標を追加する
	 * @param {number} x - x座標
	 * @param {number} y - y座標
	 * @param {boolean} isSharp - シャープな（滑らかでない）点かどうか
	 */
	_addPoint(x, y, isSharp) {
		const p = { x, y };
		if (isSharp) p.s = 1;
		this.points.push(p);
	}

	/**
	 * 指定した区間を結ぶスプライン曲線を返す
	 * @param {number} n - 区間の開始点の点番号（0～）
	 * @return {SplineCurve} {@link SplineCurve}オブジェクト
	 */
	getSplineCurve(n) {
		if (n > this.points.length - 1) n = this.points.length - 1;
		const p_1 = this.points[n - 1];
		const p   = this.points[n];
		const p1  = this.points[n + 1];
		const p2  = this.points[n + 2];
		const controlPoints = [];
		// スプライン曲線の前半の2つの制御点を選択
		if (n == 0 || p.s || !p1) {
			// 開始点が始端点かシャープか終端点
			controlPoints.push(p, p);
		} else {
			// それ以外
			controlPoints.push(p_1, p);
		}
		// スプライン曲線の後半の2つの制御点を選択
		if (!p1) {
			// 開始点が終端点
			controlPoints.push(p, p);
		} else if (p1.s || !p2) {
			// 終了点がシャープか終端点
			controlPoints.push(p1, p1);
		} else {
			// それ以外
			controlPoints.push(p1, p2);
		}
		return new SplineCurve(...controlPoints);
	}

	/**
	 * 点番号が最後の点かどうかを返す
	 * @param {number} n - 点番号（0～）
	 * @return {boolean} 最後の点（または範囲超過）であればtrue
	 */
	isLastPoint(n) {
		return n >= this.points.length - 1;
	}

}
