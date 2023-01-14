const express   = require('express');
const WebSocket = require('ws');
const path      = require('path');

// HTTPとWebSocketで使用するポート（起動時にコマンドライン引数で渡す）
const appPort = +process.argv[2] || 8080;
const wsPort = +process.argv[3] || 8081;

const app = express();
const ws = new WebSocket.Server({ port: wsPort });

// 全HTTPリクエストに共通のヘッダ
app.use('/', (req, res, next) => {
	res.set('Cache-Control', 'no-cache');
	next();
});

// 「/port」がリクエストされたらWebSocketのポート番号を返す
app.get('/port', (req, res, next) => {
	res.type('text/javascript');
	res.send(`window.webSocketPort = ${wsPort};`);
});

// それ以外の「/」直下のパスは403にする
app.all(/^\/[^\/]*$/, (req, res, next) => {
	res.sendStatus(403);
});

// それ以外の各アプリディレクトリ以下のファイルは静的に返す
app.use('/', express.static(path.join(__dirname, './')));

// 通常のHTTPサーバーの起動
app.listen(appPort);

// WebSocketでメッセージを待ち受けているクライアント
const listeningClients = {};

// WebSocketの接続を受けたとき
ws.on('connection', function(client) {
	const clientId = Date.now();

	// クライアントからメッセージを受信したとき
	client.on('message', function(msg) {
		
		// 受信メッセージのパース
		let obj;
		try {
			obj = JSON.parse(msg);
			if (!obj || !obj.mode) return;
		} catch (e) {
			client.send(JSON.stringify({ error: 'Invalid message' }));
			return;
		}

		// 受信登録
		if (obj.mode == 'listen') {
			// obj.mode  : "listen"
			// obj.group : グループ番号
			listeningClients[clientId] = { client: client, group: obj.group };
			client.send(JSON.stringify({ ok: true, clientId: clientId }));
		
		// 受信登録したクライアントへの送信
		} else if (obj.mode == 'send') {
			// obj.mode    : "send"
			// obj.group   : 送信するクライアントのグループ番号
			// obj.message : 送信する文字列
			let cnt = 0;
			for (const id in listeningClients) {
				const c = listeningClients[id];
				if (obj.group && c.group != obj.group) continue;
				c.client.send(JSON.stringify({ message: obj.message }));
				cnt++;
			}
			client.send(JSON.stringify({ ok: true, numberOfClients: cnt }));
		
		// 接続チェック
		} else if (obj.mode == 'check') {
			// obj.mode : "check"
			client.send(JSON.stringify({ ok: true }));
		
		// エラー
		} else {
			client.send(JSON.stringify({ error: `Unknown mode: ${obj.mode}` }));
		}
	});

	// 接続が終了したとき
	client.on('close', function() {
		if (listeningClients[clientId]) delete listeningClients[clientId];
	});
});
