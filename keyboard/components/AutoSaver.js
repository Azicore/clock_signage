/**
 * 自動保存機能のクラス
 */
export default class AutoSaver {

	/**
	 * 初期化
	 * @param {Keyboard} keyboard - Keyboardオブジェクト
	 */
	constructor(keyboard) {
		/**
		 * localStorageのキー
		 * @type {string}
		 */
		this.LS_KEY = 'signage_keyboard';
		/**
		 * 自動保存の間隔（ms）
		 * @type {number}
		 */
		this.INTERVAL = 3000;
		/**
		 * Keyboardオブジェクト
		 * @type {Keyboard}
		 */
		this.keyboard = keyboard;
	}

	/**
	 * 現在の状態を保存する
	 * @param {string} text - 保存するテキスト
	 * @param {number} line - カーソルの行番号
	 * @param {number} position - カーソルの位置
	 */
	save(text, line, position) {
		//console.log({ text, line, position });
		const data = JSON.stringify({ text, line, position });
		localStorage.setItem(this.LS_KEY, data);
	}

	/**
	 * 保存してあった状態を取得する
	 * @return {object} 保存してあった状態
	 * @property {string} text テキスト
	 * @property {number} line カーソルの行番号
	 * @property {number} position カーソルの位置
	 */
	restore() {
		const data = localStorage.getItem(this.LS_KEY);
		let obj;
		try {
			obj = JSON.parse(data);
		} catch (e) {
			obj = {};
		}
		return Object.assign({ text: '', line: 0, position: 0 }, obj);
	}

	/**
	 * 自動保存を開始する
	 */
	start() {
		setInterval(() => {
			if (this.keyboard.isInputting) return;
			const text = this.keyboard.fixedText;
			const line = this.keyboard.cursor.lines;
			const position = this.keyboard.cursor.chars;
			this.save(text, line, position);
		}, this.INTERVAL);
	}

}
