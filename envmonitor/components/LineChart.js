/**
 * 折れ線グラフのクラス
 */
export default class LineChart {

	/**
	 * 初期化
	 * @param {HTMLElement} containerElement - グラフを表示するHTML要素
	 * @param {object} config - 下記プロパティを含む設定オブジェクト
	 * @param {object} config.general - 一般的な設定（コード内参照）
	 * @param {object} config.layout - レイアウトに関する設定（コード内参照）
	 * @param {object} config.size - サイズに関する設定（コード内参照）
	 * @param {object} config.color - 色に関する設定（コード内参照）
	 */
	constructor(containerElement, config = {}) {
		/**
		 * グラフを表示するHTML要素
		 * @type {HTMLElement}
		 */
		this.container = containerElement;
		/**
		 * 一般的な設定項目
		 * @type {object}
		 */
		this.generalConfig = Object.assign({
			xRangeHour        : 24 * 3,  // x軸の範囲（時間）
			xTickHour         : 24,      // x軸主目盛の間隔（時間）
			xMinorTickHour    : 6,       // x軸補助目盛の間隔（時間）
			xTickText         : '%M/%D', // x軸主目盛の文字
			xMinorTickText    : '',      // x軸補助目盛の文字
			maxYTicks         : 6,       // Y軸目盛りの最大数
			chartYMargin      : 0,       // グラフの上下端とのマージン（0～1）
			textFont          : 'sans-serif', // 文字のフォント
			textBaselineOffset: 0.3,     // テキストの上下位置のオフセット（0～1）
			yLabel            : ''       // y軸ラベル
		}, config.general || {});
		/**
		 * レイアウトに関する設定項目
		 * @type {object}
		 */
		this.layoutConfig = Object.assign({
			marginTopRatio   : 0.05, // 上マージン（Canvas高さに対する比）
			marginRightRatio : 0.05, // 右マージン（Canvas幅に対する比）
			marginBottomRatio: 0.1,  // 下マージン（Canvas高さに対する比）
			marginLeftRatio  : 0.1,  // 左マージン（Canvas幅に対する比）
			scaleUnitRatio   : 0.001 // サイズ基準（Canvas幅か高さいずれか小さい方に対する比）
		}, config.layout || {});
		/**
		 * サイズに関する設定項目
		 * @type {object}
		 */
		this.sizeConfig = Object.assign({
			frameLineSize     :  1, // 枠線の太さ
			dataLineSize      :  5, // グラフの線の太さ
			xTickLineSize     :  1, // x軸主目盛の太さ
			xTickLength       : 10, // x軸主目盛の長さ
			xGridLineSize     :  1, // x軸主目盛のグリッド線の太さ
			xTextSize         : 15, // x軸主目盛の文字の大きさ
			xTextMargin       : 15, // x軸主目盛の文字のマージン
			xMinorTickLineSize:  1, // x軸補助目盛の太さ
			xMinorTickLength  :  5, // x軸補助目盛の長さ
			xMinorTextSize    : 12, // x軸補助目盛の文字の大きさ
			xMinorTextMargin  : 15, // x軸補助目盛の文字のマージン
			yTickLineSize     :  1, // y軸目盛の太さ
			yTickLength       :  0, // y軸目盛の長さ
			yGridLineSize     :  1, // y軸目盛のグリッド線の太さ
			yTextSize         : 15, // y軸目盛の文字の大きさ
			yTextMargin       :  8, // y軸目盛の文字のマージン
			yLabelSize        : 15, // y軸ラベルの文字の大きさ
			yLabelMargin      : 60  // y軸ラベルのマージン
		}, config.size || {});
		/**
		 * 色に関する設定項目
		 * @type {object}
		 */
		this.colorConfig = Object.assign({
			dataLineColor  : '#f00000', // グラフの線の色
			dataFillColor  : 'rgba(255, 224, 224, 0.8)', // グラフの塗りの色
			frameColor     : '#000000', // 枠線の色
			backgroundColor: '#ffffff', // 背景の色
			chartAreaColor : '#fafafa', // グラフエリアの背景の色
			xTickColor     : '#000000', // x軸主目盛の色
			xGridColor     : '#000000', // x軸主目盛のグリッド線の色
			xTextColor     : '#000000', // x軸主目盛の文字の色
			xMinorTickColor: '#000000', // x軸補助目盛の色
			xMinorTextColor: '#000000', // x軸補助目盛の文字の色
			yTickColor     : '#000000', // y軸目盛の色
			yGridColor     : '#000000', // y軸目盛のグリッド線の色
			yTextColor     : '#000000', // y軸目盛の文字の色
		}, config.color || {});
		/**
		 * 各種サイズの値（resize()で初期化）
		 * @type {object}
		 */
		this.sizes = {};
		/**
		 * Canvas要素
		 * @type {HTMLCanvasElement}
		 */
		this.canvas = document.createElement('canvas');
		// レイアウトの初期化
		this.canvas.width = 1;
		this.canvas.height = 1;
		this.resize();
		this.container.insertAdjacentElement('afterbegin', this.canvas);
		/**
		 * Canvasコンテキスト
		 * @type {CanvasRenderingContext2D}
		 */
		this.ctx = this.canvas.getContext('2d');
		/**
		 * 時差（分）
		 * @type {number}
		 */
		this.tz = new Date().getTimezoneOffset();
		/**
		 * x軸の最小値（_setXRange()で初期化）
		 * @type {number}
		 */
		this.xmin = 0;
		/**
		 * x軸の最大値（_setXRange()で初期化）
		 * @type {number}
		 */
		this.xmax = 0;
		/**
		 * y軸の最小値（_setYRange()で初期化）
		 * @type {number}
		 */
		this.ymin = 0;
		/**
		 * y軸の最大値（_setYRange()で初期化）
		 * @type {number}
		 */
		this.ymax = 0;
		/**
		 * y軸の目盛間隔（_setYRange()で初期化）
		 * @type {number}
		 */
		this.yTick = 0;
		/**
		 * データ（xをキー、yを値に持つオブジェクト）
		 * @type {object}
		 */
		this.data = {};
	}

	/**
	 * リサイズ
	 */
	resize() {
		const config = this.layoutConfig;
		const { width, height } = this.container.getBoundingClientRect();
		// Canvasサイズの再設定
		this.canvas.width = width;
		this.canvas.height = height;
		/**
		 * Canvasの幅
		 * @type {number}
		 */
		this.width = width;
		/**
		 * Canvasの高さ
		 * @type {number}
		 */
		this.height = height;
		/**
		 * グラフエリアの上マージン
		 * @type {number}
		 */
		this.marginTop = Math.round(this.height * config.marginTopRatio) + 0.5;
		/**
		 * グラフエリアの右マージン
		 * @type {number}
		 */
		this.marginRight = Math.round(this.width * config.marginRightRatio) + 0.5;
		/**
		 * グラフエリアの下マージン
		 * @type {number}
		 */
		this.marginBottom = Math.round(this.height * config.marginBottomRatio) + 0.5;
		/**
		 * グラフエリアの左マージン
		 * @type {number}
		 */
		this.marginLeft = Math.round(this.width * config.marginLeftRatio) + 0.5;
		/**
		 * グラフエリアの幅
		 * @type {number}
		 */
		this.chartWidth = this.width - this.marginRight - this.marginLeft;
		/**
		 * グラフエリアの高さ
		 * @type {number}
		 */
		this.chartHeight = this.height - this.marginTop - this.marginBottom;
		// サイズ基準
		const scaleUnit = Math.min(this.width, this.height) * config.scaleUnitRatio;
		// 各種サイズの再計算
		for (const key in this.sizeConfig) {
			this.sizes[key] = Math.ceil(scaleUnit * this.sizeConfig[key]);
		}
	}

	/**
	 * x軸の範囲を決定する
	 */
	_setXRange() {
		const config = this.generalConfig;
		// 最大値は現在時刻の1分前
		this.xmax = Math.floor(Date.now() / 60000) - 1;
		this.xmin = this.xmax - config.xRangeHour * 60;
	}

	/**
	 * y軸の範囲を決定する
	 */
	_setYRange() {
		const config = this.generalConfig;
		// データの最小値・最大値を求める
		let dataMin, dataMax;
		for (let x = this.xmin; this.xmax >= x; x++) {
			const y = this.data[x];
			if (y == null) continue;
			if (dataMin == null || dataMin > y) dataMin = y;
			if (dataMax == null || y > dataMax) dataMax = y;
		}
		if (dataMin == null) dataMin = 0;
		if (dataMax == null) dataMax = 0;
		if (dataMin == dataMax) {
			dataMin -= 1;
			dataMax += 1;
		}
		// 最小値～最大値が収まる目盛を求める
		let base = 1;
		const m = config.chartYMargin;
		const tickUnits = [1, 2, 5];
		for (let i = 0; true; i++) {
			const s = tickUnits.length;
			const t = base * tickUnits[i % s];
			const tmax = Math.ceil(dataMax / t + m) * t;
			const tmin = Math.floor(dataMin / t - m) * t;
			if ((config.maxYTicks - 1) * t >= tmax - tmin) {
				this.ymin = tmin;
				this.ymax = tmax;
				this.yTick = t;
				return;
			}
			if (i % s == s - 1) {
				base *= 10;
			}
		}
	}

	/**
	 * グラフ上の座標からCanvas上の座標を得る
	 * @param {number} x - グラフ上のxの値
	 * @param {number} y - グラフ上のyの値
	 * @return {object} 下記のプロパティを含むオブジェクト
	 * @property {number} left Canvas上のx座標
	 * @property {number} top Canvas上のy座標
	 */
	_getPositionOf(x, y) {
		const { xmin, xmax, ymin, ymax } = this;
		return {
			left: this.chartWidth * (x - xmin) / (xmax - xmin) + this.marginLeft,
			top: this.chartHeight * (ymax - y) / (ymax - ymin) + this.marginTop
		};
	}

	/**
	 * グラフ上の座標に基づいてパスの描画を進める
	 * @param {number} x - グラフ上のxの値
	 * @param {number} y - グラフ上のyの値
	 * @param {boolean} [isFirst=false] - trueの場合はmoveToメソッドを使う
	 * @param {number} [offsetX=0] - グラフ上の座標からの描画点の横方向のずれ（Canvas上の距離）
	 * @param {number} [offsetY=0] - グラフ上の座標からの描画点の縦方向のずれ（Canvas上の距離）
	 */
	_lineTo(x, y, isFirst, offsetX = 0, offsetY = 0) {
		const ctx = this.ctx;
		const { left, top } = this._getPositionOf(x, y);
		ctx[isFirst ? 'moveTo' : 'lineTo'](left + offsetX, top + offsetY);
	}

	/**
	 * 線分を描画する
	 * @param {number} x - 始点のグラフ上のxの値
	 * @param {number} y - 始点のグラフ上のyの値
	 * @param {number} w - 始点から終点までの横方向のCanvas上の距離
	 * @param {number} h - 始点から終点までの縦方向のCanvas上の距離
	 */
	_drawSegment(x, y, w, h) {
		const ctx = this.ctx;
		ctx.beginPath();
		this._lineTo(x, y, true);
		this._lineTo(x, y, false, w, h);
		ctx.stroke();
	}

	/**
	 * テキストを描画する
	 * @param {string} text - 描画する文字列
	 * @param {number} x - グラフ上のxの値
	 * @param {number} y - グラフ上のyの値
	 * @param {number} [offsetX=0] - グラフ上の座標からの描画位置の横方向のずれ（Canvas上の距離）
	 * @param {number} [offsetY=0] - グラフ上の座標からの描画位置の縦方向のずれ（Canvas上の距離）
	 * @param {boolean} [rotate=false] - 左に90度傾けて描画する
	 */
	_drawText(text, x, y, offsetX = 0, offsetY = 0, rotate = false) {
		const ctx = this.ctx;
		const { left, top } = this._getPositionOf(x, y);
		const cx = left + offsetX;
		const cy = top + offsetY;
		if (rotate) {
			ctx.translate(cx, cy);
			ctx.rotate(-Math.PI / 2);
			ctx.translate(-cx, -cy);
			ctx.fillText(text, cx, cy);
			ctx.resetTransform();
		} else {
			ctx.fillText(text, cx, cy);
		}
	}

	/**
	 * xがx軸の目盛線描画位置かどうかを判定する
	 * @param {number} x - 判定するx座標
	 * @param {boolean} [isMinor=false] - falseの場合は主目盛、trueの場合は補助目盛の位置を判定する
	 * @return {boolean} 目盛線描画位置の場合はtrue
	 */
	_isXTick(x, isMinor = false) {
		const config = this.generalConfig;
		if (!isMinor) {
			// 主目盛
			return (x - this.tz) % (config.xTickHour * 60) == 0;
		} else {
			// 補助目盛
			return (x - this.tz) % (config.xMinorTickHour * 60) == 0 && !this._isXTick(x);
		}
	}

	/**
	 * xの値から日付文字列を生成する
	 * @param {number} x - x座標（UnixTime（ミリ秒）を60000で割った値）
	 * @param {boolean} [isMinor=false] - falseの場合は主目盛用、trueの場合は補助目盛用の文字列を生成する
	 * @return {string} 日付文字列
	 */
	_getDateText(x, isMinor = false) {
		const config = this.generalConfig;
		let format = isMinor ? config.xMinorTickText : config.xTickText;
		const pad0 = (s) => `${s}`.padStart(2, '0');
		const d = new Date();
		d.setTime(x * 60000);
		const [year, mon, date, hour, min] = [d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours(), d.getMinutes()];
		const [mon0, date0, hour0, min0] = [pad0(mon), pad0(date), pad0(hour), pad0(min)];
		format = format.replace(/%MM/g, mon0).replace(/%DD/g, date0).replace(/%hh/g, hour0).replace(/%mm/g, min0);
		format = format.replace(/%Y/g, year).replace(/%M/g, mon).replace(/%D/g, date).replace(/%h/g, hour);
		return format;
	}

	/**
	 * グリッド線を描く
	 */
	_drawGridLines() {
		const { ctx, sizes, colorConfig, xmin, xmax, ymin, ymax } = this;
		// 背景
		ctx.fillStyle = colorConfig.chartAreaColor;
		ctx.fillRect(0, 0, this.width, this.height);
		// x軸
		ctx.strokeStyle = colorConfig.xGridColor;
		ctx.lineWidth = sizes.xGridLineSize;
		for (let x = xmin; xmax >= x; x++) {
			if (this._isXTick(x)) this._drawSegment(x, ymin, 0, -this.chartHeight);
		}
		// y軸
		ctx.strokeStyle = colorConfig.yGridColor;
		ctx.lineWidth = sizes.yGridLineSize;
		for (let y = ymin; ymax >= y; y += this.yTick) {
			this._drawSegment(xmin, y, this.chartWidth, 0);
		}
	}

	/**
	 * グラフの線を描く
	 */
	_drawData() {
		const { ctx, sizes, colorConfig, xmin, xmax, ymin } = this;
		// 塗り
		ctx.fillStyle = colorConfig.dataFillColor;
		ctx.lineJoin = 'round';
		ctx.beginPath();
		let startx = null;
		const closeFill = (x) => {
			if (startx == null) return;
			this._lineTo(x, ymin);
			this._lineTo(startx, ymin);
			startx = null;
		};
		for (let x = xmin; xmax >= x; x++) {
			const y = this.data[x];
			if (y == null) {
				closeFill(x - 1);
				continue;
			}
			this._lineTo(x, y, startx == null);
			if (startx == null) startx = x;
		}
		closeFill(xmax);
		ctx.fill();
		// 線
		ctx.strokeStyle = colorConfig.dataLineColor;
		ctx.lineWidth = sizes.dataLineSize;
		ctx.lineJoin = 'round';
		ctx.lineCap = 'round';
		ctx.beginPath();
		let lineStarted = false;
		for (let x = xmin; xmax >= x; x++) {
			const y = this.data[x];
			if (y == null) {
				lineStarted = null;
				continue;
			}
			this._lineTo(x, y, !lineStarted);
			lineStarted = true;
		}
		ctx.stroke();
	}

	/**
	 * 余白の塗りを描く
	 */
	_drawMargin() {
		const { ctx, colorConfig } = this;
		ctx.fillStyle = colorConfig.backgroundColor;
		ctx.fillRect(0, 0, this.width, this.marginTop);
		ctx.fillRect(this.marginLeft + this.chartWidth, 0, this.marginRight, this.height);
		ctx.fillRect(0, this.marginTop + this.chartHeight, this.width, this.marginBottom);
		ctx.fillRect(0, 0, this.marginLeft, this.height);
	}

	/**
	 * x軸の目盛を描く
	 */
	_drawXTicks() {
		const { ctx, sizes, colorConfig, xmin, xmax, ymin } = this;
		const config = this.generalConfig;
		// 主目盛と文字
		const tickLength = sizes.xTickLength;
		const fontSize = sizes.xTextSize;
		const textMargin = sizes.xTextMargin;
		ctx.strokeStyle = colorConfig.xTickColor;
		ctx.lineWidth = sizes.xTickLineSize;
		ctx.lineCap = 'butt';
		ctx.textAlign = 'center';
		ctx.fillStyle = colorConfig.xTextColor;
		ctx.font = `${fontSize}px ${config.textFont}`;
		for (let x = xmin; xmax >= x; x++) {
			if (!this._isXTick(x)) continue;
			this._drawSegment(x, ymin, 0, tickLength);
			this._drawText(`${this._getDateText(x)}`, x, ymin, 0, textMargin + fontSize);
		}
		// 補助目盛と文字
		const minorTickLength = sizes.xMinorTickLength;
		const minorFontSize = sizes.xMinorTextSize;
		const minorTextMargin = sizes.xMinorTextMargin;
		ctx.strokeStyle = colorConfig.xMinorTickColor;
		ctx.lineWidth = sizes.xMinorTickLineSize;
		ctx.lineCap = 'butt';
		ctx.textAlign = 'center';
		ctx.fillStyle = colorConfig.xMinorTextColor;
		ctx.font = `${minorFontSize}px ${config.textFont}`;
		for (let x = xmin; xmax >= x; x++) {
			if (!this._isXTick(x, true)) continue;
			this._drawSegment(x, ymin, 0, minorTickLength);
			this._drawText(`${this._getDateText(x, true)}`, x, ymin, 0, minorTextMargin + minorFontSize);
		}
	}

	/**
	 * y軸の目盛を描く
	 */
	_drawYTicks() {
		const { ctx, sizes, colorConfig, xmin, ymin, ymax } = this;
		const config = this.generalConfig;
		// 目盛と文字
		const tickLength = sizes.yTickLength;
		const fontSize = sizes.yTextSize;
		const textMargin = sizes.yTextMargin;
		ctx.strokeStyle = colorConfig.yTickColor;
		ctx.lineWidth = sizes.yTickLineSize;
		ctx.lineCap = 'butt';
		ctx.textAlign = 'right';
		ctx.fillStyle = colorConfig.yTextColor;
		ctx.font = `${fontSize}px ${config.textFont}`;
		for (let y = ymin; ymax >= y; y += this.yTick) {
			this._drawSegment(xmin, y, -tickLength, 0);
			this._drawText(`${y}`, xmin, y, -textMargin, fontSize * config.textBaselineOffset);
		}
		// ラベル
		const labelSize = sizes.yLabelSize;
		const labelMargin = sizes.yLabelMargin;
		ctx.textAlign = 'center';
		ctx.font = `${labelSize}px ${config.textFont}`;
		this._drawText(config.yLabel, xmin, (ymin + ymax) / 2, -labelMargin, 0, true);
	}

	/**
	 * 枠線を描く
	 */
	_drawFrame() {
		const { ctx, sizes, colorConfig } = this;
		ctx.strokeStyle = colorConfig.frameColor;
		ctx.lineWidth = sizes.frameLineSize;
		ctx.strokeRect(this.marginLeft, this.marginTop, this.chartWidth, this.chartHeight);
	}

	/**
	 * データを更新する
	 * @param {object} data - xをキー、yを値に持つオブジェクト
	 */
	update(data) {
		if (data) {
			this.data = data;
		}
		this._setXRange();
		this._setYRange();
		this._drawGridLines();
		this._drawData();
		this._drawMargin();
		this._drawXTicks();
		this._drawYTicks();
		this._drawFrame();
	}

}
