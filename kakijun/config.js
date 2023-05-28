// Kakijunの設定
const config = {
	config: {
		randomOrder   : true,
		charSizeRatio : 0.15,
		lineWidthRatio: 0.1,
		drawSpeed     : 13,
		eraseSpeed    : 5,
		strokeWait    : 400,
		charWait      : 500,
		displayWait   : 2500
	},
	stringGroups: [
		{
			name: 'ひらがな',
			list: ['あいうえお', 'かきくけこ', 'さしすせそ', 'たちつてと', 'なにぬねの', 'はひふへほ', 'まみむめも', 'やゆよ', 'らりるれろ', 'わをん']
		},
		{
			name: 'カタカナ',
			list: ['アイウエオ', 'カキクケコ', 'サシスセソ', 'タチツテト', 'ナニヌネノ', 'ハヒフヘホ', 'マミムメモ', 'ヤユヨ', 'ラリルレロ', 'ワヲン']
		}
	]
};

export { config };
