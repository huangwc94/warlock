/**
 * Created by Weicheng Huang on 2016/11/8.
 */

function a(e){
    console.log("called function a("+e+")");
}

var timerId = setTimeout(a,2000,"Arg1","arg2");
clearTimeout(timerId);