// サンプルデータを返す関数
const loadData = (() => {

	// 値の範囲と変化量
	const params = {
		t: [10, 35, 5], // 気温
		h: [20, 100, 5], // 湿度
		p: [1000, 1030, 1], // 気圧
		c: [400, 1600, 5] // 二酸化炭素濃度
	};

	// ランダムなデータの生成
	const genData = (k, n) => {
		const data = [];
		let [min, max, rand] = params[k];
		const range = max - min;
		// 範囲をランダムに調整
		min += Math.random() * 0.4 * range;
		max -= Math.random() * 0.4 * range;
		// ランダムに変化する値を生成
		let y = 0;
		for (let x = 0; n > x; x++) {
			y += (Math.random() * 2 - 1) * rand;
			data[x] = y;
		}
		// 最初の値と最後の値を一致させる
		const diff = data[n - 1] - data[0];
		let vmin = 1e10, vmax = -1e10;
		for (let x = 0; n > x; x++) {
			data[x] -= diff * x / (n - 1);
			if (vmin > data[x]) vmin = data[x];
			if (data[x] > vmax) vmax = data[x];
		}
		// 最大値と最小値を範囲に一致させる
		for (let x = 0; n > x; x++) {
			data[x] = (data[x] - vmin) * (max - min) / (vmax - vmin) + min;
		}
		return data;
	};

	// 生成する値の個数
	const size = 1440 * 3;

	// 初期データの生成
	const baseData = {
		t: genData('t', size),
		h: genData('h', size),
		p: genData('p', size),
		c: genData('c', size)
	};

	// データ取得ごとに呼ばれる関数
	return function() {
		const data = {};
		const now = Math.floor(Date.now() / 60000);
		for (let i = now - size; now > i; i++) {
			// 時刻に応じて初期データをずらして返す
			const x = i % size;
			data[i] = {
				t: baseData.t[x],
				h: baseData.h[x],
				p: baseData.p[x],
				c: baseData.c[x]
			};
		};
		return data;
	};

})();

export { loadData };
