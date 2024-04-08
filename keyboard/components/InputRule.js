import InputMapping from './InputMapping.js';

/**
 * 1つのキーに対する入力規則を表すクラス
 */
export default class InputRule {

	/**
	 * 初期化
	 * @param {string} key - キー
	 * @param {string} text - 対応する文字
	 * @param {array|string} [mapping] - 対応するサブマッピングまたはマッピングパス
	 * @param {object} [options] - オプション
	 * @param {boolean} [options.hidden] - trueの場合はサジェストに表示しない
	 * @param {boolean} [options.keep] - trueの場合は文字を確定時の前置用に保存する
	 * @param {boolean} [options.fix] - trueの場合は直前までの入力を文字で確定する
	 */
	constructor(key, text, mapping = null, options = {}) {
		/**
		 * キー
		 * @type {string}
		 */
		this.key = key;
		/**
		 * 対応する文字
		 * @type {string}
		 */
		this.text = text;
		/**
		 * 対応するサブマッピング
		 * @type {InputMapping}
		 */
		this.mapping = null;
		/**
		 * サブマッピングの代わりとなるマッピングパス
		 * @type {string}
		 */
		this.mappingPath = null;
		/**
		 * オプション
		 * @type {object}
		 */
		this.options = options;
		
		if (Array.isArray(mapping)) {
			this.mapping = new InputMapping(mapping);
		} else {
			this.mappingPath = mapping;
		}
	}

}
