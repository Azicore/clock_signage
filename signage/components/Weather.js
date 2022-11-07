/**
 * 天気予報
 */
class Weather {

	/**
	 * 初期化
	 * @param {Layout} layout - レイアウト情報（{@link Layout}オブジェクト）
	 * @param {object} config - 設定情報
	 */
	constructor(layout, config) {

		/**
		 * 天気予報の地域
		 * @type {object}
		 */
		this.areaDefinition = {
			areaCode  : config.areaCode,
			amedasCode: config.amedasCode,
			prefCode  : config.prefCode
		};

		/**
		 * 天気コード（APIのコード→独自コードへの変換）
		 * @type {object}
		 */
		this.weatherCodeMapping = {
			/* 1  : 晴れ       */ 100: 1, 123: 1, 124: 1, 130: 1, 131: 1,
			/* 12 : 晴れ｜曇   */ 101: 12, 132: 12,
			/* 13 : 晴れ｜雨   */ 102: 13, 103: 13, 106: 13, 107: 13, 120: 13, 121: 13,
			/* 14 : 晴れ｜雪   */ 104: 14, 105: 14, 160: 14, 170: 14,
			/* 15 : 晴れ｜雷雨 */ 108: 15, 140: 15,
			/* 120: 晴れ→曇   */ 110: 120, 111: 120,
			/* 130: 晴れ→雨   */ 112: 130, 113: 130, 114: 130, 118: 130, 122: 130, 126: 130, 127: 130, 128: 130,
			/* 140: 晴れ→雪   */ 115: 140, 116: 140, 117: 140, 181: 140,
			/* 150: 晴れ→雷雨 */ 119: 150, 125: 150,
			/* 2  : 曇         */ 200: 2, 209: 2, 231: 2,
			/* 21 : 曇｜晴れ   */ 201: 21, 223: 21,
			/* 23 : 曇｜雨     */ 202: 23, 203: 23, 206: 23, 207: 23, 220: 23, 221: 23,
			/* 24 : 曇｜雪     */ 204: 24, 205: 24, 250: 24, 260: 24, 270: 24,
			/* 25 : 曇｜雷雨   */ 208: 25, 240: 25,
			/* 210: 曇→晴れ   */ 210: 210, 211: 210,
			/* 230: 曇→雨     */ 212: 230, 213: 230, 214: 230, 218: 230, 222: 230, 224: 230, 225: 230, 226: 230,
			/* 240: 曇→雪     */ 215: 240, 216: 240, 217: 240, 228: 240, 229: 240, 230: 240, 281: 240,
			/* 250: 曇→雷雨   */ 219: 250,
			/* 3  : 雨         */ 300: 3, 304: 3, 328: 3, 329: 3,
			/* 31 : 雨｜晴れ   */ 301: 31,
			/* 32 : 雨｜曇     */ 302: 32,
			/* 34 : 雨｜雪     */ 303: 34, 309: 34, 322: 34,
			/* 310: 雨→晴れ   */ 311: 310, 316: 310, 320: 310, 323: 310, 324: 310, 325: 310,
			/* 320: 雨→曇     */ 313: 320, 317: 320, 321: 320,
			/* 340: 雨→雪     */ 314: 340, 315: 340, 326: 340, 327: 340,
			/* 4  : 雪         */ 400: 4, 405: 4, 406: 4, 407: 4, 425: 4, 426: 4, 427: 4, 450: 4, 340: 4,
			/* 41 : 雪｜晴れ   */ 401: 41,
			/* 42 : 雪｜曇     */ 402: 42,
			/* 43 : 雪｜雨     */ 403: 43, 409: 43,
			/* 410: 雪→晴れ   */ 411: 410, 420: 410, 361: 410,
			/* 420: 雪→曇     */ 413: 420, 421: 420, 371: 420,
			/* 430: 雪→雨     */ 414: 430, 422: 430, 423: 430,
			/* 5  : 雷雨       */ 350: 5,
			/* 7  : 暴風雨     */ 306: 7, 308: 7
		};

		/**
		 * ブロック要素
		 * @type {HTMLElement}
		 */
		this.elem = document.createElement('div');
		/**
		 * 今日の天気
		 * @type {HTMLElement}
		 */
		this.iconToday = document.createElement('div');
		/**
		 * 今日の気温
		 * @type {HTMLElement}
		 */
		this.tempToday = document.createElement('div');
		/**
		 * 今日の降水確率
		 * @type {HTMLElement}
		 */
		this.rainToday = document.createElement('div');
		/**
		 * 明日の天気
		 * @type {HTMLElement}
		 */
		this.iconTomorrow = document.createElement('div');
		/**
		 * 明日の気温
		 * @type {HTMLElement}
		 */
		this.tempTomorrow = document.createElement('div');
		/**
		 * 明日の降水確率
		 * @type {HTMLElement}
		 */
		this.rainTomorrow = document.createElement('div');
		/**
		 * CSS変数設定用の要素
		 * @type {HTMLElement}
		 */
		this.root = document.querySelector(':root');

		const elem = this.elem;
		elem.id = 'weather';
		document.body.appendChild(elem);
		const titleToday = document.createElement('div');
		const titleTomorrow = document.createElement('div');
		titleToday.innerHTML = 'きょう';
		titleTomorrow.innerHTML = 'あした';
		const iconToday = this.iconToday;
		const tempToday = this.tempToday;
		const rainToday = this.rainToday;
		const iconTomorrow = this.iconTomorrow;
		const tempTomorrow = this.tempTomorrow;
		const rainTomorrow = this.rainTomorrow;
		elem.appendChild(titleToday);
		elem.appendChild(iconToday);
		elem.appendChild(tempToday);
		elem.appendChild(rainToday);
		elem.appendChild(titleTomorrow);
		elem.appendChild(iconTomorrow);
		elem.appendChild(tempTomorrow);
		elem.appendChild(rainTomorrow);

		// CSSの設定
		this._setStyle(elem, {
			background  : '#ffffff',
			fontFamily  : 'subsetfont'
		});
		this._setStyle(titleToday, {
			width     : '100%',
			height    : 'var(--weather-title-height)',
			marginTop : 'var(--weather-today)',
			fontSize  : 'var(--weather-title-height)',
			lineHeight: 'var(--weather-title-height)',
			textAlign : 'center'
		});
		this._setStyle(titleTomorrow, {
			width     : '100%',
			height    : 'var(--weather-title-height)',
			marginTop : 'var(--weather-tomorrow)',
			fontSize  : 'var(--weather-title-height)',
			lineHeight: 'var(--weather-title-height)',
			textAlign : 'center'
		});
		this._setStyle([iconToday, iconTomorrow], {
			width    : 'var(--weather-icon)',
			height   : 'var(--weather-icon)',
			margin   : 'var(--weather-icon-margin) auto 0px',
			position : 'relative'
		});
		this._setStyle([tempToday, rainToday, tempTomorrow, rainTomorrow], {
			width     : '100%',
			height    : 'var(--weather-text-height)',
			marginTop : 'var(--weather-text-margin)',
			fontSize  : 'var(--weather-text-height)',
			lineHeight: 'var(--weather-title-height)',
			textAlign : 'center'
		});

		// リサイズハンドラの登録
		layout.registerResizeHandler((layout) => {
			this.resize(layout);
		});

		// 自動更新（2時間ごと）
		if (!config.debug) {
			setInterval(() => {
				this.update();
			}, 72e5);
		} else {
			this.debug = config.debug;
		}
		this.update();

	}

	/**
	 * リサイズハンドラ
	 * @param {Layout} layout - レイアウト情報（{@link Layout}オブジェクト）
	 */
	resize(layout) {
		const h = layout.h1 / 100; // 設定値の基準となる値
		const c = {
			todayPosition     : 0 | h * 8,   // 今日の天気の上端
			tomorrowPosition  : 0 | h * 54,  // 明日の天気の上端
			titleHeight       : 0 | h * 5,   // タイトル文字の高さ
			textHeight        : 0 | h * 4,   // テキスト情報の高さ
			iconMargin        : 0 | h * 2,   // タイトルとアイコンの間隔
			textMargin        : 0 | h * 2,   // アイコンとテキストの間隔
			iconSize          : 0 | h * 20,  // アイコンの一辺の長さ
			iconSize1         : 0 | h * 16,  // 「A時々B」のAのアイコンの一辺の長さ
			iconSize2         : 0 | h * 10,  // 「A時々B」のBのアイコンの一辺の長さ
			iconSize3         : 0 | h * 14,  // 「AのちB」のAのアイコンの一辺の長さ
			iconSize4         : 0 | h * 14,  // 「AのちB」のBのアイコンの一辺の長さ
			iconArrowPosition : 0 | h * 11   // 「AのちB」の矢印の縦位置
		};
		this._setStyle(this.elem, {
			top         : `${layout.y1}px`,
			left        : `${layout.x3}px`,
			width       : `${layout.w3}px`,
			height      : `${layout.h1}px`,
			borderRadius: `${layout.br}px`
		});
		// CSSの可変値を変更
		this._setRootStyle({
			weatherTitleHeight   : `${c.titleHeight}px`,
			weatherToday         : `${c.todayPosition}px`,
			weatherTomorrow      : `${c.tomorrowPosition - c.todayPosition - c.titleHeight - c.iconMargin - c.iconSize - 2 * (c.textHeight + c.textMargin)}px`,
			weatherIcon          : `${c.iconSize}px`,
			weatherIconSize1     : `${c.iconSize1}px`,
			weatherIconSize2     : `${c.iconSize2}px`,
			weatherIconSize3     : `${c.iconSize3}px`,
			weatherIconSize4     : `${c.iconSize4}px`,
			weatherIconArrow     : `${c.iconArrowPosition}px`,
			weatherIconMargin    : `${c.iconMargin}px`,
			weatherTextHeight    : `${c.textHeight}px`,
			weatherTextMargin    : `${c.textMargin}px`,
			weatherHighTempColor : '#ff3333',
			weatherLowTempColor  : '#3333ff'
		});
	}

	/**
	 * CSSを設定
	 * @param {(HTMLElement|HTMLElement[])} elems - 対象の要素
	 * @param {object} css - CSSの値
	 */
	_setStyle(elems, css) {
		if (!Array.isArray(elems)) elems = [elems];
		for (const elem of elems) {
			for (const i in css) {
				elem.style[i] = css[i];
			}
		}
	}

	/**
	 * CSS変数を変更
	 * @param {object} css - CSS変数の値
	 */
	_setRootStyle(css) {
		for (const i in css) {
			const p = '--' + i.replace(/([A-Z])/g, (str, s1) => `-${s1.toLowerCase()}`);
			this.root.style.setProperty(p, css[i]);
		}
	}

	/**
	 * 日時文字列の生成
	 * @param {number} dateOffset - 0が今日、1が明日、2が明後日
	 * @param {number} hour - 時
	 * @param {number} min - 分
	 * @return {string} 「YYYY-MM-DDThh:mm:ss+09:00」の文字列
	 */
	_getDateStr(dateOffset, hour, min) {
		const d = new Date();
		if (dateOffset > 0) d.setTime(d.getTime() + 864e5 * dateOffset);
		d.setHours(hour);
		d.setMinutes(min);
		d.setSeconds(0);
		d.setMilliseconds(0);
		d.setTime(d.getTime() - d.getTimezoneOffset() * 60000);
		return `${d.toISOString().slice(0, 19)}+09:00`;
	}

	/**
	 * 気温の表示
	 * @param {boolean} isHigh - trueなら最高気温、falseなら最低気温
	 * @param {number} temp - 気温
	 * @return {HTMLElement} span要素
	 */
	_getColoredTemp(isHigh, temp) {
		const e = document.createElement('span');
		const val = isHigh ? 'weather-high-temp-color' : 'weather-low-temp-color';
		this._setStyle(e, {
			color: `var(--${val})`
		});
		e.innerHTML = `${temp == null ? '-' : temp}℃`;
		return e;
	}

	/**
	 * 天気予報データの取得
	 * @return {Promise} APIからのレスポンスで解決するPromise
	 */
	_getWeatherData() {
		return new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();
			xhr.open('get', `https://www.jma.go.jp/bosai/forecast/data/forecast/${this.areaDefinition.prefCode}.json`);
			xhr.responseType = 'json';
			xhr.onload = () => {
				resolve(xhr.response);
			};
			xhr.onerror = () => {
				reject();
			};
			xhr.send();
		});
	}

	/**
	 * 天気予報の更新
	 */
	async update() {
		const areaCode = this.areaDefinition.areaCode;
		const amedasCode = this.areaDefinition.amedasCode;
		const forecastData = await this._getWeatherData();
		// 天気コード（[0]: 今日 / [1]: 明日）※不明な場合はnull
		const weatherCode = this.debug ? this.debug[0] : (() => {
			const def = forecastData[0].timeSeries[0].timeDefines;
			const weatherData = forecastData[0].timeSeries[0].areas.find(val => val.area.code == areaCode).weatherCodes;
			const dateDefs = [this._getDateStr(0, 0, 0), this._getDateStr(1, 0, 0)];
			const index = dateDefs.map(date => def.findIndex(val => val.slice(0, 10) == date.slice(0, 10)));
			return index.map(index => index >= 0 && weatherData[index] !== '' ? weatherData[index] : null);
		})();
		// 気温（[0]: 今日の最高 / [1]: 明日の最低 / [2]: 明日の最高）※不明な場合はnull
		const temp = this.debug ? this.debug[1] : (() => {
			const def = forecastData[0].timeSeries[2].timeDefines;
			const tempData = forecastData[0].timeSeries[2].areas.find(val => val.area.code == amedasCode).temps;
			const dateDefs = [this._getDateStr(0, 9, 0), this._getDateStr(1, 0, 0), this._getDateStr(1, 9, 0)];
			const index = dateDefs.map(date => def.findIndex(val => val == date));
			return index.map(index => index >= 0 && tempData[index] !== '' ? tempData[index] : null);
		})();
		// 降水確率（[0]: 今日 / [1]: 明日）※不明な場合は0未満
		const rain = this.debug ? this.debug[2] : (() => {
			const def = forecastData[0].timeSeries[1].timeDefines;
			const rainData = forecastData[0].timeSeries[1].areas.find(val => val.area.code == areaCode).pops;
			const dateDefsToday = [this._getDateStr(0, 0, 0), this._getDateStr(0, 6, 0), this._getDateStr(0, 12, 0), this._getDateStr(0, 18, 0)];
			const dateDefsTomorrow = [this._getDateStr(1, 0, 0), this._getDateStr(1, 6, 0), this._getDateStr(1, 12, 0), this._getDateStr(1, 18, 0)];
			const indexToday = dateDefsToday.map(date => def.findIndex(val => val == date));
			const indexTomorrow = dateDefsTomorrow.map(date => def.findIndex(val => val == date));
			return [
				Math.max(...indexToday.map(index => index >= 0 && rainData[index] !== '' ? +rainData[index] : null).filter(val => val != null)),
				Math.max(...indexTomorrow.map(index => index >= 0 && rainData[index] !== '' ? +rainData[index] : null).filter(val => val != null))
			];
		})();

		// 天気アイコンの表示
		const iconDir = 'weather_icons';
		for (let i = 0; weatherCode.length > i; i++) {
			const e = this[['iconToday', 'iconTomorrow'][i]];
			e.innerHTML = '';
			const code = weatherCode[i];
			if (code == null) continue;
			let weather = this.weatherCodeMapping[code];
			if (weather == null) continue;
			// 一日中同じ天気の場合
			if (10 > weather) {
				// 「晴れ」かつ猛暑日の場合は、アイコンを変更
				if (weather == 1 && temp[[0, 2][i]] >= 35) weather = 6;
				const img = document.createElement('img');
				img.src = `${iconDir}/${weather}.png`;
				this._setStyle(img, {
					width : 'var(--weather-icon)',
					height: 'var(--weather-icon)'
				});
				e.appendChild(img);
			// 「時々」「一時」の場合
			} else if (100 > weather) {
				const img1 = document.createElement('img');
				const img2 = document.createElement('img');
				img1.src = `${iconDir}/${weather / 10 | 0}.png`;
				img2.src = `${iconDir}/${weather % 10}.png`;
				this._setStyle(img1, {
					width   : 'var(--weather-icon-size1)',
					height  : 'var(--weather-icon-size1)',
					position: 'absolute',
					left    : '0px',
					top     : '0px'
				});
				this._setStyle(img2, {
					width   : 'var(--weather-icon-size2)',
					height  : 'var(--weather-icon-size2)',
					position: 'absolute',
					left    : 'calc(var(--weather-icon) - var(--weather-icon-size2))',
					top     : 'calc(var(--weather-icon) - var(--weather-icon-size2))'
				});
				e.appendChild(img2);
				e.appendChild(img1);
			// 「のち」の場合
			} else {
				weather /= 10;
				const img1 = document.createElement('img');
				const img2 = document.createElement('img');
				const img3 = document.createElement('img'); // 矢印用
				img1.src = `${iconDir}/${weather / 10 | 0}.png`;
				img2.src = `${iconDir}/${weather % 10}.png`;
				img3.src = `${iconDir}/0.png`; // 矢印画像
				this._setStyle(img1, {
					width   : 'var(--weather-icon-size3)',
					height  : 'var(--weather-icon-size3)',
					position: 'absolute',
					left    : '0px',
					top     : '0px'
				});
				this._setStyle(img2, {
					width   : 'var(--weather-icon-size4)',
					height  : 'var(--weather-icon-size4)',
					position: 'absolute',
					left    : 'calc(var(--weather-icon) - var(--weather-icon-size4))',
					top     : 'calc(var(--weather-icon) - var(--weather-icon-size4))'
				});
				this._setStyle(img3, {
					width   : 'calc(var(--weather-icon) - var(--weather-icon-size4))',
					height  : 'calc(var(--weather-icon) - var(--weather-icon-size4))',
					position: 'absolute',
					left    : '0px',
					top     : 'var(--weather-icon-arrow)'
				});
				e.appendChild(img1);
				e.appendChild(img2);
				e.appendChild(img3);
			}
		}

		// 気温の表示
		this.tempToday.innerHTML = '';
		this.tempToday.insertAdjacentElement('beforeend', this._getColoredTemp(true, temp[0]));
		this.tempTomorrow.innerHTML = '';
		this.tempTomorrow.insertAdjacentElement('beforeend', this._getColoredTemp(false, temp[1]));
		this.tempTomorrow.insertAdjacentHTML('beforeend', ' / ');
		this.tempTomorrow.insertAdjacentElement('beforeend', this._getColoredTemp(true, temp[2]));

		// 降水確率の表示
		this.rainToday.innerHTML = `${0 > rain[0] ? '-' : rain[0]}%`;
		this.rainTomorrow.innerHTML = `${0 > rain[1] ? '-' : rain[1]}%`;
	}

}
