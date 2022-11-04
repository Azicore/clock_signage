/**
 * カレンダー
 */
class Calendar {

	/**
	 * 初期化
	 * @param {Layout} layout - レイアウト情報（{@link Layout}オブジェクト）
	 * @param {Array[]} holidays - 祝日情報（config/holidays.js が window.Holidays に定義した配列）
	 * @param {number[]} debug - 表示テスト用
	 */
	constructor(layout, holidays, debug) {

		/**
		 * Device Pixel Ratio
		 * @type {number}
		 */
		this.dpr = 2;

		/**
		 * ブロック要素
		 * @type {HTMLElement}
		 */
		this.elem = document.createElement('div');

		/**
		 * Canvas要素
		 * @type {HTMLElement}
		 */
		this.canv = document.createElement('canvas');

		/**
		 * Canvasコンテキスト
		 * @type {CanvasRenderingContext2D}
		 */
		this.ctx = this.canv.getContext('2d');

		/**
		 * 祝日情報
		 * @type {Array[]}
		 */
		this.holidays = holidays; // 国民の祝日

		/**
		 * 月ごとの背景色
		 * @type {Array[]}
		 */
		this.backgroundColors = [
			['#ffffff', '#ff90b5', '#fffcf0'], //  1月
			['#ffffff', '#acdaff', '#e4fffe'], //  2月
			['#ffffff', '#81ff70', '#fbffb0'], //  3月
			['#ffffff', '#ffe3f3', '#ffd8d8'], //  4月
			['#ffffff', '#40fb5d', '#c6ffbb'], //  5月
			['#ffffff', '#ffdef8', '#e9cdff'], //  6月
			['#ffffff', '#95bcff', '#ffffc8'], //  7月
			['#ffffff', '#f7f7f7', '#9ad1ff'], //  8月
			['#ffffff', '#d09ad7', '#ffeebf'], //  9月
			['#ffffff', '#efefef', '#ffd1a5'], // 10月
			['#ffffff', '#b8d5ab', '#efebe8'], // 11月
			['#ffffff', '#9fff97', '#ffa9a9']  // 12月
		];

		/**
		 * CSS変数設定用の要素
		 * @type {HTMLElement}
		 */
		this.root = document.querySelector(':root');

		/**
		 * body要素
		 * @type {HTMLElement}
		 */
		this.body = document.body;

		this.elem.id = 'calendar';
		this.body.appendChild(this.elem);
		this.resize(500); // サイズは要素生成のための仮値
		this.elem.appendChild(this.canv);

		// 背景パターンの初期設定
		this.body.style.backgroundRepeat = 'repeat';
		this.body.style.backgroundImage = `linear-gradient(-45deg,
			var(--background-a)  0%, var(--background-a) 10%,
			var(--background-b) 10%, var(--background-b) 20%,
			var(--background-a) 20%, var(--background-a) 30%,
			var(--background-c) 30%, var(--background-c) 50%,
			var(--background-a) 50%, var(--background-a) 60%,
			var(--background-b) 60%, var(--background-b) 70%,
			var(--background-a) 70%, var(--background-a) 80%,
			var(--background-c) 80%, var(--background-c) 100%
		)`;

		// 自動更新
		if (!debug) {
			setInterval(() => {
				this.draw();
			}, 999);
		} else {
			this.debug = debug;
			this.draw();
		}

		// リサイズハンドラの登録
		layout.registerResizeHandler((layout) => {
			this.resize(layout);
		});
	}

	/**
	 * リサイズハンドラ
	 * @param {Layout} layout - レイアウト情報（{@link Layout}オブジェクト）
	 */
	resize(layout) {

		/**
		 * Canvasの幅
		 * @type {number}
		 */
		this.width = layout.w1 * this.dpr;
		/**
		 * Canvasの高さ
		 * @type {number}
		 */
		this.height = layout.h1 * this.dpr;

		this.canv.width = this.width;
		this.canv.height = this.height;
		this.canv.style.width = `${layout.w1}px`;
		this.canv.style.height = `${layout.h1}px`;
		this.canv.style.borderRadius = `${layout.br}px`;
		this.elem.style.left = `${layout.x1}px`;
		this.elem.style.top = `${layout.y1}px`;
		this.ctx.textAlign = 'center';
		this.body.style.backgroundSize = `${layout.bg}px ${layout.bg}px`; // 背景パターンのサイズ
		const w = this.width / 600; // 設定値の基準となる値
		const font = 'subsetfont';

		/**
		 * レイアウトの設定
		 * @type {object}
		 */
		this.calendarConfig = {
			yearPosition         : w * 60,    // 年の文字の位置（上端からの距離）
			yearOffset           : w * -210,  // 年の文字の位置（左右中央からのずれ）
			yearFontSize         : w * 22,    // 年のフォントサイズ
			yearFontName         : font,      // 年のフォント
			yearTextColor        : '#999999', // 月の文字色
			monthPosition        : w * 60,    // 月の文字の位置（上端からの距離）
			monthOffset          : w * -24,   // 月の文字の位置（左右中央からのずれ）
			monthFontSize        : w * 56,    // 月のフォントサイズ
			monthFontName        : font,      // 月のフォント
			monthTextColor       : '#000000', // 月の文字色
			monthHighlightSize   : w * 88,    // 月のハイライトの直径
			monthHighlightColor  : '#ccff33', // 月のハイライトの色
			monthSuffixPosition  : w * 65,    // 「がつ」の文字の位置（上端からの距離）
			monthSuffixOffset    : w * 56,    // 「がつ」の文字の位置（左右中央からのずれ）
			monthSuffixFontSize  : w * 32,    // 「がつ」の文字のフォントサイズ
			monthSuffixFontName  : font,      // 「がつ」の文字のフォント
			monthSuffixTextColor : '#000000', // 「がつ」の文字の文字色
			weekPosition         : w * 140,   // 曜日の文字の位置（上端からの距離）
			weekFontSize         : w * 24,    // 曜日のフォントサイズ
			weekFontName         : font,      // 曜日のフォント
			sundayTextColor      : '#f00000', // 休日の文字色
			weekdayTextColor     : '#000000', // 平日の文字色
			saturdayTextColor    : '#0000f0', // 土曜日の文字色
			weekMargin           : w * 56,    // 曜日と最初の週の間の距離
			weekInterval         : w * 70,    // 週と週の間の距離
			sideMargin           : w * 64,    // 週の左右端からの距離
			dateFontSize         : w * 36,    // 日のフォントサイズ
			dateFontName         : font,      // 日のフォント
			dateHighlightSize    : w * 64,    // 日のハイライトの直径
			dateHighlightColor   : '#ffcccc', // 日のハイライトの色
			textBaseline         : 0.35       // 文字の上下位置の調整（※textBaselineバグ対策）
		};
		this.draw(true);
	}

	/**
	 * 描画
	 * @param {boolean} force - trueなら無条件に再描画
	 */
	draw(force) {

		// 現在日時
		const now = !this.debug ? new Date() : new Date(this.debug[0], this.debug[1] - 1, this.debug[2]);
		const year = now.getFullYear();
		const mon = now.getMonth();
		const date = now.getDate();
		// 日付に変更が無ければ何もしない
		if (!force && this.year == year && this.mon == mon && this.date == date) return;

		/**
		 * 現在の年
		 * @type {number}
		 */
		this.year = year;
		/**
		 * 現在の月（0～11）
		 * @type {number}
		 */
		this.mon = mon;
		/**
		 * 現在の日
		 * @type {number}
		 */
		this.date = date;

		this.ctx.fillStyle = '#ffffff';
		this.ctx.fillRect(0, 0, this.width, this.width);
		let wcol, wrow;
		for (now.setDate(1); now.getMonth() == this.mon; now.setTime(now.getTime() + 864e5)) {
			const d = now.getDate();
			// 前月の日を「・」で描画
			if (d == 1) {
				const dow = now.getDay();
				wcol = 0;
				wrow = 0;
				for (; dow > wcol; wcol++) {
					this._drawDate(wcol, wrow, null);
				}
			}
			this._drawDate(wcol, wrow, d);
			wcol = (wcol + 1) % 7;
			if (wcol == 0) wrow++;
		}
		// 次月の日を「・」で描画
		if (wcol != 0) {
			for (; 7 > wcol; wcol++) {
				this._drawDate(wcol, wrow, null);
			}
		}
		this._drawDayOfWeek();
		this._drawMonth();
		this._drawYear();
		this._setBackground();
	}

	/**
	 * 文字の描画
	 * @param {string} text - 描画する文字
	 * @param {number} x - 描画するx座標
	 * @param {number} y - 描画するy座標
	 * @param {string} color - 文字色（"#nnnnnn"）
	 * @param {number} size - フォントサイズ
	 * @param {string} font - フォント名
	 */
	_drawText(text, x, y, color, size, font) {
		const ctx = this.ctx;
		ctx.textBaseline = 'alphabetic'; // ※alphabetic以外の値はブラウザごとに異なる
		ctx.fillStyle = color;
		ctx.font = `${size}px '${font}'`;
		ctx.fillText(text, x, y);
	}

	/**
	 * 背景円の描画
	 * @param {number} x - 描画するx座標
	 * @param {number} y - 描画するy座標
	 * @param {string} color - 色（"#nnnnnn"）
	 * @param {number} size - 直径
	 */
	_drawHighlight(x, y, color, size) {
		const ctx = this.ctx;
		ctx.fillStyle = color;
		ctx.beginPath();
		ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
		ctx.fill();
	}

	/**
	 * 日付の描画
	 * @param {number} col - 何曜日か
	 * @param {number} row - 何週目か
	 * @param {?number} d - 日
	 */
	_drawDate(col, row, d) {
		const p = this.calendarConfig;
		// 祝日かどうか
		const isHoliday = this.holidays.some((val) => val[0] == this.year && val[1] == this.mon + 1 && val[2] == d);
		// 当日なら背景円を描画
		if (d == this.date) {
			this._drawHighlight(
				col * (this.width - p.sideMargin * 2) / 6 + p.sideMargin,
				row * p.weekInterval + p.weekPosition + p.weekMargin,
				p.dateHighlightColor, p.dateHighlightSize
			);
		}
		this._drawText(d || '・',
			col * (this.width - p.sideMargin * 2) / 6 + p.sideMargin,
			row * p.weekInterval + p.weekPosition + p.weekMargin + p.dateFontSize * p.textBaseline,
			col == 0 || isHoliday ? p.sundayTextColor : col == 6 ? p.saturdayTextColor : p.weekdayTextColor,
			p.dateFontSize, p.dateFontName
		);
	}

	/**
	 * 曜日の描画
	 */
	_drawDayOfWeek() {
		const days = ['にち', 'げつ', 'か', 'すい', 'もく', 'きん', 'ど'];
		const p = this.calendarConfig;
		for (let i = 0; days.length > i; i++) {
			this._drawText(days[i],
				i * (this.width - p.sideMargin * 2) / 6 + p.sideMargin,
				p.weekPosition + p.weekFontSize * p.textBaseline,
				i == 0 ? p.sundayTextColor : i == 6 ? p.saturdayTextColor : p.weekdayTextColor,
				p.weekFontSize, p.weekFontName
			);
		}
	}

	/**
	 * 月の描画
	 */
	_drawMonth() {
		const monthSuffix = 'がつ';
		const p = this.calendarConfig;
		this._drawHighlight(this.width * 0.5 + p.monthOffset, p.monthPosition, p.monthHighlightColor, p.monthHighlightSize);
		this._drawText(this.mon + 1, this.width * 0.5 + p.monthOffset, p.monthPosition + p.monthFontSize * p.textBaseline, p.monthTextColor, p.monthFontSize, p.monthFontName);
		this._drawText(monthSuffix, this.width * 0.5 + p.monthSuffixOffset, p.monthSuffixPosition + p.monthSuffixFontSize * p.textBaseline, p.monthSuffixTextColor, p.monthSuffixFontSize, p.monthSuffixFontName);
	}

	/**
	 * 年の描画
	 */
	_drawYear() {
		const yearSuffix = 'ねん';
		const p = this.calendarConfig;
		this._drawText(`${this.year} ${yearSuffix}`, this.width * 0.5 + p.yearOffset, p.yearPosition + p.yearFontSize * p.textBaseline, p.yearTextColor, p.yearFontSize, p.yearFontName);
	}

	/**
	 * 背景パターンの変更
	 */
	_setBackground() {
		const mon = this.debug ? this.debug[1] - 1 : this.mon;
		const color = this.backgroundColors[mon];
		this.root.style.setProperty('--background-a', color[0]);
		this.root.style.setProperty('--background-b', color[1]);
		this.root.style.setProperty('--background-c', color[2]);
	}

}
