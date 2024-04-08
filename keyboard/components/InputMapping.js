import InputRule from './InputRule.js';

/**
 * 入力規則の集合（マッピング）を表すクラス
 */
export default class InputMapping {

	/**
	 * 初期化
	 * @param {array} mappingData - 複数の入力規則を定義した配列
	 */
	constructor(mappingData) {
		for (let i = 0; mappingData.length > i; i++) {
			this[i] = new InputRule(...mappingData[i]);
		}
		this.length = mappingData.length;
	}

	/**
	 * 与えられたキーに対応する入力規則を返す
	 * @param {string} key - キー
	 * @return {InputRule} 該当する入力規則
	 */
	find(key) {
		for (let i = 0; this.length > i; i++) {
			if (this[i].key == key) return this[i];
		}
		return null;
	}

	/**
	 * 与えられたマッピングパスに対応するサブマッピングを返す
	 * @param {string} mappingPath - マッピングパス
	 * @return {InputMapping} 該当するサブマッピング
	 */
	findMapping(mappingPath) {
		if (mappingPath == null) return null;
		let mapping = this;
		for (const key of mappingPath) {
			const rule = mapping.find(key);
			if (!rule) return null;
			mapping = rule.mapping;
		}
		return mapping;
	}

}
