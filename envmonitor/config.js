// EnvMonitorの設定
const config = {
	common: {
//		dataSource: '_sampleData.js', // サンプルデータ
		dataSource: 'batch/log.json', // 実測データ
		initialRedrawInterval: 500,   // 初期再描画の間隔（ミリ秒）
		initialRedrawDuration: 5000,  // 初期再描画の継続時間（ミリ秒）
		updateInterval: 30000         // 通常の自動更新の間隔（ミリ秒）
	},
	display: {
		digits: { // 小数点以下の桁数
			t: 1,
			h: 1,
			p: 0,
			c: 0
		},
		invalidValue: '???' // データが不正な場合の表示
	},
	general: {
		xRangeHour        : 24 * 3, // x軸の範囲（時間）
		xTickHour         : 24,     // x軸主目盛の間隔（時間）
		xMinorTickHour    : 6,      // x軸補助目盛の間隔（時間）
		xTickText         : '%Y/%MM/%DD', // x軸主目盛の文字
		xMinorTickText    : '',     // x軸補助目盛の文字
		maxYTicks         : 6,      // Y軸目盛りの最大数
		chartYMargin      : 0,      // グラフの上下端とのマージン（0～1）
		textFont          : 'subsetfont', // 文字のフォント
		textBaselineOffset: 0.3,    // テキストの上下位置のオフセット（0～1）
		yLabel            : { // y軸ラベル
			t: '気温（℃）',
			h: '湿度（%）',
			p: '気圧（hPa）',
			c: '二酸化炭素濃度（ppm）'
		}
	},
	layout: {
		marginTopRatio   : 0.05, // 上マージン（Canvas高さに対する比）
		marginRightRatio : 0.05, // 右マージン（Canvas幅に対する比）
		marginBottomRatio: 0.2,  // 下マージン（Canvas高さに対する比）
		marginLeftRatio  : 0.13, // 左マージン（Canvas幅に対する比）
		scaleUnitRatio   : 0.003 // サイズ基準（Canvas幅か高さいずれか小さい方に対する比）

	},
	size: {
		frameLineSize     :  2, // 枠線の太さ
		dataLineSize      :  5, // グラフの線の太さ
		xTickLineSize     :  1, // x軸主目盛の太さ
		xTickLength       : 10, // x軸主目盛の長さ
		xGridLineSize     :  1, // x軸主目盛のグリッド線の太さ
		xTextSize         : 20, // x軸主目盛の文字の大きさ
		xTextMargin       : 15, // x軸主目盛の文字のマージン
		xMinorTickLineSize:  1, // x軸補助目盛の太さ
		xMinorTickLength  :  5, // x軸補助目盛の長さ
		xMinorTextSize    : 12, // x軸補助目盛の文字の大きさ
		xMinorTextMargin  : 15, // x軸補助目盛の文字のマージン
		yTickLineSize     :  1, // y軸目盛の太さ
		yTickLength       :  0, // y軸目盛の長さ
		yGridLineSize     :  1, // y軸目盛のグリッド線の太さ
		yTextSize         : 20, // y軸目盛の文字の大きさ
		yTextMargin       :  8, // y軸目盛の文字のマージン
		yLabelSize        : 20, // y軸ラベルの文字の大きさ
		yLabelMargin      : 70  // y軸ラベルのマージン

	},
	color: {
		dataLineColor  : { // グラフの線の色
			t: '#f00000',
			h: '#0000f0',
			p: '#f000f0',
			c: '#f09900'
		},
		dataFillColor  : { // グラフの塗りの色
			t: 'rgba(255, 224, 224, 0.8)',
			h: 'rgba(224, 224, 255, 0.8)',
			p: 'rgba(255, 224, 255, 0.8)',
			c: 'rgba(255, 240, 224, 0.8)'
		},
		frameColor     : '#000000', // 枠線の色
		backgroundColor: '#ffffff', // 背景の色
		chartAreaColor : '#fafafa', // グラフエリアの背景の色
		xTickColor     : '#000000', // x軸主目盛の色
		xGridColor     : '#000000', // x軸主目盛のグリッド線の色
		xTextColor     : '#000000', // x軸主目盛の文字の色
		xMinorTickColor: '#000000', // x軸補助目盛の色
		xMinorTextColor: '#000000', // x軸補助目盛の文字の色
		yTickColor     : '#000000', // y軸目盛の色
		yGridColor     : '#000000', // y軸目盛のグリッド線の色
		yTextColor     : '#000000', // y軸目盛の文字の色
	}

};

export { config };
