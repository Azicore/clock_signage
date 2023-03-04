// ShutdownMessageの設定
const config = {
	confirmDelay         : 10, // 最初の選択画面での猶予時間（秒）
	confirmRestartDelay  : 10, // 再起動の選択画面での猶予時間（秒）
	confirmShutdownDelay : 10, // シャットダウンの選択画面での猶予時間（秒）
	restartDelay         :  3, // 再起動実行までの猶予時間（秒）
	shutdownDelay        :  3  // シャットダウン実行までの猶予時間（秒）
};
export { config };
