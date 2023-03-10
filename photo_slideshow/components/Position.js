/**
 * 位置と角度を表すクラス
 */
export default class Position {

	/**
	 * 初期化
	 * @param {object} pos - 下記プロパティを含むオブジェクト
	 * @param {number} [pos.x] - x座標
	 * @param {number} [pos.y] - y座標
	 * @param {number} [pos.z] - z座標
	 * @param {object} ang - 下記プロパティを含むオブジェクト
	 * @param {number} [ang.rx] - x軸周りの回転角
	 * @param {number} [ang.ry] - y軸周りの回転角
	 * @param {number} [ang.rz] - z軸周りの回転角
	 */
	constructor(pos, ang) {
		if (pos == null) pos = {};
		if (ang == null) ang = {};
		/**
		 * x座標
		 * @type {number}
		 */
		this.x = pos.x;
		/**
		 * y座標
		 * @type {number}
		 */
		this.y = pos.y;
		/**
		 * z座標
		 * @type {number}
		 */
		this.z = pos.z;
		/**
		 * x軸周りの回転角
		 * @type {number}
		 */
		this.rx = ang.rx;
		/**
		 * y軸周りの回転角
		 * @type {number}
		 */
		this.ry = ang.ry;
		/**
		 * z軸周りの回転角
		 * @type {number}
		 */
		this.rz = ang.rz;
	}

	/**
	 * CSSのtransformに使用する値を返す
	 * @param {number} perspective - perspectiveに使う値
	 * @return {string} transformの値
	 */
	getTransformCss(perspective) {
		return [
			`perspective(${perspective}px)`,
			`translate3d(${this.x || 0}px, ${this.y || 0}px, ${this.z || 0}px)`,
			`rotateZ(${this.rz || 0}deg)`,
			`rotateY(${this.ry || 0}deg)`,
			`rotateX(${this.rx || 0}deg)`
		].join(' ');
	}

}
