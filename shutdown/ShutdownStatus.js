/**
 * シャットダウンの手順の進行を管理するクラス
 */
export default class ShutdownStatus {

	/**
	 * 初期化
	 */
	constructor() {
		/**
		 * sessionStorageのキーに使う文字列
		 * @type {string}
		 */
		this.LS_KEY = 'shutdownStatus';
		/**
		 * 手順の各ステップを表す定数
		 * @type {object}
		 */
		this.steps = {
			CONFIRM          : 0, // 最初の画面
			CONFIRM_RESTART  : 1, // 再起動の選択画面
			CONFIRM_SHUTDOWN : 2, // シャットダウンの選択画面
			RESTART          : 3, // 再起動の実行画面
			SHUTDOWN         : 4, // シャットダウンの実行画面
			CANCELED         : 5  // 中止画面
		};
		/**
		 * 直前のステップ
		 * @type {number}
		 */
		this.step = this.steps.CANCELED;
		/**
		 * 直前のステップが開始した時刻
		 * @type {number}
		 */
		this.timestamp = 0;
		// sessionStorageから直前の操作の情報を取得
		try {
			const savedData = sessionStorage.getItem(this.LS_KEY);
			if (savedData) {
				const s = JSON.parse(savedData);
				this.step = s.step;
				this.timestamp = s.timestamp;
			}
		} catch (e) { }
		/**
		 * 直前のステップが開始してからの経過時間
		 * @type {number}
		 */
		this.elapsed = (Date.now() - this.timestamp) / 1000;
	}

	/**
	 * sessionStorageに情報を保存
	 */
	_save() {
		const s = {
			step: this.step,
			timestamp: this.timestamp
		};
		const data = JSON.stringify(s);
		sessionStorage.setItem(this.LS_KEY, data);
	}

	/**
	 * ステップの開始時刻を更新する
	 */
	updateTimestamp() {
		this.timestamp = Date.now();
		this._save();
	}

	/**
	 * ステップを更新する
	 * @param {number} s - ステップ番号
	 */
	updateStep(s) {
		this.step = s;
		this._save();
	}

}
