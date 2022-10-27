window.Holidays = [
	[2022,  1,  1, "がんじつ"],
	[2022,  1, 10, "せいじんのひ"],
	[2022,  2, 11, "けんこくきねんのひ"],
	[2022,  2, 23, "てんのうたんじょうび"],
	[2022,  3, 21, "しゅんぶんのひ"],
	[2022,  4, 29, "しょうわのひ"],
	[2022,  5,  3, "けんぽうきねんび"],
	[2022,  5,  4, "みどりのひ"],
	[2022,  5,  5, "こどものひ"],
	[2022,  7, 18, "うみのひ"],
	[2022,  8, 11, "やまのひ"],
	[2022,  9, 19, "けいろうのひ"],
	[2022,  9, 23, "しゅうぶんのひ"],
	[2022, 10, 10, "スポーツのひ"],
	[2022, 11,  3, "ぶんかのひ"],
	[2022, 11, 23, "きんろうかんしゃのひ"],
	[2023,  1,  1, "がんじつ"],
	[2023,  1,  2, "ふりかえきゅうじつ"],
	[2023,  1,  9, "せいじんのひ"],
	[2023,  2, 11, "けんこくきねんのひ"],
	[2023,  2, 23, "てんのうたんじょうび"],
	[2023,  3, 21, "しゅんぶんのひ"],
	[2023,  4, 29, "しょうわのひ"],
	[2023,  5,  3, "けんぽうきねんび"],
	[2023,  5,  4, "みどりのひ"],
	[2023,  5,  5, "こどものひ"],
	[2023,  7, 17, "うみのひ"],
	[2023,  8, 11, "やまのひ"],
	[2023,  9, 18, "けいろうのひ"],
	[2023,  9, 23, "しゅうぶんのひ"],
	[2023, 10,  9, "スポーツのひ"],
	[2023, 11,  3, "ぶんかのひ"],
	[2023, 11, 23, "きんろうかんしゃのひ"]
].map((val) => {
	val[4] = new Date(val[0], val[1] - 1, val[2]).getTime();
	return val;
});
