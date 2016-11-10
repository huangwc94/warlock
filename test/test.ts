
import {error} from "util";
/**
 * Created by Weicheng Huang on 2016/11/9.
 */
var user_idtifier = [
    {"empty":false,"id":"111","name":"qqq"},
    {"empty":false,"id":"222","name":"www"},
    {"empty":false,"id":"333","name":"eee"},
    {"empty":false,"id":"444","name":"rrr"},
    {"empty":false,"id":"555","name":"ttt"},
    {"empty":true},
    {"empty":false,"id":"666","name":"yyy"},
    {"empty":false,"id":"777","name":"uuu"},
    {"empty":false,"id":"888","name":"iii"},
    {"empty":false,"id":"999","name":"ooo"},
    {"empty":false,"id":"000","name":"ppp"},
    {"empty":true}];
var child = require("child_process");
var server;

var C = require("socket.io-client");
var assert = require('assert');
var process = require("process");
function errorRaiseKickByServer(){
    throw new Error("Kicked by server");
}

describe("Server Connectivity:",function () {
    before(function() {
        var old = Date.now();
        server  = child.spawn("node",["build/gameserver/index"]);
        server.stderr.on("data",function (e) {
            throw new Error("Server Error:\n"+e);

        });
        server.on("close",function () {
            console.log("Server Exit:");

        });
        while(Date.now() - old <=1500); // wait 1.7s to let server start
        console.log("Test Server Started!");
    });
    after(function () {
        console.log("Test Server Closed");
        server.kill();
    });

    describe("Test connection",function () {
        it("client should be able to connect to server",function (done) {
            this.timeout(3000);
            var client = C.connect("ws://localhost:8000",{'forceNew': true,reconnection: false});
            client.on("connect",function () {
                done();
            });
        });
    });
    describe("Test auto kick",function () {
        it("client should be kicked by server after 3s",function (done) {
            this.timeout(5000);
            var client = C.connect("ws://localhost:8000",{'forceNew': true,reconnection: false});
            client.on("disconnect",function () {
                done();
            });
        });
    });

    describe("Test login with wrong parameter",function () {
        it("null input, client should be kick soon",function (done) {
            this.timeout(2000);
            var client = C.connect("ws://localhost:8000",{'forceNew': true,reconnection: false});
            client.on("connect",function () {
                client.emit("login");
            });
            client.on("disconnect",function () {
                done();
            });
        });
        it("wrong id, client should be kick soon",function (done) {
            this.timeout(2000);
            var client = C.connect("ws://localhost:8000",{'forceNew': true,reconnection: false});
            client.on("connect",function () {
                client.emit("login",{id:111,name:"222"});
            });
            client.on("disconnect",function () {
                done();
            });
        });
        it("wrong name, client should be kick soon",function (done) {
            this.timeout(2000);
            var client = C.connect("ws://localhost:8000",{'forceNew': true,reconnection: false});
            client.on("connect",function () {
                client.emit("login",{id:"bdb",name:"dfb"});
            })
            client.on("disconnect",function () {
                done();
            });
        });
    });
    describe("Test login with right parameter",function () {
        it("client should not be kicked,login once",function (done) {
            this.timeout(5000);
            var client = C.connect("ws://localhost:8000",{'forceNew': true,reconnection: false});
            client.on("connect",function () {
                client.emit("login",user_idtifier[0]);
            })

            client.on("disconnect",errorRaiseKickByServer);
            setTimeout(function () {
                client.removeListener("disconnect",errorRaiseKickByServer);
                done();
            },4000);
        });
        it("client should not be kicked,login twice with same identifier",function (done) {
            this.timeout(5000);
            var client = C.connect("ws://localhost:8000",{'forceNew': true,reconnection: false});
            client.on("connect",function () {
                client.emit("login",user_idtifier[1]);
                client.emit("login",user_idtifier[1]);
            })
            client.on("disconnect",errorRaiseKickByServer);
            setTimeout(function () {
                client.removeListener("disconnect",errorRaiseKickByServer);
                done();
            },4000);
        });
        it("client should not be kicked,login twice with different identifier",function (done) {
            this.timeout(5000);
            var client = C.connect("ws://localhost:8000",{'forceNew': true,reconnection: false});
            client.on("connect",function () {
                client.emit("login",user_idtifier[8]);
                client.emit("login",user_idtifier[9]);
            });
            client.on("disconnect",errorRaiseKickByServer);
            setTimeout(function () {
                client.removeListener("disconnect",errorRaiseKickByServer);
                done();
            },4000);
        });
        it("first client should be kicked,login twice with same identifier but different socket",function (done) {
            this.timeout(5000);
            var client1 = C.connect("ws://localhost:8000",{'forceNew': true,reconnection: false});
            var client2 = C.connect("ws://localhost:8000",{'forceNew': true,reconnection: false});
            client1.on("connect",function () {
                client1.emit("login",user_idtifier[3]);

            });
            setTimeout(function () {
                client2.emit("login",user_idtifier[3]);
            },1000);

            client1.on("disconnect",function () {
                client2.removeListener("disconnect",errorRaiseKickByServer);
                done();
            });
            client2.on("disconnect",errorRaiseKickByServer);
            setTimeout(function () {
                client2.removeListener("disconnect",errorRaiseKickByServer);
                done();
            },4000);
        });
    });
});
