import LineChart from './LineChart.js';

/**
 * 各センサーのグラフを表示するクラス
 */
export default class EnvMonitor {

	/**
	 * 初期化
	 * @param {object} config - config.jsによる設定オブジェクト
	 */
	constructor(config) {
		/**
		 * 表示するデータの種類を表すキー（t：気温、h：湿度、p：気圧、c：二酸化炭素濃度）
		 * @type {string[]}
		 */
		this.chartTypes = ['t', 'h', 'p', 'c'];
		/**
		 * 各グラフを表す{@link LineChart}オブジェクト
		 * @type {LineChart[]}
		 */
		this.lineCharts = [];
		/**
		 * 最新の値を表示するためのHTML要素
		 * @type {HTMLElement[]}
		 */
		this.valueElements = [];
		/**
		 * データの種類ごとの設定
		 * @type {object}
		 */
		this.config = {};
		/**
		 * センサーのデータ
		 * @type {object}
		 */
		this.data = {};
		// 設定オブジェクトを初期化
		this._loadConfig(config);
		for (let i = 0; this.chartTypes.length > i; i++) {
			const chartType = this.chartTypes[i];
			// 折れ線グラフを初期化
			this.lineCharts[i] = new LineChart(document.getElementById(`chart${i + 1}`), this.config[chartType]);
			// 最新の値を表示するためのHTML要素を取得
			this.valueElements[i] = document.getElementById(`chart${i + 1}_value`);
			this.data[chartType] = {};
		}
		// リサイズ対応
		window.addEventListener('resize', () => {
			for (let i = 0; this.chartTypes.length > i; i++) {
				this.lineCharts[i].resize();
			}
			this.update(false);
		});
	}

	/**
	 * 設定オブジェクトを読み込む
	 * @param {object} allConfig - コンストラクタに渡された設定オブジェクト
	 */
	_loadConfig(allConfig) {
		// commonキーはそのままコピー
		this.config.common = allConfig.common;
		// それ以外はデータの種類ごとに設定を分割
		for (let i = 0; this.chartTypes.length > i; i++) {
			const chartType = this.chartTypes[i];
			this.config[chartType] = {};
			for (const configType in allConfig) {
				if (configType == 'common') continue;
				const subConfig = allConfig[configType];
				this.config[chartType][configType] = {};
				for (const key in subConfig) {
					const value = subConfig[key];
					this.config[chartType][configType][key] = typeof value == 'object' ? value[chartType] : value;
				}
			}
		}
	}

	/**
	 * センサーのデータを読み込む
	 */
	async _loadData() {
		// データファイルのパス
		const dataSource = this.config.common.dataSource;
		let data;
		// *.jsの場合は、exportされたloadData()を呼び出して取得
		if (/\.js$/.test(dataSource)) {
			if (!this.dataSource) this.dataSource = await import(`../${dataSource}`);
			data = this.dataSource.loadData();
		// *.jsonの場合は、そのまま丸ごとオブジェクトとして取得
		} else {
			data = await (await fetch(dataSource)).json();
		}
		// データの種類ごとに分割
		for (const x in data) {
			for (let i = 0; this.chartTypes.length > i; i++) {
				const chartType = this.chartTypes[i];
				this.data[chartType][x] = data[x][chartType];
			}
		}
	}

	/**
	 * グラフを更新する
	 * @param {boolean} refresh - trueの場合はデータを更新、falseの場合は再描画のみ行なう
	 */
	async update(refresh) {
		// データ更新して再描画
		if (refresh) {
			// 現在時刻（1分前）のエポック分
			const now = Math.floor(Date.now() / 60000) - 1;
			// データの読み込み
			await this._loadData();
			// 全てのグラフのデータを更新して再描画
			for (let i = 0; this.chartTypes.length > i; i++) {
				const chartType = this.chartTypes[i];
				const data = this.data[chartType];
				const config = this.config[chartType];
				this.lineCharts[i].update(data);
				this.valueElements[i].innerText = typeof data[now] == 'number' ? data[now].toFixed(config.display.digits) : config.display.invalidValue;
			}
		// 再描画のみ
		} else {
			for (let i = 0; this.chartTypes.length > i; i++) {
				this.lineCharts[i].update();
			}
		}
	}

	/**
	 * グラフの自動更新を開始する
	 */
	start() {
		const config = this.config.common;
		// 初回の更新
		this.update(true);
		// 最初は高頻度で再描画を行なう（※フォント読み込み対策）
		const timer = setInterval(() => {
			this.update(false);
		}, config.initialRedrawInterval);
		// 一定時間経過後は低頻度で更新
		setTimeout(() => {
			clearInterval(timer);
			setInterval(() => {
				this.update(true);
			}, config.updateInterval);
		}, config.initialRedrawDuration);
	}

}
