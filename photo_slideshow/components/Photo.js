/**
 * 写真1枚を表示するHTML要素を表すクラス
 */
export default class Photo {

	/**
	 * 初期化
	 * @param {object} displayConfig - 下記プロパティを含む設定オブジェクト
	 * @param {number} displayConfig.elementWidthRatio - 画面高さに対する要素幅の比
	 * @param {number} displayConfig.elementHeightRatio - 画面高さに対する要素高さの比
	 * @param {number} displayConfig.movingTime - 出現から表示までの移動にかかる時間（ミリ秒）
	 * @param {number} displayConfig.displayingTime - 表示している時間（ミリ秒）
	 */
	constructor(displayConfig) {
		/**
		 * 画面高さに対する要素幅の比
		 * @type {number}
		 */
		this.elementWidthRatio = displayConfig.elementWidthRatio;
		/**
		 * 画面高さに対する要素高さの比
		 * @type {number}
		 */
		this.elementHeightRatio = displayConfig.elementHeightRatio;
		/**
		 * 出現から表示までの移動にかかる時間（ミリ秒）
		 * @type {number}
		 */
		this.movingTime = displayConfig.movingTime;
		/**
		 * 表示している時間（ミリ秒）
		 * @type {number}
		 */
		this.displayingTime = displayConfig.displayingTime;
		/**
		 * img要素を包含するdiv要素
		 * @type {HTMLElement}
		 */
		this.elem = document.createElement('div');
		/**
		 * img要素
		 * @type {HTMLElement}
		 */
		this.img = document.createElement('img');
		/**
		 * 要素がbodyへ挿入済みかどうか
		 * @type {boolean}
		 */
		this.isReady = false;
		/**
		 * transition終了時に呼び出す関数
		 * @type {function}
		 */
		this.transitionendFunc = null;
		// transition終了イベント
		this.elem.addEventListener('transitionend', (e) => {
			// プロパティごとに発生するため、1つのプロパティだけに限定
			if (e.propertyName == 'transform' && typeof this.transitionendFunc == 'function') {
				this.transitionendFunc();
			}
		});
		// CSSの初期設定
		this._setElementStyle({
			textAlign: 'center',
			position: 'absolute',
			opacity: 0
		});
	}

	/**
	 * 一定時間待機する
	 * @param {number} ms - ミリ秒
	 * @return {Promise} 指定ミリ秒数経過したら解決するPromise
	 */
	_wait(ms) {
		return new Promise((resolve, reject) => {
			setTimeout(resolve, ms);
		});
	}

	/**
	 * transitionの終了まで待機する
	 * @return {Promise} transitionが終了したら解決するPromise
	 */
	_waitTransition() {
		return new Promise((resolve, reject) => {
			// transitionendイベント内でコールされる
			this.transitionendFunc = resolve;
		});
	}

	/**
	 * CSSをセットする
	 * @param {object} css - セットするCSS
	 */
	_setElementStyle(css) {
		for (const k in css) {
			this.elem.style[k] = css[k];
		}
	}

	/**
	 * アニメーションのためのCSSをセットする
	 * @param {?boolean} transition - transitionの切り替え（true：出現/消滅時、false：表示時）
	 * @param {?boolean} opacity - opacityの切り替え（true：表示、false：非表示）
	 * @param {Position} position - transformに使う位置と回転角の情報
	 */
	_setAnimationPoint(transition, opacity, position) {
		const css = {};
		// transition
		if (transition != null) {
			const t = transition ? `${this.movingTime}ms ease-in-out` : `${this.displayingTime}ms linear`;
			css.transition = `opacity ${t}, transform ${t}`;
		} else {
			css.transition = 'none';
		}
		// opacity
		if (opacity != null) {
			css.opacity = opacity ? 1 : 0;
		}
		// transform
		css.transform = position.getTransformCss(this.perspective);
		this._setElementStyle(css);
	}

	/**
	 * 要素を更新してアニメーションを開始する
	 * @param {object} windowInfo - ウィンドウサイズに依存する情報
	 * @param {number} windowInfo.width - 現在のウィンドウの幅
	 * @param {number} windowInfo.height - 現在のウィンドウの高さ
	 * @param {number} windowInfo.perspective - 視点位置
	 * @param {string} imagePath - 画像のパス
	 * @param {object} positions - 位置と角度の情報
	 * @param {Position} positions.appearanceStart - 出現時の位置と角度
	 * @param {Position} positions.displayStart - 表示開始時の位置と角度
	 * @param {Position} positions.displayEnd - 表示終了時の位置と角度
	 * @param {Position} positions.appearanceEnd - 消滅時の位置と角度
	 * @return {Promise} 表示が終了した時点で解決するPromise
	 */
	start(windowInfo, imagePath, positions) {
		// ウィンドウサイズを更新
		const windowWidth = windowInfo.width;
		const windowHeight = windowInfo.height;
		this.perspective = windowInfo.perspective;
		const elementWidth = windowHeight * this.elementWidthRatio;
		const elementHeight = windowHeight * this.elementHeightRatio;
		// 位置と大きさを更新
		this._setElementStyle({
			width : `${elementWidth}px`,
			height: `${elementHeight}px`,
			left  : `${(windowWidth - elementWidth) * 0.5}px`,
			top   : `${(windowHeight - elementHeight) * 0.5}px`
		});
		// 画像を更新
		this.img.src = imagePath;
		this.img.style.height = `${elementHeight}px`;
		// 初回はbodyへ挿入
		if (!this.isReady) {
			this.elem.appendChild(this.img);
			document.body.appendChild(this.elem);
			this.isReady = true;
		}
		// アニメーションの開始
		return new Promise(async (resolve, reject) => {
			// 準備
			this._setAnimationPoint(null, false, positions.appearanceStart);
			await this._wait(100);
			// 出現→前面表示
			this._setAnimationPoint(true, true, positions.displayStart);
			await this._waitTransition();
			// 前面表示開始→終了
			this._setAnimationPoint(false, null, positions.displayEnd);
			await this._waitTransition();
			// 前面表示終了→消滅
			resolve();
			this._setAnimationPoint(true, false, positions.appearanceEnd);
		});
	}

}
