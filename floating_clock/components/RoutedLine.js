/**
 * 線分の変形アニメーションのためのクラス
 */
export default class RoutedLine {

	/**
	 * 変形する線分1つを表すオブジェクトを作る
	 * @param {string} pointNames - 線分が通過する点の名前（A～I）を順に並べた文字列
	 * @param {number[]} before - 変形開始時点での端点の位置（pointNamesで与えた文字列の何番目から何番目までであるか）
	 * @param {number[]} after - 変形終了時点での端点の位置（pointNamesで与えた文字列の何番目から何番目までであるか）
	 * @param {object} config - 下記のプロパティを含むオブジェクト
	 * @param {number} config.hsize - 点の水平方向の間隔（ピクセル）
	 * @param {number} config.vsize - 点の垂直方向の間隔（ピクセル）
	 */
	constructor(pointNames, before, after, config) {

		// 水平・垂直方向の1単位のサイズ
		const { hsize, vsize } = config || { hsize: 30, vsize: 60 };
		// 基準点の名前（A～I）と相対位置
		const POINTS = {
			A: [0, 0], B: [1, 0], C: [2, 0], // ┌ ┬ ┐
			D: [0, 1], E: [1, 1], F: [2, 1], // ├ ┼ ┤
			G: [0, 2], H: [1, 2], I: [2, 2]  // └ ┴ ┘
		};
		// 点の名前から点の配列を生成
		const p = [];
		for (let i = 0; pointNames.length > i; i++) {
			p[i] = {
				x: POINTS[pointNames[i]][0] * hsize,
				y: POINTS[pointNames[i]][1] * vsize
			};
			// 全体の中での位置の比
			p[i].r = i == 0 ? 0 : p[i - 1].r + Math.abs(p[i].x - p[i - 1].x) + Math.abs(p[i].y - p[i - 1].y);
		}
		// 位置の比を正規化（先頭が0、終端が1）
		for (let i = 1; p.length - 1 > i; i++) {
			p[i].r /= p[p.length - 1].r;
		}
		p[p.length - 1].r = 1;

		/**
		 * 線分が通過する点の配列
		 * @type {object[]}
		 */
		this.points = p;
		/**
		 * 変形開始時点での端点の位置
		 * @type {number[]}
		 */
		this.before = before;
		/**
		 * 変形終了時点での端点の位置
		 * @type {number[]}
		 */
		this.after = after;
	
	}

	/**
	 * aとbの間をr：1-rに分けた値を返す
	 * @param {number} a - 数値
	 * @param {number} b - 数値
	 * @param {number} r - 0～1の比
	 * @return {number} aとbの間をr：1-rに分けた値（r=0ならa、r=1ならbとなる）
	 */
	_divide(a, b, r) {
		return a + (b - a) * r;
	}

	/**
	 * 値cがaとbの間のどの位置にあるかを比で返す
	 * @param {number} a - 数値
	 * @param {number} b - 数値
	 * @param {number} c - a以上b以下の数値
	 * @return {number} 0～1の比（c=aなら0、c=bなら1となる）
	 */
	_ratio(a, b, c) {
		return (c - a) / (b - a);
	}

	/**
	 * 準備した経路での変形に対して、比ratioの時点で通過する点の配列を返す
	 * @param {number} ratio - 0～1の比（変形開始時が0、終了時が1）
	 * @return {object[]} 比ratioの時点で通過する点の配列
	 */
	getPoints(ratio) {
		const points = this.points;
		const before = this.before;
		const after = this.after;
		// 全体の先頭と終端（r=0,1）は必ず端にするため、いったん除いておく
		const p = points.slice(1, -1);
		// 比ratio時点における先頭と終端を追加
		p.push({ r: this._divide(points[before[0]].r, points[after[0]].r, ratio) });
		p.push({ r: this._divide(points[before[1]].r, points[after[1]].r, ratio) });
		// rでソートして追加した点を正しい順序にする
		p.sort((a, b) => a.r - b.r);
		// 除いていた全体の先頭と終端（r=0,1）を両端に戻す
		p.unshift(points[0]);
		p.push(points[points.length - 1]);
		// 追加した点のx・yを求める
		const edge = [];
		for (let i = 0; p.length > i; i++) {
			if (p[i].x != null) continue;
			const prev = p[i - 1];
			const next = p[i + 1].x != null ? p[i + 1] : p[i + 2];
			const r = this._ratio(prev.r, next.r, p[i].r);
			p[i].x = this._divide(prev.x, next.x, r);
			p[i].y = this._divide(prev.y, next.y, r);
			edge.push(i);
		}
		// 比ratio時点での先頭～終端までの点の配列を返す
		return p.slice(edge[0], edge[1] + 1);
	}

}
