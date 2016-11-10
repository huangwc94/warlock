/**
 * Created by Weicheng Huang on 2016/11/8.
 */

import {E} from "./experiment";

export function D(){
    E.on("myevent",function (e) {
        console.log("Event catch1:"+e);
        return false;
    });
    E.on("myevent",function (e) {
        console.log("Event catch2:"+e);
    })
};