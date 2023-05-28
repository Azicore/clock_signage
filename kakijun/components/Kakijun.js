import StrokeOrderAnimation from './StrokeOrderAnimation.js';
import Stroke from './Stroke.js';
import EraserAnimation from './EraserAnimation.js';

/**
 * 全体のアニメーションを統括するクラス
 */
export default class Kakijun {

	/**
	 * 初期化
	 * @param {HTMLCanvasElement} canvasElement - 描画するcanvas要素
	 * @param {object} strokeData - 筆画のデータ（strokeData.jsの中身）
	 * @param {String[]} stringList - 描画する文字列の配列
	 * @param {object} config - 下記プロパティを含む設定オブジェクト
	 * @param {boolean} config.randomOrder - 順番をランダムにするかどうか
	 * @param {number} config.charSizeRatio - ウィンドウの幅に対する文字の大きさの割合
	 * @param {number} config.lineWidthRatio - 文字の大きさに対する線の太さの割合
	 * @param {number} config.drawSpeed - 描画スピード
	 * @param {number} config.eraseSpeed - 消去スピード
	 * @param {number} config.strokeWait - 筆画と筆画の間の時間（ミリ秒）
	 * @param {number} config.charWait - 文字と文字の間の時間（ミリ秒）
	 * @param {number} config.displayWait - 描画後の表示時間（ミリ秒）
	 */
	constructor(canvasElement, strokeData, stringList, config) {
		/**
		 * 筆画のデータ（strokeData.jsの中身）
		 * @type {object}
		 */
		this.strokeData = strokeData;
		/**
		 * 描画する文字列の配列
		 * @type {String[]}
		 */
		this.stringList = stringList;
		/**
		 * 次に描画する文字列の配列
		 * @type {String[]}
		 */
		this.stringQueue = [];
		/**
		 * 設定オブジェクト
		 * @type {object}
		 */
		this.config = Object.assign({
			// デフォルト値
			charSizeRatio : 0.15,
			lineWidthRatio: 0.1,
			drawSpeed     : 20,
			eraseSpeed    : 5,
			strokeWait    : 400,
			charWait      : 500,
			displayWait   : 2500
		}, config || {});
		/**
		 * 描画するcanvas要素
		 * @type {HTMLCanvasElement}
		 */
		this.elCanvas = canvasElement;
		/**
		 * Canvasコンテキスト
		 * @type {CanvasRenderingContext2D}
		 */
		this.ctx = this.elCanvas.getContext('2d');

		// リサイズ対応
		window.addEventListener('resize', () => {
			this._updateWindowSize();
		});
		this._updateWindowSize();
	}

	/**
	 * リサイズ対応
	 */
	_updateWindowSize() {
		/**
		 * ウィンドウの幅
		 * @type {number}
		 */
		this.windowWidth = document.documentElement.clientWidth;
		/**
		 * ウィンドウの高さ
		 * @type {number}
		 */
		this.windowHeight = document.documentElement.clientHeight;
		/**
		 * 文字のサイズ
		 * @type {number}
		 */
		this.charSize = this.windowWidth * this.config.charSizeRatio;
		/**
		 * 線の太さ
		 * @type {number}
		 */
		this.lineWidth = this.charSize * this.config.lineWidthRatio;

		// canvasサイズの再設定
		this.elCanvas.width = this.windowWidth;
		this.elCanvas.height = this.windowHeight;
	}

	/**
	 * 次に描画する文字列を選択する
	 * @return {object} 下記のプロパティを含むオブジェクト
	 * @property {string} str 選択された文字列
	 * @property {number} x 描画する位置のx座標
	 * @property {number} y 描画する位置のy座標
	 */
	_select() {
		// キューが空に無くなった場合は再選択
		if (this.stringQueue.length == 0) {
			// ランダムの場合
			if (this.config.randomOrder) {
				for (let i = 0; this.stringList.length > i; i++) {
					const pos = Math.floor(Math.random() * (this.stringQueue.length + 1));
					this.stringQueue.splice(pos, 0, this.stringList[i]);
				}
			// 順序通りの場合
			} else {
				for (let i = 0; this.stringList.length > i; i++) {
					this.stringQueue.push(this.stringList[i]);
				}
			}
		}
		// キューの先頭から1つずつ選択
		const selectedString = this.stringQueue.shift();
		// 位置を決定
		const x = Math.floor(Math.random() * (this.windowWidth - this.charSize * selectedString.length));
		const y = Math.floor(Math.random() * (this.windowHeight - this.charSize));
		return { str: selectedString, x, y };
	}

	/**
	 * 文字列を描画する
	 * @param {object} selected - _select()が返すオブジェクト
	 */
	async _draw(selected) {
		const config = this.config;
		// 1文字ずつ描画
		for (let i = 0; selected.str.length > i; i++) {
			let strokeOrder = new StrokeOrderAnimation(this.ctx, this.strokeData[selected.str[i]].map(s => new Stroke(s)), {
				x: selected.x + this.charSize * i,
				y: selected.y,
				width: this.charSize,
				height: this.charSize
			}, {
				speed: config.drawSpeed,
				lineWidth: this.lineWidth
			});
			await strokeOrder.start(config.strokeWait);
			// 字の間と最後に待ち時間を入れる
			await strokeOrder.wait(i == selected.str.length - 1 ? config.displayWait : config.charWait);
		}
	}

	/**
	 * 消去のアニメーションを描画する
	 * @param {object} selected - _select()が返すオブジェクト
	 */
	async _erase(selected) {
		let eraser = new EraserAnimation(this.ctx, {
			x: selected.x,
			y: selected.y,
			size: this.charSize,
			length: selected.str.length
		}, {
			speed: this.config.eraseSpeed
		});
		await eraser.start();
	}

	/**
	 * 全てのアニメーションを開始する
	 */
	async start() {
		// 選択・描画・消去をくり返す
		while (true) {
			const selected = this._select();
			await this._draw(selected);
			await this._erase(selected);
		}
	}

}
