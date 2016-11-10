import {EventEmitter} from "events";

export const E = new EventEmitter();


setInterval(function () {
    E.emit("myevent","data");
},1000);

var k = require("./exp1");
k.D();