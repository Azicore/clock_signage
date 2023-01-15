import { clock as config } from '../config/config.js';

/**
 * アナログ時計
 */
export default class Clock {

	/**
	 * 初期化
	 */
	constructor() {

		/**
		 * Device Pixel Ratio
		 * @type {number}
		 */
		this.dpr = 2;

		/**
		 * 角度0の方向（12時方向を角度0とする）
		 * @type {number}
		 */
		this.angleOffset = Math.PI * 0.5;

		/**
		 * ブロック要素
		 * @type {HTMLElement}
		 */
		this.elem = document.createElement('div');

		/**
		 * Canvas要素
		 * @type {HTMLElement}
		 */
		this.canv = document.createElement('canvas');

		/**
		 * Canvasコンテキスト
		 * @type {CanvasRenderingContext2D}
		 */
		this.ctx = this.canv.getContext('2d');

		this.elem.id = 'clock';
		document.body.appendChild(this.elem);
		this.resize(500); // サイズは要素生成のための仮値
		this.elem.appendChild(this.canv);

		// 自動更新
		if (!config.debug) {
			setInterval(() => {
				this.draw();
			}, 999);
		} else {
			this.debug = config.debug;
			this.draw();
		}
	}

	/**
	 * リサイズハンドラ
	 * @param {Layout} layout - レイアウト情報（{@link Layout}オブジェクト）
	 */
	resize(layout) {

		/**
		 * Canvasの幅
		 * @type {number}
		 */
		this.width = layout.w1 * this.dpr;
		/**
		 * Canvasの高さ
		 * @type {number}
		 */
		this.height = layout.h1 * this.dpr;
		/**
		 * Canvasの中心のx座標
		 * @type {number}
		 */
		this.centerOffsetX = this.width * 0.5;
		/**
		 * Canvasの中心のy座標
		 * @type {number}
		 */
		this.centerOffsetY = this.height * 0.5;

		this.canv.width = this.width;
		this.canv.height = this.height;
		this.canv.style.width = `${layout.w1}px`;
		this.canv.style.height = `${layout.h1}px`;
		this.canv.style.borderRadius = `${layout.br}px`;
		this.elem.style.left = `${layout.x2}px`;
		this.elem.style.top = `${layout.y1}px`;
		// Canvas中心を原点にする
		this.ctx.translate(this.centerOffsetX, this.centerOffsetY);
		this.ctx.textAlign = 'center';
		const marginValue = 30; // 描画幅を600としたときのパディング
		const w = this.width / (600 + marginValue); // 設定値の基準となる値
		const font = 'subsetfont';

		/**
		 * 文字盤の設定
		 * @type {object}
		 */
		this.dialConfig = {
			hourPosition           : w * 208,   // 時の文字の位置（中心からの距離）
			hourFontSize           : w *  56,   // 時のフォントサイズ
			hourFontName           : font,      // 時のフォント
			hourTextColor          : '#000000', // 時の文字色
			hourHighlightSize      : w *  84,   // 時のハイライトの直径
			hourHighlightColor     : '#33ccff', // 時のハイライトの色
			minPosition            : w * 275,   // 分の文字の位置（中心からの距離）
			minFontSize            : w *  14,   // 分のフォントサイズ
			minLargeFontSize       : w *  28,   // 分の大文字のフォントサイズ
			minFontName            : font,      // 分のフォント
			minTextColor           : '#000000', // 分の文字色
			minHighlightSize       : w *  30,   // 分のハイライトの直径
			minLargeHighlightSize  : w *  50,   // 分の大文字のハイライトの直径
			minHighlightColor      : '#ffcc33', // 分のハイライトの色
			markPosition           : w * 245,   // 目盛の位置（中心からの距離）
			markLength             : w *  10,   // 目盛の長さ
			markWidth              : w *   2,   // 目盛の太さ
			markBoldWidth          : w *   6,   // 太い目盛の太さ
			markColor              : '#000000', // 目盛の色
			textBaseline           : 0.35       // 文字の上下位置の調整（※textBaselineバグ対策）
		};
		/**
		 * 針の設定
		 * @type {object}
		 */
		this.handsConfig = {
			hourTipPosition        : w * 130,   // 時針の先端の位置（中心からの距離）
			hourRearPosition       : w * -40,   // 時針の後端の位置（中心からの距離）
			hourWidth              : w *  12,   // 時針の太さ
			hourColor              : '#000000', // 時針の色
			minTipPosition         : w * 235,   // 分針の先端の位置（中心からの距離） 
			minRearPosition        : w * -40,   // 分針の後端の位置（中心からの距離）
			minWidth               : w *   6,   // 分針の太さ
			minColor               : '#000000', // 分針の色
			secTipPosition         : w * 220,   // 秒針の先端の位置（中心からの距離）
			secRearPosition        : w * -60,   // 秒針の後端の位置（中心からの距離）
			secWidth               : w *   2,   // 秒針の太さ
			secColor               : '#000000'  // 秒針の色
		};
		/**
		 * ラベルの設定
		 * @type {object}
		 */
		this.labelConfig = {
			ampmPositionX          : w * -290,   // 午前/午後ラベルの左端の横位置（中心線からの距離）
			ampmPositionY          : w * -280,   // 午前/午後ラベルの上端の縦位置（中心線からの距離）
			ampmWidth              : w * 50,    // 午前/午後ラベルの幅
			ampmHeight             : w * 50,    // 午前/午後ラベルの高さ
			ampmColor              : '#f0f0f0', // 午前/午後ラベルの色
			ampmFontSize           : w * 25,     // 午前/午後ラベルのフォントサイズ
			ampmFontName           : font,      // 午前/午後ラベルのフォント
			ampmTextColor          : '#666666', // 午前/午後ラベルの文字色
			textBaseline           : 0.35       // 文字の上下位置の調整（※textBaselineバグ対策）
		};
		this.draw();
	}

	/**
	 * 描画
	 */
	draw() {
		const now = new Date();
		// 表示テスト用
		if (this.debug) {
			now.setHours(this.debug[0]);
			now.setMinutes(this.debug[1]);
			now.setSeconds(this.debug[2]);
		}

		/**
		 * 現在の時（0～23）
		 * @type {number}
		 */
		this.hour24 = now.getHours();
		/**
		 * 現在の分（0～59）
		 * @type {number}
		 */
		this.min = now.getMinutes();
		/**
		 * 現在の秒（0～59）
		 * @type {number}
		 */
		this.sec = now.getSeconds();
		/**
		 * 現在の時（0～11）
		 * @type {number}
		 */
		this.hour = this.hour24 % 12;
		/**
		 * 午前・午後
		 * @type {number}
		 */
		this.ampm = 12 > this.hour24 ? 0 : 1;

		this.ctx.fillStyle = '#ffffff';
		this.ctx.fillRect(-this.centerOffsetX, -this.centerOffsetY, this.width, this.height);
		this._drawClockDial();
		this._drawClockHands();
		this._drawAmPm();
	}

	/**
	 * 文字盤を描く
	 */
	_drawClockDial() {
		const p = this.dialConfig;
		const ctx = this.ctx;
		const hour = this.hour;
		const min = this.min;
		ctx.textBaseline = 'alphabetic'; // ※alphabetic以外の値はブラウザごとに異なる
		// 時のハイライト
		const thour = Math.PI * hour / 6 - this.angleOffset;
		ctx.fillStyle = p.hourHighlightColor;
		ctx.beginPath();
		ctx.arc(
			p.hourPosition * Math.cos(thour), p.hourPosition * Math.sin(thour),
			p.hourHighlightSize * 0.5, 0, Math.PI * 2
		);
		ctx.fill();
		// 分のハイライト
		const tmin = Math.PI * min / 30 - this.angleOffset;
		ctx.fillStyle = p.minHighlightColor;
		ctx.beginPath();
		ctx.arc(
			p.minPosition * Math.cos(tmin), p.minPosition * Math.sin(tmin),
			(min % 5 == 0 ? p.minLargeHighlightSize : p.minHighlightSize) * 0.5,
			0, Math.PI * 2
		);
		ctx.fill();
		// 時
		ctx.fillStyle = p.hourTextColor;
		ctx.font = `${p.hourFontSize}px '${p.hourFontName}'`;
		for (let i = 0; 12 > i; i++) {
			const t = Math.PI * i / 6 - this.angleOffset;
			const c = Math.cos(t), s = Math.sin(t);
			const n = i || 12;
			ctx.fillText(n, p.hourPosition * c, p.hourPosition * s + p.hourFontSize * p.textBaseline);
		}
		// 分（小文字）と目盛り
		ctx.fillStyle = p.minTextColor;
		ctx.strokeStyle = p.markColor;
		ctx.font = `${p.minFontSize}px '${p.minFontName}'`;
		ctx.lineWidth = p.markWidth;
		for (let i = 0; 60 > i; i++) {
			if (i % 5 == 0) continue;
			const t = Math.PI * i / 30 - this.angleOffset;
			const c = Math.cos(t), s = Math.sin(t);
			ctx.fillText(i, p.minPosition * c, p.minPosition * s + p.minFontSize * p.textBaseline);
			ctx.beginPath();
			ctx.moveTo(p.markPosition * c, p.markPosition * s);
			ctx.lineTo((p.markPosition + p.markLength) * c, (p.markPosition + p.markLength) * s);
			ctx.stroke();
		}
		// 分（大文字）と目盛り
		ctx.font = `${p.minLargeFontSize}px '${p.minFontName}'`;
		ctx.lineWidth = p.markBoldWidth;
		for (let i = 0; 60 > i; i += 5) {
			const t = Math.PI * i / 30 - this.angleOffset;
			const c = Math.cos(t), s = Math.sin(t);
			ctx.fillText(i, p.minPosition * c, p.minPosition * s + p.minLargeFontSize * p.textBaseline);
			ctx.beginPath();
			ctx.moveTo(p.markPosition * c, p.markPosition * s);
			ctx.lineTo((p.markPosition + p.markLength) * c, (p.markPosition + p.markLength) * s);
			ctx.stroke();
		}
	}

	/**
	 * 時針・分針・秒針を描く
	 */
	_drawClockHands() {
		const p = this.handsConfig;
		const hour = this.hour;
		const min = this.min;
		const sec = this.sec;
		// 時針
		const thour = Math.PI * (hour * 60 + min) / 360;
		this._drawClockHandsLine(p.hourColor, p.hourWidth, p.hourRearPosition, p.hourTipPosition, thour);
		// 分針
		const tmin = Math.PI * min / 30;
		this._drawClockHandsLine(p.minColor, p.minWidth, p.minRearPosition, p.minTipPosition, tmin);
		// 秒針
		const tsec = Math.PI * sec / 30;
		this._drawClockHandsLine(p.secColor, p.secWidth, p.secRearPosition, p.secTipPosition, tsec);
	}

	/**
	 * 時針・分針・秒針用の線を描く
	 * @param {string} strokeStyle - 線の色（"#nnnnnn"）
	 * @param {number} lineWidth - 線の太さ
	 * @param {number} sr - 針の後端の中心からの距離
	 * @param {number} er - 針の先端の中心からの距離
	 * @param {number} t - 針の角度
	 */
	_drawClockHandsLine(strokeStyle, lineWidth, sr, er, t) {
		const ctx = this.ctx;
		t -= this.angleOffset;
		const c = Math.cos(t), s = Math.sin(t);
		ctx.strokeStyle = strokeStyle;
		ctx.lineWidth = lineWidth;
		ctx.beginPath();
		ctx.moveTo(sr * c, sr * s);
		ctx.lineTo(er * c, er * s);
		ctx.closePath();
		ctx.stroke();
	}

	/**
	 * 午前・午後を描く
	 */
	_drawAmPm() {
		const ctx = this.ctx;
		const p = this.labelConfig;
		ctx.textBaseline = 'alphabetic';
		ctx.fillStyle = p.ampmColor;
		ctx.beginPath();
		ctx.arc(p.ampmPositionX + p.ampmHeight * 0.5, p.ampmPositionY + p.ampmHeight * 0.5, p.ampmHeight * 0.5, 0, Math.PI * 2);
		ctx.arc(p.ampmPositionX + p.ampmHeight * 0.5 + p.ampmWidth, p.ampmPositionY + p.ampmHeight * 0.5, p.ampmHeight * 0.5, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillRect(p.ampmPositionX + p.ampmHeight * 0.5, p.ampmPositionY, p.ampmWidth, p.ampmHeight);
		ctx.fillStyle = p.ampmTextColor;
		ctx.font = `${p.ampmFontSize}px '${p.ampmFontName}'`;
		ctx.fillText(['ごぜん', 'ごご'][this.ampm], p.ampmPositionX + (p.ampmHeight + p.ampmWidth) * 0.5, p.ampmPositionY + p.ampmHeight * 0.5 + p.ampmFontSize * p.textBaseline);
	}

}
