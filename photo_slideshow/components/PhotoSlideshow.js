import RandomPosition from './RandomPosition.js';
import RandomImage from './RandomImage.js';
import Photo from './Photo.js';

/**
 * 写真の3Dスライドショー
 */
export default class PhotoSlideshow {

	/**
	 * 初期化
	 * @param {object} config - 下記プロパティを含む設定オブジェクト
	 * @param {object} config.common - 視点位置と奥行きの設定
	 * @param {object} config.position - {@link RandomPosition}で使用する設定
	 * @param {object} config.display - {@link Photo}で使用する設定
	 * @param {object} config.file - {@link RandomImage}で使用する設定
	 */
	constructor(config) {
		/**
		 * ウィンドウ高さに対する視点位置の比
		 * @type {number}
		 */
		this.perspectiveRatio = config.common.perspectiveRatio;
		/**
		 * ウィンドウ高さに対する奥行きの比
		 * @type {number}
		 */
		this.depthRatio = config.common.depthRatio;
		/**
		 * 出現位置決定のためのオブジェクト
		 * @type {RandomPosition}
		 */
		this.randomPosition = new RandomPosition(config.position);
		/**
		 * 画像ファイル選択のためのオブジェクト
		 * @type {RandomImage}
		 */
		this.randomImage = new RandomImage(config.file);
		/**
		 * 画像を表示するHTML要素（2つを交互に使用）
		 * @type {Photo[]}
		 */
		this.elems = [
			new Photo(config.display),
			new Photo(config.display)
		];
	}

	/**
	 * アニメーション（無限ループ）を開始する
	 */
	start() {
		// 使用する要素の番号（0または1）
		let n = 0;
		const show = async () => {
			// 毎回ウィンドウの情報を更新
			const windowWidth = document.documentElement.clientWidth;
			const windowHeight = document.documentElement.clientHeight;
			const windowInfo = {
				width : windowWidth,
				height: windowHeight,
				perspective: windowHeight * this.perspectiveRatio,
				depth: windowHeight * this.depthRatio
			};
			// 画像パスを決定
			const imagePath = await this.randomImage.select();
			// 出現位置と消滅位置を決定
			const positions = this.randomPosition.select(windowInfo);
			// 表示を開始
			await this.elems[n].start(windowInfo, imagePath, positions);
			// 2つの要素を交互に使用
			n ^= 1;
			show();
		};
		this.randomImage.isReady.then(show);
	}

}
