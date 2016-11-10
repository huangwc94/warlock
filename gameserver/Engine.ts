/**
 * Created by Weicheng Huang on 2016/11/9.
 */

import {GameServer} from "./GameServer";
import {EventEmitter} from "events";

var LogColor = require("colors");


var g_log_level = 5;
var g_debug = true;
export function set_log_level(level){
    g_log_level = level;
}

export var ColorSet = {
    std:{
        primary:"blue",
        info:"grey",
        error:"red",
        warning:"yellow",
        success:"green",
        debug:"cyan"
    },
    team:{
        friend:"#66ccff",
        enemy:"#ff0303"
    },
    player:[
        "#ff0303", // red
        "#0042ff", // blue
        "#1ce6b9", // cyan
        "#540081", // purple
        "#fffc01", // yellow
        "#fe8a0e", // orange
        "#20c000", // green
        "#e55bb0", // pink
        "#959697", // light grey
        "#7ebff1", // light blue
        "#106246", // aqua
        "#4e2a04"],// brown
    // red blue cyan purple yellow orange green pink light_grey light_blue aqua brown
    quality:{
        trash:"#9d9d9d",
        normal:"#ffffff",
        uncommon:"#1eff00",
        rare:"#0070ff",
        epic:"#a335ee",
        legendary:"#ff8000",
    }
};
LogColor.setTheme(ColorSet.std);
export class DisplayableObject{

}
export class GamePlayer{

}
export class Map{
    players:GamePlayer;
    units:Unit;
    constructor(){

    }
    public init(){

    }
}
export class Projector{

}
export class Spell{
    id:number;
    caster:Unit;
    timer;
    constructor(){
        this.id = 3;

    }
    public cast(){
        World.EventSystem.emit("Spell(id="+this.id+") casted by "+this.caster.name );
    }
}
export class Unit{
    name:string;
    constructor(){
        this.name = "Unnamed";
    }
}
export class World {
    static EventSystem:EventEmitter;
    static instance:World;
    map: Map;
    players: Array<GamePlayer>;

    constructor(map_dir) {
        World.EventSystem = new EventEmitter();
        World.instance = this;
        try{
            var mp = require("../map/" + map_dir + "/index.js");
            this.map = new mp.CustomMap();
            this.map.init();
        }catch (err){
            log_error(err);
            log_error("Fatal error: Can not load map!");
            if(GameServer.instance){
                GameServer.instance.end(1);
            }
        }

        this.players = [];

    }
    public init(){
        log_success("World Init Successfully!");
    }
    public start(){

    }

    public player_join(id, name) {

    }

    public player_input(id, e) {

    }
    public player_leave(id){

    }


}

// logger
export function log_info(msg) {
    if (g_log_level > 4) {
        console.log(LogColor.info(Date() + ":" + msg));
    }

}

export function log_debug(msg) {
    if (g_debug) {
        console.log(LogColor.debug(Date() + ":" + msg));
    }
}

export function log_warning(msg) {
    if (g_log_level > 2) {
        console.log(LogColor.warning(Date() + ":" + msg));
    }
}

export function log_error(msg) {
    if (g_log_level > 1) {
        console.log(LogColor.error(Date() + ":" + msg));
    }
}

export function log_success(msg) {
    if (g_log_level > 3) {
        console.log(LogColor.success(Date() + ":" + msg));
    }
}