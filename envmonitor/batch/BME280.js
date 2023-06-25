const i2c = require('i2c-bus');

/**
 * 温湿度気圧センサー「BME280」からデータを取得するためのクラス
 */
class BME280 {

	/**
	 * 初期化
	 * @param {number} [i2cAddress=0x77] - I2Cアドレス（デフォルト：0x77）
	 * @param {number} [i2cBusNumber=1] - I2Cバス番号（デフォルト：1）
	 * @param {object} [config] - 設定オブジェクト（コード内参照）
	 */
	constructor(i2cAddress, i2cBusNumber, config) {
		/**
		 * 設定
		 * @type {object}
		 */
		this.config = Object.assign({
			osrsT  : 1, // Temperature oversampling x 1
			osrsP  : 1, // Pressure oversampling x 1
			osrsH  : 1, // Humidity oversampling x 1
			mode   : 3, // Normal mode
			tsb    : 5, // Tstandby 1000ms
			filter : 0, // Filter off
			spi3wen: 0  // 3-wire SPI disable
		}, config || {});
		/**
		 * I2Cアドレス
		 * @type {number}
		 */
		this.i2cAddress = i2cAddress != null ? i2cAddress : 0x77;
		/**
		 * I2Cバス番号
		 * @type {number}
		 */
		this.i2cBusNumber = i2cBusNumber != null ? i2cBusNumber : 1;
		/**
		 * I2Cバスオブジェクト
		 * @type {Bus}
		 */
		this.bus = null;
		/**
		 * I2Cと接続できたかどうか
		 * @type {boolean}
		 */
		this.isOpened = false;
		/**
		 * 温度の補正用パラメーター
		 * @type {number[]}
		 */
		this.digT = [];
		/**
		 * 気圧の補正用パラメーター
		 * @type {number[]}
		 */
		this.digP = [];
		/**
		 * 湿度の補正用パラメーター
		 * @type {number[]}
		 */
		this.digH = [];
		/**
		 * 高精度の温度情報
		 * @type {number}
		 */
		this.tfine = 0;
		/**
		 * 2の累乗
		 * @type {number[]}
		 */
		this.POWER_OF_TWO = (() => {
			const p = [1];
			for (let n = 1; 34 >= n; n++) {
				p[n] = p[n - 1] * 2;
			}
			return p;
		})();
	}

	/**
	 * 接続を開始する
	 * @return {boolean} 接続成功した場合はtrue、接続できない場合はfalse
	 */
	open() {
		try {
			this.bus = i2c.openSync(this.i2cBusNumber);
			this._setUp();
			this._getCalibrationParameters();
			this.isOpened = true;
		} catch (e) {
			this.isOpened = false;
		}
		return this.isOpened;
	}

	/**
	 * 接続を終了する
	 */
	close() {
		if (!this.isOpened) return;
		this.bus.closeSync();
	}

	/**
	 * I2C接続から読み取る
	 * @param {number} addr - 読み取るアドレス
	 * @return {number} 読み取った値
	 */
	_readReg(addr) {
		return this.bus.readByteSync(this.i2cAddress, addr);
	}

	/**
	 * I2C接続に書き込む
	 * @param {number} addr - 書き込むアドレス
	 * @param {number} data - 書き込む値
	 */
	_writeReg(addr, data) {
		this.bus.writeByteSync(this.i2cAddress, addr, data);
	}

	/**
	 * センサーの初期設定をする
	 */
	_setUp() {
		const config = this.config;
		const ctrlMeasReg = config.osrsT << 5 | config.osrsP << 2 | config.mode;
		const configReg = config.tsb << 5 | config.filter << 2 | config.spi3wen;
		const ctrlHumReg = config.osrsH;
		this._writeReg(0xF2, ctrlHumReg);
		this._writeReg(0xF4, ctrlMeasReg);
		this._writeReg(0xF5, configReg);
	}

	/**
	 * センサーの補正用パラメーターを取得する
	 */
	_getCalibrationParameters() {
		const data = new DataView(new ArrayBuffer(32));
		let n = 0;
		for (let i = 0; 24 > i; i++) {
			data.setUint8(n++, this._readReg(0x88 + i));
		}
		data.setUint8(n++, this._readReg(0xA1));
		for (let i = 0; 7 > i; i++) {
			data.setUint8(n++, this._readReg(0xE1 + i));
		}
		this.digT = [
			data.getUint16(0, true),
			data.getInt16(2, true),
			data.getInt16(4, true)
		];
		this.digP = [
			data.getUint16(6, true),
			data.getInt16(8, true),
			data.getInt16(10, true),
			data.getInt16(12, true),
			data.getInt16(14, true),
			data.getInt16(16, true),
			data.getInt16(18, true),
			data.getInt16(20, true),
			data.getInt16(22, true)
		];
		this.digH = [
			data.getInt8(24),
			data.getInt16(25, true),
			data.getInt8(27),
			data.getUint8(28) << 4 | 0x0F & data.getUint8(29),
			data.getUint8(30) << 4 | 0x0F & data.getUint8(29) >> 4,
			data.getInt8(31)
		];
	}

	/**
	 * 気温（℃）を計算する
	 * @param {number} adcT - センサーから取得した数値
	 * @return {number} 気温（℃）
	 */
	_calculateTemperature(adcT) {
		let t = 0;
		const _2 = this.POWER_OF_TWO;
		const digT = this.digT;
		const v1 = (adcT / _2[14] - digT[0] / _2[10]) * digT[1];
		const v2 = Math.pow(adcT / _2[17] - digT[0] / _2[13], 2) * digT[2];
		t = v1 + v2;
		this.tfine = t;
		t /= 5120;
		return t;
	}

	/**
	 * 気圧（hPa）を計算する
	 * @param {number} adcP - センサーから取得した数値
	 * @return {number} 気圧（hPa）
	 */
	_calculatePressure(adcP) {
		let p = 0;
		const _2 = this.POWER_OF_TWO;
		const digP = this.digP;
		const v1 = this.tfine / 2 - 64000;
		const v2 = (v1 * v1 * digP[5] / _2[15] + v1 * digP[4] * _2[1]) / _2[2] + digP[3] * _2[16];
		const v3 = (1 + (v1 * v1 * digP[2] / _2[19] + v1 * digP[1]) / _2[34]) * digP[0];
		if (v3 > 0) {
			const v4 = (_2[20] - adcP - v2 / _2[12]) * 6250 / v3;
			p = v4 + (v4 * v4 * digP[8] / _2[31] + v4 * digP[7] / _2[15] + digP[6]) / _2[4];
		}
		p /= 100;
		return p;
	}

	/**
	 * 湿度（%）を計算する
	 * @param {number} adcH - センサーから取得した数値
	 * @return {number} 湿度（%）
	 */
	_calculateHumidity(adcH) {
		let h = 0;
		const _2 = this.POWER_OF_TWO;
		const digH = this.digH;
		const v1 = this.tfine - 76800;
		const v2 = adcH - (digH[3] * _2[6] + v1 * digH[4] / _2[14]);
		const v3 = 1 + v1 * digH[2] / _2[26];
		const v4 = 1 + v1 * digH[5] / _2[26] * v3;
		const v5 = v2 * v4 * digH[1] / _2[16];
		h = v5 * (1 - v5 * digH[0] / _2[19]);
		if (h > 100) h = 100;
		if (0 > h) h = 0;
		return h;
	}

	/**
	 * 全ての計測値を取得する
	 * @return {object} 下記のプロパティを含むオブジェクト
	 * @property {number} temperature 気温（℃）
	 * @property {number} pressure 気圧（hPa）
	 * @property {number} humidity 湿度（%）
	 * @property {boolean} error I2C未接続時はtrue
	 */
	getData() {
		if (!this.isOpened) return { error: true };
		const data = [];
		for (let i = 0; 8 > i; i++) {
			data.push(this._readReg(0xF7 + i));
		}
		const temperature = this._calculateTemperature(data[3] << 12 | data[4] << 4 | data[5] >> 4);
		const pressure = this._calculatePressure(data[0] << 12 | data[1] << 4 | data[2] >> 4);
		const humidity = this._calculateHumidity(data[6] << 8 | data[7]);
		return { temperature, pressure, humidity };
	}

}

module.exports = BME280;
