const messages = [

	// ※説明用：
	{
		// 日時などの条件に基づいてメッセージの優先度を決定する関数（必須）。
		// 引数pの内容は、components/Message.jsのupdate()を参照。
		cond: (p) => {
			// 戻り値は以下の形のオブジェクト。
			return {
				// 優先度を表す整数。0は表示しない。1以上は最も高いものが選択される。
				// -1以下は1以上が無い場合に選択候補となり、絶対値が小さいほど選択されやすい。
				condition: 0,
				// 任意。後述のtext()やicon()に渡すオブジェクト。
				values: {}
			};
			// 戻り値にnumberを返した場合は、{ condition: n }を返したものと解釈する。
		},

		// cond()に基づいて表示が確定した後、実際に表示するテキストを決定する関数（必須）。
		// 引数pはcond()と同じ。selectはcomponents/Message.jsの_select()。
		// valは、cond()がvaluesで返したオブジェクト。
		text: (p, select, val) => {
			return 'テキスト';
		},

		// テキストに伴うアイコンを決定する関数（必須）。
		// 引数はtext()と同じ。
		icon: (p, select, val) => {
			return 'icon.png';
		},

		// メッセージと同時に鳴らすサウンドを決定する関数（任意）。
		// 引数はtext()と同じ。
		sound: (p, select, val) => {
			// 空文字を返すと何も再生しない。
			return 'sound.mp3';
		}
	},
	
	// ▼サーバーメッセージ
	{
		cond: (p) => {
			const key = `${p.dateStr}${p.timeStr}`;
			if (p.serverMessages[key]) {
				return { condition: 10, values: p.serverMessages[key] };
			} else {
				return 0;
			}
		},
		text: (p, select, val) => val,
		icon: (p) => 'tora.png',
		sound: (p) => 'notification.mp3'
	},
	// ▼生活時間お知らせ
	{
		cond: (p) => {
			const msgs = {
				0: 'あさの　6じ　30ぷんに　なったよ！　おはよう！',
				1: 'おはよう！　ちゃんと　おきたかな？',
				2: 'よるの　9じに　なったよ！　おやすみなさい！',
				3: 'よるの　9じを　すぎてるよ！　もう　ねたかな？'
			};
			const time = {
				'063030': 0,
				'064530': 1,
				'070030': 1,
				'071530': 1,
				'210030': 2,
				'211530': 3,
				'213030': 3,
				'214530': 3
			};
			if (time[p.timeStr] != null) {
				return { condition: 8, values: msgs[time[p.timeStr]] };
			} else {
				return 0;
			}
		},
		text: (p, select, val) => val,
		icon: (p) => 'lion.png'
	},
	// ▼祝日お知らせ
	{
		cond: (p) => {
			const tomorrow = p.holidays.filter((val) => p.utime >= val[4] - 864e5 && val[4] > p.utime);
			const today = p.holidays.filter((val) => p.utime >= val[4] && val[4] + 864e5 > p.utime);
			if (today[0]) {
				return {
					condition: -2,
					values: `きょうは　「${today[0][3]}」　だから　おやすみのひ　だよ！`
				};
			} else if (tomorrow[0]) {
				return {
					condition: -4,
					values: `あしたは　「${tomorrow[0][3]}」　だから　おやすみのひ　だよ！`
				};
			} else {
				return 0;
			}
		},
		text: (p, select, val) => val,
		icon: (p) => 'panda.png'
	},
	// ▼時報
	{
		cond: (p) => /[03]000$/.test(p.timeStr) ? 4 : 0,
		text: (p) => {
			if (p.hour % 12 == 0 && p.min == 0) {
				return `${['まよなかの', 'おひるの'][p.ampm]}　12じ　です！`;
			} else {
				const h = p.min == 0 ? '' : '　30ぷん';
				return `${['ごぜん', 'ごご'][p.ampm]}　${p.hour % 12}じ${h}　です！`;
			}
		},
		icon: (p) => 'niwatori.png',
		sound: (p) => p.timeStr > '0000' && '0600' > p.timeStr ? '' : `time_${p.min == 0 ? '00' : '30'}.mp3`
	},
	// ▼時間問いかけ
	{
		cond: (p) => -1,
		text: (p, select) => {
			return select([
				[2, 'きょうは　なんがつ　なんにち　かな？'],
				[2, 'きょうは　なんようび　かな？'],
				[1, 'いまは　なんじ　なんふん　かな？']
			]);
		},
		icon: (p) => 'usagi.png'
	},
	// ▼知識
	{
		cond: (p) => -2,
		text: (p, select) => {
			return select([
				[1, '「59ふん」の　つぎは　また　「0ふん」に　もどって　じが　かわるよ。'],
				[1, '「30ぷん」の　ことを　「はん」と　いうよ。'],
				[1, '「1じかん」は　「60ぷん」と　おなじ　ながさ　だよ。'],
				[1, 'とけいの　ながい　はりが　1しゅうすると　「1じかん」　だよ。'],
				[1, 'おひるの　12じより　まえが　「ごぜん」で　あとが　「ごご」　だよ。'],
				[1, '「12じ」は　「0じ」とも　いうよ。'],
				[1, '「ごぜん　0じ」に　ひづけが　かわるよ。'],
				[1, '「1にち」は　「24じかん」　あるよ。'],
				[1, '「あした」の　つぎの　ひは　「あさって」と　いうよ。'],
				[1, '「きのう」の　まえの　ひは　「おととい」と　いうよ。'],
				[1, '「どようび」の　つぎは　また　「にちようび」に　もどるよ。'],
				[1, 'にちようび　から　どようび　までの　ことを　「1しゅうかん」と　いうよ。'],
				[1, '「31にち」が　ある　つきと　ない　つきが　あるよ。'],
				[1, '「12がつ」の　つぎは　「1がつ」に　もどって　あたらしい　としに　なるよ。'],
				[2, '「1にち」は　「ついたち」　「2にち」は　「ふつか」と　いうよ。'],
				[2, '「3にち」は　「みっか」　「4にち」は　「よっか」と　いうよ。'],
				[2, '「5にち」は　「いつか」　「6にち」は　「むいか」と　いうよ。'],
				[2, '「7にち」は　「なのか」　「8にち」は　「ようか」と　いうよ。'],
				[2, '「9にち」は　「ここのか」　「10にち」は　「とおか」と　いうよ。'],
				[2, '「20にち」は　「はつか」と　いうよ。']
			]);
		},
		icon: (p) => 'buta.png'
	},
	// ▼クイズ
	{
		cond: (p) => -8,
		text: (p, select) => {
			return select([
				// 足し算
				[1, () => {
					const x = Math.floor(Math.random() * 9) + 1;
					const y = Math.floor(Math.random() * (10 - x)) + 1;
					return `もんだい　です！　${x}　たす　${y}　は　いくつ　かな？`;
				}],
				// 同じものさがし
				[1, () => {
					const s = Math.floor(Math.random() * 2);
					const chars = [
						[['□', '■'], ['△', '▲'], ['○', '●'], ['☆', '★']],
						[1, 2, 3, 4, 5, 6, 7, 8, 9]
					][s];
					const name = ['かたち', 'すうじ'][s];
					const cand = [];
					for (let i = 0; 4 > i; i++) {
						const n = Math.floor(Math.random() * chars.length);
						cand.push(chars.splice(n, 1)[0]);
					}
					const ans = cand[Math.floor(Math.random() * cand.length)];
					cand.splice(Math.floor(Math.random() * (cand.length + 1)), 0, ans);
					return `もんだい　です！　おなじ　${name}は　どれかな？　${
						cand.map((c) => Array.isArray(c) ? c[Math.floor(Math.random() * 2)] : c).join('　')
					}`;
				}]
			])();
		},
		icon: (p) => 'hitsuji.png'
	},
	// ▼季節と行事
	{
		cond: (p) => {
			// 節分と立春（2018～2057年）
			const setsubun = p.year % 4 == 1 ? ['0201', '0202', '0203'] : ['0202', '0203', '0204'];
			// 夏至（2020～2055年）
			const geshi = '0621';
			// 冬至（1989～2061年）
			const toji = p.year % 4 == 0 || p.year % 4 == 1 && p.year >= 2029 ? '1221' : '1222';
			// 母の日（5月第2日曜）
			const haha = p.mon == 5 && p.date >= 8 && 14 >= p.date && p.dow == 0 ? p.dateStr : '0000';
			const msgs = [
				// 行事（予告）
				['0120', setsubun[0], 'そろそろ　「せつぶん」の　きせつ　だね！'],
				['0220', '0302', 'そろそろ　「ひなまつり」の　きせつ　だね！'],
				['0620', '0706', 'そろそろ　「たなばた」の　きせつ　だね！'],
				['1001', '1030', 'そろそろ　「ハロウィン」の　きせつ　だね！'],
				['1201', '1223', 'そろそろ　「クリスマス」の　きせつ　だね！'],
				['1226', '1231', 'もうすぐ　あたらしい　としに　なるよ！'],
				// 行事（当日）
				['0101', '0101', 'あけまして　おめでとう！　おしょうがつ　だね！'],
				['0101', '0101', `きょうから　${p.year}ねん　だよ！`],
				[setsubun[1], setsubun[1], 'きょうは　「せつぶん」　だよ！'],
				[setsubun[2], setsubun[2], 'きょうは　「りっしゅん」　だよ！'],
				['0303', '0303', 'きょうは　「ひなまつり」　だよ！'],
				[haha,   haha,   'きょうは　「ははのひ」　だよ！'],
				[geshi,  geshi,  'きょうは　「げし」　だよ！'],
				['0707', '0707', 'きょうは　「たなばた」　だよ！'],
				['1031', '1031', 'きょうは　「ハロウィン」　だよ！'],
				[toji,   toji,   'きょうは　「とうじ」　だよ！'],
				['1224', '1224', 'きょうは　「クリスマス・イブ」　だよ！'],
				['1225', '1225', 'メリー　クリスマス！'],
				['1231', '1231', 'きょうは　「おおみそか」　だよ！'],
				// 自然
				['0315', '0331', 'そろそろ　さくらの　はなが　さく　きせつ　だよ！'],
				['0415', '0430', 'そろそろ　チューリップの　はなが　さく　きせつ　だよ！'],
				['0415', '0430', 'そろそろ　しばざくらの　はなが　さく　きせつ　だよ！'],
				['0415', '0430', 'そろそろ　ふじの　はなが　さく　きせつ　だよ！'],
				['0415', '0430', 'そろそろ　ネモフィラの　はなが　さく　きせつ　だよ！'],
				['0415', '0430', 'そろそろ　つつじの　はなが　さく　きせつ　だよ！'],
				['0601', '0615', 'そろそろ　あじさいの　はなが　さく　きせつ　だよ！'],
				['0801', '0815', 'そろそろ　ひまわりの　はなが　さく　きせつ　だよ！'],
				['0901', '0915', 'そろそろ　まんじゅしゃげの　はなが　さく　きせつ　だよ！'],
				['0915', '0930', 'そろそろ　コスモスの　はなが　さく　きせつ　だよ！'],
				['1115', '1130', 'そろそろ　こうようの　きせつ　だよ！']
			];
			const candToday = []; // 当日のメッセージ
			const candPeriod = []; // 当日以外のメッセージ
			for (const m of msgs) {
				if (p.dateStr >= m[0] && m[1] >= p.dateStr) {
					if (m[0] == m[1]) {
						candToday.push([1, m[2]]);
					} else {
						candPeriod.push([1, m[2]]);
					}
				}
			}
			if (candToday.length) {
				return { condition: -2, values: candToday };
			} else if (candPeriod.length) {
				return { condition: candPeriod.length >= 2 ? -4 : -8, values: candPeriod };
			} else {
				return 0;
			}
		},
		text: (p, select, val) => select(val),
		icon: (p) => 'inu.png'
	},
	// ▼季節の歌
	{
		cond: (p) => {
			const msgs = [
				['0215', '0331', 'は～るが　き～た　は～るが　き～た　ど～こ～に～　きた～♪'], // 著作権切れ
				['0301', '0331', 'ちょうちょ～　ちょうちょ～　なのはに　とまれ～♪'], // 著作権切れ
				['0301', '0430', 'は～るの　おがわは　さらさら　いくよ～♪'], // 著作権切れ
				['0415', '0505', 'やねよ～り　た～か～い　こいの～ぼ～り～♪'], // 文部省唱歌、著作権切れ
				['0601', '0630', 'で～んで～ん　む～しむ～し　か～たつむり～♪'], // 文部省唱歌、作詞者不詳
				['0901', '1031', 'とんぼの　めがねは　みずいろ　めがね♪'], // 著作権切れ
				['0901', '0930', 'あれ　まつむしが　ないている～♪'], // 文部省唱歌、作詞者不詳
				['0915', '1115', 'どんぐり　ころころ　どんぶりこ～♪'], // 著作権切れ
				['1201', '0229', 'ゆ～きや　こんこ　あられや　こんこ♪'] // 文部省唱歌、作詞者不詳
			];
			const cand = [];
			for (const m of msgs) {
				if (m[1] >= m[0]) {
					if (p.dateStr >= m[0] && m[1] >= p.dateStr) cand.push([1, m[2]]);
				} else {
					// 期間が年を跨ぐ場合
					if (p.dateStr >= m[0] || m[1] >= p.dateStr) cand.push([1, m[2]]);
				}
			}
			return cand.length ? { condition: -4, values: cand } : 0;
		},
		text: (p, select, val) => select(val),
		icon: (p) => 'saru.png'
	}
];
export default messages;
