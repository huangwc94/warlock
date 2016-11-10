/**
 * Created by Weicheng Huang on 2016/11/9.
 */
var assert = require("assert");
var Engine = require("../gameserver/Engine");
var e = new Engine.World("FirstMap");

describe("World Class Test",function () {
    describe("Player In/out",function () {
        it("Player should be able to join world",function (done) {
            assert.equal(3,3);
            Engine.World.instance.init();
            done();
        })
    });
});