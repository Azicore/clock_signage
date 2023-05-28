/**
 * スプライン曲線を生成するためのクラス
 */
export default class SplineCurve {

	/**
	 * 初期化
	 * @param {object} p0 - 1つ目の制御点の座標（直前の点）
	 * @param {number} p0.x - x座標
	 * @param {number} p0.y - y座標
	 * @param {object} p1 - 2つ目の制御点の座標（区間の開始点）
	 * @param {number} p1.x - x座標
	 * @param {number} p1.y - y座標
	 * @param {object} p2 - 3つ目の制御点の座標（区間の終了点）
	 * @param {number} p2.x - x座標
	 * @param {number} p2.y - y座標
	 * @param {object} p3 - 4つ目の制御点の座標（次の点）
	 * @param {number} p3.x - x座標
	 * @param {number} p3.y - y座標
	 */
	constructor(p0, p1, p2, p3) {
		/**
		 * 3次項の係数（x座標）
		 * @type {number}
		 */
		this.ax = (p3.x - 3 * p2.x + 3 * p1.x - p0.x) / 2;
		/**
		 * 3次項の係数（y座標）
		 * @type {number}
		 */
		this.ay = (p3.y - 3 * p2.y + 3 * p1.y - p0.y) / 2;
		/**
		 * 2次項の係数（x座標）
		 * @type {number}
		 */
		this.bx = (-p3.x + 4 * p2.x - 5 * p1.x + 2 * p0.x) / 2;
		/**
		 * 2次項の係数（y座標）
		 * @type {number}
		 */
		this.by = (-p3.y + 4 * p2.y - 5 * p1.y + 2 * p0.y) / 2;
		/**
		 * 1次項の係数（x座標）
		 * @type {number}
		 */
		this.cx = (p2.x - p0.x) / 2;
		/**
		 * 1次項の係数（y座標）
		 * @type {number}
		 */
		this.cy = (p2.y - p0.y) / 2;
		/**
		 * 定数項（x座標）
		 * @type {number}
		 */
		this.dx = p1.x;
		/**
		 * 定数項（y座標）
		 * @type {number}
		 */
		this.dy = p1.y;
	}

	/**
	 * 区間内の補間された点の座標を返す
	 * @param {number} t - 区間内の位置を表す0～1の値
	 * @return {object} 補間された点の座標
	 * @property {number} x x座標
	 * @property {number} y y座標
	 */
	getPoint(t) {
		const x = this.dx + t * (this.cx + t * (this.bx + t * this.ax));
		const y = this.dy + t * (this.cy + t * (this.by + t * this.ay));
		return { x, y };
	}

}
