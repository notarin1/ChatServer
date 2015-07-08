/* usage
 * server: 本アプリを起動するだけ 
 * Client: 起動後、http://localhost:8080/ にアクセス。
 *         Android(genumotion)の場合は、http://192.168.56.1:8080 (固定)にアクセス。
 */

// 1.モジュールオブジェクトの初期化
var fs = require("fs");
var server = require("http").createServer(function (req, res) {
    res.writeHead(200, { "Content-Type": "text/html" });
    var output = fs.readFileSync("./index.html", "utf-8");
    res.end(output);
    console.log("index.html requested.");
}).listen(8080);
var io = require("socket.io").listen(server);

// ユーザ管理ハッシュ
var userHash = {};

// 2.イベントの定義
io.sockets.on("connection", function (socket) {
    
    // 接続開始カスタムイベント(接続元ユーザを保存し、他ユーザへ通知)
    socket.on("connected", function (name) {
        var msg = name + "が入室しました";
        userHash[socket.id] = name;
        io.sockets.emit("publish", { value: msg });
        console.log("connected " + name + ".");
    });
    
    // メッセージ送信カスタムイベント
    socket.on("publish", function (data) {
        io.sockets.emit("publish", { value: data.value });
        console.log(data.value);
    });
    
    // 接続終了組み込みイベント(接続元ユーザを削除し、他ユーザへ通知)
    socket.on("disconnect", function () {
        if (userHash[socket.id]) {
            var msg = userHash[socket.id] + "が退出しました";
            console.log("disconnected " + userHash[socket.id] + ".");
            delete userHash[socket.id];
            io.sockets.emit("publish", { value: msg });
        }
    });
});