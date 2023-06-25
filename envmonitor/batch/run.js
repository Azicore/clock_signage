const path = require('path');
const fs = require('fs');
const BME280 = require('./BME280.js');
const MH_Z19C = require('./MH_Z19C.js');
const config = require('./config.js');

// ログファイル
const logFile = new class {
	// ログファイルの設定
	constructor(config) {
		const logFileName = config.logFileName;
		this.LOG_FILE = path.resolve(__dirname, logFileName);
		this.SAVE_PERIOD = config.savePeriod;
		this.CURRENT_MIN = Math.floor(Date.now() / 60000);
		this.obj = {};
		this._load();
	}
	// ログファイルの読み込み
	_load() {
		let obj = {};
		try {
			const data = fs.readFileSync(this.LOG_FILE, 'utf-8');
			obj = JSON.parse(data);
		} catch (e) {
			//
		}
		// 保存期間内のものだけ残す
		for (const m in obj) {
			if (this.CURRENT_MIN - this.SAVE_PERIOD > m) continue;
			this.obj[m] = obj[m];
		}
	}
	// ログファイルへの書き込み
	append(data) {
		this.obj[this.CURRENT_MIN] = data;
		try {
			fs.writeFileSync(this.LOG_FILE, JSON.stringify(this.obj));
		} catch (e) {
			//
		}
	}
}(config);

// センサーからのデータ取得
const getSensorData = async () => {
	// 温湿度気圧センサー
	const envSensor = new BME280();
	let envValues = {};
	if (envSensor.open()) {
		envValues = envSensor.getData();
		envSensor.close();
	}
	const { temperature, pressure, humidity } = envValues;
	// CO2センサー
	const co2Sensor = new MH_Z19C();
	let co2;
	if (await co2Sensor.open()) {
		try {
			co2 = await co2Sensor.getData();
		} catch (e) {
			//
		}
		await co2Sensor.close();
	}
	// 温度と湿度による不快指数の計算
	let thindex;
	if (temperature != null && humidity != null) {
		thindex = 0.81 * temperature + 0.01 * humidity * (0.99 * temperature - 14.3) + 46.3;
	}
	return { temperature, pressure, humidity, thindex, co2 };
};

// バッチ処理
const run = async () => {
	// センサーからのデータ取得
	const data = await getSensorData();
	// ログファイルへ書き込み
	logFile.append({
		t: data.temperature,
		p: data.pressure,
		h: data.humidity,
		i: data.thindex,
		c: data.co2
	});
};

run();
