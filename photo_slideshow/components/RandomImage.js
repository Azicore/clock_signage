/**
 * ランダムな画像選択を行なうクラス
 */
export default class RandomImage {

	/**
	 * 初期化
	 * @param {object} fileConfig - 下記プロパティを含む設定オブジェクト
	 * @param {string} fileConfig.directory - 画像ファイルのあるディレクトリパス（相対パス）
	 * @param {boolean} fileConfig.manualMode - trueの場合はfilelist.shによるファイルリストの自動更新をしない
	 * @param {number} fileConfig.maxTrial - 画像が読み込めない場合の最大試行回数
	 */
	constructor(fileConfig) {
		/**
		 * 画像ファイルの一覧
		 * @type {string[]}
		 */
		this.files = null;
		/**
		 * 画像ファイルのあるディレクトリパス（相対パス）
		 * @type {string}
		 */
		this.dir = fileConfig.directory;
		/**
		 * 画像が読み込めない場合の最大試行回数
		 * @type {number}
		 */
		this.maxTrial = fileConfig.maxTrial;
		/**
		 * 直前に選択した画像
		 * @type {string}
		 */
		this.prev = '';
		/**
		 * 画像ファイル一覧の準備ができたら解決するPromise
		 * @type {Promise}
		 */
		this.isReady = this._updateFileList(fileConfig.manualMode);
	}

	/**
	 * 画像ファイル一覧を準備する
	 * @param {boolean} isManualMode - trueの場合はファイル一覧の自動更新を行なわない
	 * @return {Promise} 準備が完了したら解決するPromise
	 */
	_updateFileList(isManualMode) {
		return new Promise(async (resolve, reject) => {
			try {
				if (!isManualMode) {
					// 画像ファイル一覧の更新
					await this._sendAjaxRequest({
						method: 'post',
						path: './filelist.sh',
						headers: {
							'X-Command-Exec': 'yes',
							'Content-Type': 'application/json'
						},
						params: [this.dir]
					});
				}
				// 画像ファイル一覧の取得
				const res = await this._sendAjaxRequest({
					method: 'get',
					path: './filelist.json'
				});
				this.files = res.files.filter((f) => f != null);
				resolve();
			} catch (e) {
				reject();
			}
		});
	}

	/**
	 * Ajaxリクエストを実行する
	 * @param {object} req - 下記プロパティを含むオブジェクト
	 * @param {string} req.method - リクエストメソッド
	 * @param {string} req.path - リクエストパス
	 * @param {object} [req.headers] - リクエストヘッダ
	 * @param {string[]} [req.params] - スクリプトに渡す引数
	 * @return {Promise} レスポンスで解決するPromise
	 */
	_sendAjaxRequest(req) {
		return new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();
			xhr.open(req.method, req.path);
			const headers = req.headers || {};
			for (const k in headers) {
				xhr.setRequestHeader(k, headers[k]);
			}
			xhr.responseType = 'json';
			xhr.onload = () => {
				if (xhr.response.ok) {
					resolve(xhr.response);
				} else {
					reject(xhr.response.error);
				}
			};
			xhr.onerror = () => {
				reject();
			};
			req.params ? xhr.send(JSON.stringify({ params: req.params })) : xhr.send();
		});
	}

	/**
	 * 次の画像を選択する
	 * @return {Promise} 選択した画像のパスで解決するPromise
	 */
	select() {
		return new Promise((resolve, reject) => {
			const loadImage = (trial) => {
				// 選択の再試行
				const retry = () => {
					trial > 0 ? loadImage(trial - 1) : reject();
				};
				// ファイルをランダムに選択
				const file = `${this.dir}/${this.files[Math.floor(Math.random() * this.files.length)]}`;
				// 直前と同じ場合は再試行
				if (file == this.prev) {
					retry();
				} else {
					// 画像を事前にロードする
					const img = new Image();
					img.src = file;
					this.prev = file;
					img.onload = () => {
						resolve(file);
					};
					// 読み込み失敗時は再試行
					img.onerror = () => {
						retry();
					};
				}
			};
			this.files ? loadImage(this.maxTrial) : reject();
		});
	}

}
