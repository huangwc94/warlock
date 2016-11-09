
import {error} from "util";
/**
 * Created by Weicheng Huang on 2016/11/9.
 */
var C = require("socket.io-client");
var assert = require('assert');
describe("Server Connectivity:",function () {
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
                client.emit("login",{id:3222,name:"Weicheng Huang"});
            })
            client.on("disconnect",function () {
                done();
            });
        });
        it("wrong name, client should be kick soon",function (done) {
            this.timeout(2000);
            var client = C.connect("ws://localhost:8000",{'forceNew': true,reconnection: false});
            client.on("connect",function () {
                client.emit("login",{id:"123123",name:"WeichengHuang"});
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
                client.emit("login",{id:"111",name:"Weicheng Huang"});
            })
            client.on("disconnect",function () {
                throw new Error("Kicked by server");
            });
            setTimeout(function () {
                done();
            },4000);
        });
        it("client should not be kicked,login twice with same identifier",function (done) {
            this.timeout(5000);
            var client = C.connect("ws://localhost:8000",{'forceNew': true,reconnection: false});
            client.on("connect",function () {
                client.emit("login",{id:"222",name:"Snow Yang"});
                client.emit("login",{id:"222",name:"Snow Yang"});
            })
            client.on("disconnect",function () {
                throw new Error("Kicked by server");

            });
            setInterval(function () {
                done();
            },4000);
        });
        it("first client should be kicked,login twice with same identifier but different socket",function (done) {
            this.timeout(5000);
            var client1 = C.connect("ws://localhost:8000",{'forceNew': true,reconnection: false});
            var client2 = C.connect("ws://localhost:8000",{'forceNew': true,reconnection: false});
            client1.on("connect",function () {
                client1.emit("login",{id:"333",name:"Peter"});

            });
            setTimeout(function () {
                client2.emit("login",{id:"333",name:"Peter"});
            },1000);

            client1.on("disconnect",function () {
                done();
            });
            client2.on("disconnect",function () {
                throw new Error("Wrong socket kicked by server");
            });
        });
    });
});
