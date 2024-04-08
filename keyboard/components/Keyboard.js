import Cursor from './Cursor.js';
import AutoSaver from './AutoSaver.js';

/**
 * ローマ字入力練習アプリ
 */
export default class Keyboard {

	/**
	 * 初期化
	 * @param {InputMapping} baseMapping - 全体の起点となるマッピングオブジェクト
	 */
	constructor(baseMapping) {
		/**
		 * 確定済みの文字の要素のクラス
		 * @type {string}
		 */
		this.CLS_FIXED = 'fixed_char';
		/**
		 * 未確定文字の要素のクラス
		 * @type {string}
		 */
		this.CLS_INPUTTING = 'inputting_char';
		/**
		 * 行の要素のクラス
		 * @type {string}
		 */
		this.CLS_LINE = 'line';
		/**
		 * Cursorオブジェクト
		 * @type {Cursor}
		 */
		this.cursor = new Cursor();
		/**
		 * 全体の起点となるマッピングオブジェクト
		 * @type {InputMapping}
		 */
		this.baseMapping = baseMapping;
		/**
		 * 現在のマッピングオブジェクト
		 * @type {InputMapping}
		 */
		this.currentMapping = baseMapping;
		/**
		 * 全ての行の要素
		 * @type {HTMLCollection}
		 */
		this.elLines = document.getElementsByClassName(this.CLS_LINE);
		/**
		 * 未確定の文字の要素
		 * @type {HTMLCollection}
		 */
		this.elInputtingChars = document.getElementsByClassName(this.CLS_INPUTTING);
		/**
		 * 入力エリアの要素
		 * @type {HTMLElement}
		 */
		this.elInputArea = null;
		/**
		 * サジェストメッセージを表示する要素
		 * @type {HTMLElement}
		 */
		this.elSuggestMsg = null;
		/**
		 * サジェストを表示する要素
		 * @type {HTMLElement}
		 */
		this.elSuggestBody = null;
		/**
		 * 起動メッセージを表示する要素
		 * @type {HTMLElement}
		 */
		this.elStart = null;
		/**
		 * 前置する文字列を保持するスタック
		 * @type {string[]}
		 */
		this.prefixStack = [];
		/**
		 * 入力状態に応じたマッピングを保持するスタック
		 * @type {InputMapping[]}
		 */
		this.mappingStack = [];
		/**
		 * 入力モード（falseはひらがな、trueはカタカナ）
		 * @type {boolean}
		 */
		this.katakanaMode = false;
		/**
		 * スクロールしている行数
		 * @type {number}
		 */
		this.scrollPosition = 0;

		// 要素の初期化
		const CLS_INPUTAREA   = 'input_area';
		const CLS_SUGGEST     = 'suggest';
		const CLS_SUGGESTMSG  = 'suggest_msg';
		const CLS_SUGGESTBODY = 'suggest_body';
		const CLS_START       = 'start';
		const CLS_STARTMSG    = 'start_msg';
		const START_MSG = 'あそぶには、キーボードをつないでね。<br>つないだら、なにかキーをおすと、はじめられるよ。<br>あそびおわったら、かならずキーボードをはずしてね。';
		document.body.insertAdjacentHTML('afterbegin', `
			<div id="${CLS_INPUTAREA}"></div>
			<div id="${CLS_SUGGEST}">
				<p id="${CLS_SUGGESTMSG}"></p>
				<div id="${CLS_SUGGESTBODY}"></div>
			</div>
			<div id="${CLS_START}">
				<p id="${CLS_STARTMSG}">${START_MSG}</p>
			</div>
		`);
		this.elInputArea   = document.getElementById(CLS_INPUTAREA);
		this.elSuggestMsg  = document.getElementById(CLS_SUGGESTMSG);
		this.elSuggestBody = document.getElementById(CLS_SUGGESTBODY);
		this.elStart       = document.getElementById(CLS_START);

		// 開始
		const autoSaver = new AutoSaver(this);
		this._initialize(autoSaver.restore());
		this.waitForInput();
		autoSaver.start();

	}

	/**
	 * 未確定状態かどうかを返す
	 * @return {boolean} 未確定状態ならtrue
	 */
	get isInputting() {
		return this.elInputtingChars.length > 0;
	}

	/**
	 * 未確定状態の文字列を返す
	 * @return {string} 未確定状態の文字列
	 */
	get inputtingText() {
		return Array.from(this.elInputtingChars, v => v.innerText).join('');
	}

	/**
	 * 前置する文字列を返す
	 * @return {string} 前置する文字列
	 */
	get prefixText() {
		return this.prefixStack.join('');
	}

	/**
	 * 確定済みの文字列を返す
	 * @return {string} 全ての確定済みの文字列
	 */
	get fixedText() {
		const lines = [];
		for (let i = 0; this.elLines.length > i; i++) {
			let text = '';
			const chars = this.elLines[i].getElementsByClassName(this.CLS_FIXED);
			for (let j = 0; chars.length > j; j++) {
				text = `${text}${chars[j].innerText}`;
			}
			lines.push(text);
		}
		return lines.join('\n');
	}

	/**
	 * 初期状態を設定する
	 * @param {object} savedData - テキストとカーソルの情報
	 * @param {string} savedData.text - 最初に挿入するテキスト
	 * @param {number} savedData.line - カーソルの行番号（0～）
	 * @param {number} savedData.position - カーソルの行内位置（0～）
	 */
	_initialize(savedData) {
		// テキストの設定
		const lines = savedData.text.split(/\n/);
		for (const line of lines) {
			const { elLine, elLineEnd } = this._createLineElement();
			elLine.append(...this._createCharElements(line, true));
			elLine.append(elLineEnd);
			this.elInputArea.append(elLine);
		}
		// カーソル位置の決定
		const line = this.elInputArea.children[Math.min(savedData.line, this.elInputArea.children.length - 1)];
		const char = line.children[Math.min(savedData.position, line.children.length - 1)];
		this.cursor.initialize(char);
		// カーソル位置に合わせたスクロール
		this._scroll(true);
	}

	/**
	 * スタックをリセットする
	 */
	_resetStack() {
		this.mappingStack = [];
		this.prefixStack = [];
	}

	/**
	 * スタックに現在のマッピングと前置する文字列を追加する
	 * @param {string} prefix - 前置する文字列
	 */
	_pushStack(prefix) {
		this.mappingStack.push(this.currentMapping);
		this.prefixStack.push(prefix);
	}

	/**
	 * スタックから直前のマッピングと前置する文字列を削除する
	 */
	_popStack() {
		this.currentMapping = this.mappingStack.pop();
		this.prefixStack.pop();
	}

	/**
	 * 入力に応じて自動的にスクロールする
	 * @param {boolean} multiple - 2行以上のスクロールを試すかどうか
	 */
	_scroll(multiple) {
		while (true) {
			// 画面下端を超えている場合は1、画面上端を超えている場合は-1、それ以外は0
			const scrollPosition = this.cursor.scrollPosition;
			if (scrollPosition) {
				this.scrollPosition = Math.min(0, this.scrollPosition - scrollPosition);
				this.elInputArea.style.top = `calc(var(--line-char-height) * ${this.scrollPosition})`;
			} else {
				break;
			}
			if (!multiple) break;
		}
	}

	/**
	 * ひらがなに対応するカタカナを返す
	 * @param {string} str - ひらがなを含む入力文字列
	 * @return {string} 入力文字列のひらがなをカタカナに置換した文字列
	 */
	_getKatakana(str) {
		if (!this.katakanaMode) return str;
		return str.replace(/[\u3041-\u3094]/g, s => String.fromCodePoint(s.codePointAt(0) + 96));
	}

	/**
	 * 入力案内を表示する
	 */
	_showSuggest() {
		if (this.isInputting) {
			this.elSuggestMsg.innerHTML = `${this.inputtingText.split('').map(v => `<span class="key key_input">${v}</span>`).join('')}のつぎにうつキー：`;
		} else {
			this.elSuggestMsg.innerHTML = `さいしょにうつキー：`;
		}
		this.elSuggestBody.innerHTML = '';
		for (let i = 0; this.currentMapping.length > i; i++) {
			const rule = this.currentMapping[i];
			if (rule.options.hidden) continue;
			const el = document.createElement('div');
			el.classList.add('suggest_line');
			el.innerHTML = `<span class="key">${rule.key}</span> : ${this._getKatakana(rule.text)}`;
			this.elSuggestBody.insertAdjacentElement('beforeend', el);
		}
	}

	/**
	 * 文字の要素を作成する
	 * @param {string} text - 作成する文字列
	 * @param {boolean} isFixed - 確定済みかどうか
	 * @return {HTMLElement[]} HTML要素の配列
	 */
	_createCharElements(text, isFixed) {
		const elems = [];
		const cls = isFixed ? this.CLS_FIXED : this.CLS_INPUTTING;
		for (const c of text) {
			const el = document.createElement('span');
			el.classList.add(cls);
			el.innerHTML = c;
			elems.push(el);
		}
		return elems;
	}

	/**
	 * 新しい行の要素を作成する
	 * @return {object} 行の要素
	 * @property {HTMLElement} elLine 行の要素
	 * @property {HTMLElement} elLineEnd 行末を表す要素
	 */
	_createLineElement() {
		const elLine = document.createElement('div');
		elLine.classList.add(this.CLS_LINE);
		const elLineEnd = document.createElement('span');
		elLineEnd.classList.add('line_end');
		return { elLine, elLineEnd };
	}

	/**
	 * カーソル位置の文字を削除する
	 */
	_deleteChar() {
		// 入力中の場合
		if (this.isInputting) {
			this._popStack();
		}
		const { currentLine, prevChar, prevLine } = this.cursor;
		// 行頭以外の場合
		if (prevChar) {
			currentLine.removeChild(prevChar);
		// 行頭の場合
		} else if (prevLine) {
			prevLine.removeChild(prevLine.lastElementChild);
			prevLine.append(...this.cursor.followingChars);
			this.elInputArea.removeChild(currentLine);
		}
	}

	/**
	 * カーソル位置で改行する
	 */
	_addNewLine() {
		if (this.isInputting) return; // 入力中は何もしない
		const { elLine, elLineEnd } = this._createLineElement();
		// 新しい行を追加
		this.cursor.currentLine.insertAdjacentElement('afterend', elLine);
		// カーソルの直前に行末要素を追加
		this.cursor.prepend(elLineEnd);
		// カーソル以降を新しい行に移動
		elLine.append(...this.cursor.followingChars);
	}


	/**
	 * 確定した文字を追加する
	 * @param {string} text - 確定した文字列
	 */
	_addFixedText(text) {
		// 未確定の文字を全て消去
		while (this.isInputting) {
			this.cursor.currentLine.removeChild(this.elInputtingChars[0]);
		}
		// 確定した文字を追加
		text = this._getKatakana(`${this.prefixText}${text}`);
		this.cursor.prepend(...this._createCharElements(text, true));
		this._resetStack();
	}

	/**
	 * 未確定の文字を追加する
	 * @param {string} text - 次の文字
	 * @param {string} prefix - 確定時に前置する文字
	 */
	_addInputtingText(text, prefix) {
		this.cursor.prepend(...this._createCharElements(text, false));
		this._pushStack(prefix);
	}

	/**
	 * 次の入力待ちを行なう
	 */
	waitForInput() {
		this._scroll();
		this._showSuggest();
		document.addEventListener('keydown', (e) => {
			// 起動メッセージの消去
			if (this.elStart) {
				document.body.removeChild(this.elStart);
				this.elStart = null;
				this.waitForInput();
				return;
			}
			const key = e.key.toUpperCase();
			// 文字キー以外の動作
			if (key == 'BACKSPACE') {
				this._deleteChar();
			} else if (key == 'ENTER') {
				this._addNewLine();
			} else if (/(?:HA|ZE)NKAKU$|(?:HIRAG|KATAK)ANA$|CONVERT$|^EISU$|^ROMAJI$/.test(key)) {
				this.katakanaMode = !this.katakanaMode;
			} else if (key == 'ARROWRIGHT') {
				if (!this.isInputting) this.cursor.moveToRight();
			} else if (key == 'ARROWLEFT') {
				if (!this.isInputting) this.cursor.moveToLeft();
			} else if (key == 'ARROWDOWN') {
				if (!this.isInputting) this.cursor.moveToDown();
			} else if (key == 'ARROWUP') {
				if (!this.isInputting) this.cursor.moveToUp();
			}
			// マッピングからキーを探す
			const rule = this.currentMapping.find(key);
			// キーが未定義の場合は終了
			if (!rule) {
				e.preventDefault();
				this.waitForInput();
				return;
			}
			const nextMapping = rule.mapping || this.baseMapping.findMapping(rule.mappingPath);
			// 文字の確定
			if (!nextMapping || rule.options.fix) {
				this._addFixedText(rule.text);
			}
			// 未確定文字の追加
			if (nextMapping) {
				const prefix = rule.options.keep ? rule.text : '';
				this._addInputtingText(key, prefix);
			}
			// 次の入力待ち
			this.currentMapping = nextMapping || this.baseMapping;
			this.waitForInput();
		}, { once: true });
	}

}
