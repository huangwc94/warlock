/**
 * Created by Weicheng Huang on 2016/11/9.
 */
var assert = require("assert");
import * as Engine from "../gameserver/Engine";

class FakeNetwork implements Engine.Networker{
    send_message_to(id,type,message){

    }
    send_message_all(type,message){

    }
    send_end_signal(code){

    }
}
var networker = new FakeNetwork();

describe("Engine Test",function () {
    describe("World class",function () {
        it("World should init successfully",function (done) {
            assert.equal(3,3);
            Engine.init_engine("FirstMap",networker);
            done();
        })
    });
});