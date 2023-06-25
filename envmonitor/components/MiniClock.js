
/**
 * 小デジタル時計のクラス
 */
export default class MiniClock {

	/**
	 * 初期化
	 */
	constructor() {
		/**
		 * 時計を表示するHTML要素
		 * @type {HTMLElement}
		 */
		this.elem = document.getElementById('clock');
	}

	/**
	 * 表示を更新する
	 */
	_update() {
		const d = new Date();
		const hour = `${d.getHours()}`.padStart(2, '0');
		const min  = `${d.getMinutes()}`.padStart(2, '0');
		const sec  = `${d.getSeconds()}`.padStart(2, '0');
		this.elem.innerText = `${hour}:${min}:${sec}`;
	}

	/**
	 * 時計を開始する
	 */
	start() {
		setInterval(() => {
			this._update();
		}, 500);
	}

}
