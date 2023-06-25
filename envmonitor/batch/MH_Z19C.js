const { SerialPort } = require('serialport');

/**
 * CO2センサー「MH-Z19C」からデータを取得するためのクラス
 */
class MH_Z19C {

	/**
	 * 初期化
	 * @param {object} config - 設定オブジェクト（コード内参照）
	 */
	constructor(config) {
		/**
		 * 設定
		 * @type {object}
		 */
		this.config = Object.assign({
			path    : '/dev/serial0',
			baudRate: 9600
		}, config || {});
		/**
		 * 計測値読み取りのコマンド値
		 * @type {number[]}
		 */
		this.CMD_READ = [0xFF, 0x01, 0x86, 0x00, 0x00, 0x00, 0x00, 0x00];
		/**
		 * 自動校正機能ONのコマンド値
		 * @type {number[]}
		 */
		this.CMD_CALIB_ON = [0xFF, 0x01, 0x79, 0xA0, 0x00, 0x00, 0x00, 0x00];
		/**
		 * 自動校正機能OFFのコマンド値
		 * @type {number[]}
		 */
		this.CMD_CALIB_OFF = [0xFF, 0x01, 0x79, 0x00, 0x00, 0x00, 0x00, 0x00];
		/**
		 * シリアルポートから受信した値
		 * @type {number[]}
		 */
		this.res = [];
		/**
		 * シリアルポートの通信オブジェクト
		 * @type {SerialPort}
		 */
		this.port = null;
		/**
		 * シリアルポートに接続できているか
		 * @type {boolean}
		 */
		this.isOpened = false;
		/**
		 * データ受信時のPromise履行関数
		 * @type {function}
		 */
		this.resolve = () => {};
		/**
		 * データ受信時のPromise拒否関数
		 * @type {function}
		 */
		this.reject = () => {};
	}

	/**
	 * 接続を開始する
	 * @return {Promise} 接続成功時はtrueで履行、失敗時はfalseで履行するPromise
	 */
	open() {
		return new Promise((resolve, reject) => {
			const port = new SerialPort(this.config);
			// 接続成功時のハンドラ
			port.on('open', () => {
				this.isOpened = true;
				resolve(true);
			});
			// 接続失敗時のハンドラ
			port.on('error', (err) => {
				this.isOpened = false;
				resolve(false);
			});
			// データ受信時のハンドラ
			port.on('data', (data) => {
				this._receiveData(data);
			});
			this.port = port;
		});
	}

	/**
	 * 接続を終了する
	 * @return {Promise} 成功時と未接続時はundefinedで履行、失敗時はエラー情報で履行するPromise
	 */
	close() {
		return new Promise((resolve, reject) => {
			this.isOpened ? this.port.close(resolve) : resolve();
		});
	}

	/**
	 * チェックサムを計算する
	 * @param {number[]} v - 計算する値の配列
	 * @return {number} チェックサム
	 */
	_checksum(v) {
		return 0x100 - (v[1] + v[2] + v[3] + v[4] + v[5] + v[6] + v[7] & 0xFF) & 0xFF;
	}

	/**
	 * コマンドを送信する
	 * @param {number[]} cmd - 送信するコマンド
	 * @return {Promise} 成功時は履行、失敗時はエラー情報で拒否するPromise
	 */
	_sendCommand(cmd) {
		return new Promise((resolve, reject) => {
			cmd[8] = this._checksum(cmd);
			const data = Buffer.from(cmd);
			this.port.write(data, (err) => {
				err ? reject(err) : resolve();
			});
		});
	}

	/**
	 * データを受信する
	 * @param {number[]} data - 受信したデータ
	 */
	_receiveData(data) {
		const res = this.res;
		for (let i = 0; data.length > i; i++) {
			res.push(data[i]);
			if (res.length != 9) continue;
			if (res[0] == 0xFF && res[1] == 0x86 && res[8] == this._checksum(res)) {
				// CO2濃度（ppm）を計算
				this.resolve(res[2] * 256 + res[3]);
			} else {
				this.reject(`Invalid response data: ${res.map(v => v.toString(16).padStart(2, '0')).join(' ')}`);
			}
			this.res = [];
		}
	}

	/**
	 * 計測値を取得する
	 * @return {Promise} 受信成功時はCO2濃度（ppm）で履行、未接続時はundefinedで履行、受信失敗時はエラー情報で拒否するPromise
	 */
	getData() {
		return new Promise(async (resolve, reject) => {
			this.resolve = resolve;
			this.reject = reject;
			if (!this.isOpened) {
				if (!await this.open()) return resolve();
			}
			try {
				await this._sendCommand(this.CMD_READ);
			} catch (e) {
				reject(e);
			}
		});
	}

	/**
	 * 自動校正機能を設定する
	 * @param {boolean} enabled - trueの場合はON、falseの場合はOFF
	 * @return {Promise} 成功時と未接続時はundefinedで履行、失敗時はエラー情報で拒否するPromise
	 */
	setSelfCalibration(enabled) {
		return new Promise(async (resolve, reject) => {
			if (!this.isOpened) {
				if (!await this.open()) return resolve();
			}
			try {
				const command = enabled ? this.CMD_CALIB_ON : this.CMD_CALIB_OFF;
				await this._sendCommand(command);
				resolve();
			} catch (e) {
				reject(e);
			}
		});
	}

}

module.exports = MH_Z19C;
