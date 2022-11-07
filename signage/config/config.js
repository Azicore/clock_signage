window.Config = {

	calendar: {
		// テスト用（表示する年、月、日を指定）
		//debug: [2022, 12, 1]
	},

	clock: {
		// テスト用（表示する時、分、秒を指定）
		//debug: [12, 34, 56]
	},

	weather: {
		// テスト用（表示する天気コード、気温、降水確率を指定）
		//debug: [[101, 201], [24, 12, 25], [10, 20]],

		// 天気予報の地域
		// ※地域の設定方法：
		// (1) https://www.jma.go.jp/bosai/common/const/area.json にアクセス。
		// (2) .class20s[key1].nameが目的の市区町村になってるkey1を探し、.class20s[key1].parentをkey2とする。
		// (3) .class15s[key2].parentをareaCodeとする。
		// (4) .class10s[areaCode].parentをprefCodeとする。
		// (5) https://www.jma.go.jp/bosai/forecast/const/forecast_area.json にアクセス。
		// (6) [prefCode][n].class10がareaCodeとなってるnを探して、[prefCode][n].amedas[0]をamedasCodeとする。
		areaCode  : 130010,
		amedasCode: 44132,
		prefCode  : 130000
	},

	message: {
		//
	}

};
