// Calendar用の設定
export const calendar = {
	// テスト用（表示する年、月、日を指定）
	//debug: [2022, 12, 1]
};

// Clock用の設定
export const clock = {
	// テスト用（表示する時、分、秒を指定）
	//debug: [12, 34, 56]
};

// Weather用の設定
export const weather = {
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
};

// Message用の設定
export const message = {
	// メッセージの更新間隔（秒）
	updateInterval: 15,

	// サーバーメッセージのJSONのURL（任意）
	// ※サーバー側にCORS対応が必要
	// ※機能を使わない場合は空文字を設定する
	// ※サーバー上に設置するJSONのフォーマット：
	// {
	//   "messages": [
	//     {
	//       "time": "2022-11-01T12:34:00",
	//       "text": "この　じこくに　にんいの　メッセージを　ひょうじ！"
	//     },
	//     ...
	//   ]
	// }
	serverMessageUrl: '',

	// サーバーメッセージのJSONを確認するタイミング（hhmmssに対する正規表現）
	serverCheckTiming: /(?:00|15|30|45)00$/
};
