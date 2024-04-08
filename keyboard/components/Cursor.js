/**
 * カーソルを表すクラス
 */
export default class Cursor {

	/**
	 * 初期化
	 */
	constructor() {
		/**
		 * カーソル要素のクラス名
		 * @type {string}
		 */
		this.CLS_CURSOR = 'cursor';
		/**
		 * カーソル位置となっている要素
		 * @type {HTMLCollection}
		 */
		this.elCursor = document.getElementsByClassName(this.CLS_CURSOR);
		/**
		 * カーソルの横位置
		 * @type {number}
		 */
		this.positionX = null;
	}

	/**
	 * カーソル位置となっている要素を返す
	 * @return {HTMLElement} カーソル位置となっている要素
	 */
	get cursor() {
		return this.elCursor[0];
	}

	/**
	 * カーソルがある行が何行目かを返す
	 * @return {number} カーソルがある行が何行目か（0～）
	 */
	get lines() {
		let count = 0;
		for (let target = this.prevLine; target; target = target.previousElementSibling) {
			count++;
		}
		return count;
	}

	/**
	 * カーソル位置がその行の何文字目かを返す
	 * @return {number} カーソル位置がその行の何文字目か（0～）
	 */
	get chars() {
		let count = 0;
		for (let target = this.prevChar; target; target = target.previousElementSibling) {
			count++;
		}
		return count;
	}

	/**
	 * カーソルがある行の要素を返す
	 * @return {HTMLElement} カーソルがある行の要素
	 */
	get currentLine() {
		return this.cursor.parentElement;
	}

	/**
	 * カーソルの前の文字の要素を返す
	 * @return {HTMLElement} カーソルの前の文字の要素
	 */
	get prevChar() {
		return this.cursor.previousElementSibling;
	}

	/**
	 * カーソルがある行の前の行の要素を返す
	 * @return {HTMLElement} カーソルがある行の前の行の要素
	 */
	get prevLine() {
		return this.currentLine.previousElementSibling;
	}

	/**
	 * カーソルの次の文字の要素を返す
	 * @return {HTMLElement} カーソルの次の文字の要素
	 */
	get nextChar() {
		return this.cursor.nextElementSibling;
	}

	/**
	 * カーソルがある行の次の行の要素を返す
	 * @return {HTMLElement} カーソルがある行の次の行の要素
	 */
	get nextLine() {
		return this.currentLine.nextElementSibling;
	}

	/**
	 * カーソルとそれ以降の文字の要素を返す
	 * @return {HTMLElement[]} カーソルとそれ以降の文字の要素の配列
	 */
	get followingChars() {
		let target = this.cursor;
		const chars = [];
		while (target) {
			const next = target.nextElementSibling;
			chars.push(target);
			target = next;
		}
		return chars;
	}

	/**
	 * カーソルが画面内に入っているかどうかを返す
	 * @return {number} 画面下端を超えている場合は1、画面上端を超えている場合は-1、それ以外は0
	 */
	get scrollPosition() {
		const rect = this.cursor.getBoundingClientRect();
		if (rect.bottom > document.documentElement.clientHeight) {
			return 1;
		} else if (0 > rect.top) {
			return -1;
		}
		return 0;
	}

	/**
	 * 最初のカーソル位置を決定する
	 * @param {HTMLElement} el - カーソル位置となる要素
	 */
	initialize(el) {
		this._moveTo(el);
		this.positionX = this._getPositionX();
	}

	/**
	 * 現在のカーソルの絶対位置を取得する
	 * @return {number} 現在のカーソルの絶対位置
	 */
	_getPositionX() {
		return this.cursor.getBoundingClientRect().x;
	}

	/**
	 * 別の要素にカーソルを移動する
	 * @param {HTMLElement} el - カーソルを移す要素
	 */
	_moveTo(el) {
		const cls = this.CLS_CURSOR;
		if (this.cursor) this.cursor.classList.remove(cls);
		el.classList.add(cls);
	}

	/**
	 * カーソルを進める
	 */
	moveToRight() {
		const { nextChar, nextLine } = this;
		// 行末以外の場合
		if (nextChar) {
			this._moveTo(nextChar);
		// 行末の場合
		} else if (nextLine) {
			this._moveTo(nextLine.firstElementChild);
		}
		this.positionX = this._getPositionX();
	}

	/**
	 * カーソルを戻す
	 */
	moveToLeft() {
		const { prevChar, prevLine } = this;
		// 行頭以外の場合
		if (prevChar) {
			this._moveTo(prevChar);
		// 行頭の場合
		} else if (prevLine) {
			this._moveTo(prevLine.lastElementChild);
		}
		this.positionX = this._getPositionX();
	}

	/**
	 * カーソルを下に移動する
	 */
	moveToDown() {
		const { nextLine } = this;
		if (nextLine) {
			this._moveTo(nextLine.lastElementChild);
			while (this._getPositionX() > this.positionX) {
				this._moveTo(this.prevChar);
			}
		}
	}

	/**
	 * カーソルを上に移動する
	 */
	moveToUp() {
		const { prevLine } = this;
		if (prevLine) {
			this._moveTo(prevLine.lastElementChild);
			while (this._getPositionX() > this.positionX) {
				this._moveTo(this.prevChar);
			}
		}
	}

	/**
	 * カーソルの直前に要素を挿入する
	 * @param {HTMLElement[]} elems - 挿入する要素の配列
	 */
	prepend(...elems) {
		for (const el of elems) {
			this.cursor.insertAdjacentElement('beforebegin', el);
		}
	}

}
