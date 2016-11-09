var child = require("child_process");
var server;

server  = child.spawn("node",["gameserver/GameServer"]);
server.on("error",function (err) {
    console.log("fail:"+err);
});
server.stderr.on("data",function (e) {
    console.log("ERR:"+e);
});
server.stdout.on("data",function (data) {
    console.log("STD:"+data);
});
server.on("close",function () {
    console.log("server exit");
});
setTimeout(function () {
    console.log("Killing server");
    server.kill();
},5000);
