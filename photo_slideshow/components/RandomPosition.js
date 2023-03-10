import Position from './Position.js';

/**
 * ランダムな位置や角度の生成を行なうクラス
 */
export default class RandomPosition {

	/**
	 * 初期化
	 * @param {object} positionConfig - 下記プロパティを含む設定オブジェクト
	 * @param {number} positionConfig.minAppearanceRotation - 出現/消滅時の最小回転角度
	 * @param {number} positionConfig.maxAppearanceRotation - 出現/消滅時の最大回転角度
	 * @param {number} positionConfig.minDisplayRotation - 表示時の最小回転角度
	 * @param {number} positionConfig.maxDisplayRotation - 表示時の最大回転角度
	 * @param {number} positionConfig.exclusionRadiusRatio - 画面高さに対する「出現/消滅をさせない中央の領域の半径」の比（0～0.5）
	 */
	constructor(positionConfig) {
		/**
		 * ウィンドウサイズに依存する情報（update()で更新）
		 * @type {object}
		 */
		this.windowInfo = {};
		/**
		 * 出現/消滅時の最小回転角度
		 * @type {number}
		 */
		this.minAppearanceRotation = positionConfig.minAppearanceRotation;
		/**
		 * 出現/消滅時の最大回転角度
		 * @type {number}
		 */
		this.maxAppearanceRotation = positionConfig.maxAppearanceRotation;
		/**
		 * 表示時の最小回転角度
		 * @type {number}
		 */
		this.minDisplayRotation = positionConfig.minDisplayRotation;
		/**
		 * 表示時の最大回転角度
		 * @type {number}
		 */
		this.maxDisplayRotation = positionConfig.maxDisplayRotation;
		/**
		 * 画面高さに対する「出現/消滅をさせない中央の領域の半径」の比（0～0.5）
		 * @type {number}
		 */
		this.exclusionRadiusRatio = positionConfig.exclusionRadiusRatio;
		/**
		 * 前回生成した位置の情報
		 * @type {Position}
		 */
		this.prevPosition = null;
		/**
		 * 前回生成した角度の情報
		 * @type {Position}
		 */
		this.prevRotation = null;
	}

	/**
	 * 画面内のランダムな位置を生成する
	 * @param {boolean} makeVariation - 前回生成した位置と離れた位置を選ぶかどうか
	 * @return {Position} 生成した位置の情報
	 */
	_generateRandomPostion(makeVariation) {
		// ウィンドウのサイズ
		const w = this.windowInfo.width;
		const h = this.windowInfo.height;
		// 視点と奥行き
		const perspective = this.windowInfo.perspective;
		const depth = this.windowInfo.depth;
		let x = 0, y = 0, z = -depth;
		// 画面中央から一定距離離れた点が得られるまで試行
		while (h * this.exclusionRadiusRatio > Math.sqrt(x * x + y * y)) {
			// xは全体から選ぶ
			x = (Math.random() - 0.5) * w;
			// 前回の位置を考慮する場合
			if (makeVariation && this.prevPosition) {
				// ゼロ除算の回避
				const py = this.prevPosition.y || 0.01;
				// 前回のyと正負逆の範囲から選ぶ
				y = Math.random() * h * 0.5 * -Math.sign(py);
				// 原点を中心にして同じ側にある場合は座標を反転
				if (x * this.prevPosition.x > -y * py) {
					x = -x;
					y = -y;
				}
			// 前回の位置を考慮しない場合
			} else {
				// yも全体から選ぶ
				y = (Math.random() - 0.5) * h;
			}
		}
		// 奥行きで小さく見える分、逆に拡大して返す
		const r = (perspective + depth) / perspective;
		x *= r;
		y *= r;
		const pos = new Position({x, y, z});
		this.prevPosition = pos;
		return pos;
	}

	/**
	 * ランダムな角度を生成する
	 * @param {object} ranges - 軸ごとの設定オブジェクト
	 * @param {?Array} ranges.rx - x軸周りの回転角の設定
	 * @param {?Array} ranges.ry - y軸周りの回転角の設定
	 * @param {?Array} ranges.rz - z軸周りの回転角の設定
	 * @return {Position} 生成した角度の情報
	 */
	_generateRandomRotation(ranges) {
		const angles = {};
		// 直前と符号の組合せを一致させない軸
		const variationalAxes = [];
		// 直前と符号の組合せを一致させない軸の直前の符号の組合せ
		let prevSign = 0;
		// 各軸についてくり返し
		for (const k in ranges) {
			// 最小・最大の指定が無い場合
			if (ranges[k] == null) {
				// 直前と同じ値を採用
				angles[k] = this.prevRotation[k];
				continue;
			}
			// 最小・最大が指定されている場合
			const [min, max, makeVariation] = ranges[k];
			// 最小・最大の範囲からランダムに絶対値を選択
			angles[k] = Math.random(max - min) + min;
			// 直前と符号の組合せを一致させない場合
			if (makeVariation) {
				// 直前の符号を記録
				prevSign = prevSign << 1 | (this.prevRotation[k] >= 0 ? 1 : 0);
				// 軸を記録
				variationalAxes.unshift(k);
			// 直前と符号の組合せが一致してもよい場合
			} else {
				// 符号をランダムに選択
				angles[k] *= 0.5 > Math.random() ? -1 : 1;
			}
		}
		// 直前と符号の組合せを一致させない軸がある場合
		if (variationalAxes.length > 0) {
			// 符号の組合せ通り数
			const n = 2 ** variationalAxes.length;
			// 直前と一致しない組合せをランダムに選択
			let nextSign = prevSign;
			while (nextSign == prevSign) {
				nextSign = Math.floor(Math.random() * n);
			}
			// 選択した組合せに基づいて符号を選択
			for (const k of variationalAxes) {
				angles[k] *= nextSign & 1 ? 1 : -1;
				nextSign >>= 1;
			}
		}
		const ang = new Position({}, angles);
		this.prevRotation = ang;
		return ang;
	}

	/**
	 * 出現/消滅時の位置と角度を生成する
	 * @param {boolean} makeVariation - 前回生成した位置と離れた位置を選ぶかどうか
	 * @return {Position} 生成した位置と角度の情報
	 */
	_getAppearancePosition(makeVariation) {
		const pos = this._generateRandomPostion(makeVariation);
		const range = [this.minAppearanceRotation, this.maxAppearanceRotation, false];
		const ang = this._generateRandomRotation({ rx: range, ry: range, rz: [0, 0] });
		return new Position(pos, ang);
	}

	/**
	 * 表示時の位置と角度を生成する
	 * @param {boolean} makeVariation - 前回生成した角度と符号の組合せを一致させないようにするかどうか
	 * @return {Position} 生成した位置と角度の情報
	 */
	_getDisplayPosition(makeVariation) {
		const pos = new Position(); // 表示時は位置のずれは無し
		const range = [this.minDisplayRotation, this.maxDisplayRotation, makeVariation];
		const ang = this._generateRandomRotation({ rx: range, ry: range, rz: [0, 0] });
		return new Position(pos, ang);
	}

	/**
	 * 出現/消滅および表示に必要な位置と角度を決定する
	 * @param {object} windowInfo - ウィンドウサイズに依存する情報
	 * @param {number} windowInfo.width - 現在のウィンドウの幅
	 * @param {number} windowInfo.height - 現在のウィンドウの高さ
	 * @param {number} windowInfo.perspective - 視点位置
	 * @param {number} windowInfo.depth - 表示位置の奥行き
	 * @return {object} 決定した位置と角度の情報
	 * @property {Position} appearanceStart 出現時の位置と角度
	 * @property {Position} displayStart 表示開始時の位置と角度
	 * @property {Position} displayEnd 表示終了時の位置と角度
	 * @property {Position} appearanceEnd 消滅時の位置と角度
	 */
	select(windowInfo) {
		this.windowInfo = windowInfo;
		const positions = {};
		// 出現時の位置と角度（true：消滅時と離れた位置にする）
		positions.appearanceStart = this._getAppearancePosition(true);
		// 表示開始時の位置と角度（false：ランダムに選ぶ）
		positions.displayStart = this._getDisplayPosition(false);
		// 表示終了時の位置と角度（true：表示開始時と符号の組合せが一致しない角度にする）
		positions.displayEnd = this._getDisplayPosition(true);
		// 消滅時の位置と角度（false：ランダムに選ぶ）
		positions.appearanceEnd = this._getAppearancePosition(false);
		return positions;
	}

}

