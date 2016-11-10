/**
 * Created by Weicheng Huang on 2016/11/9.
 */

import {EventEmitter} from "events";

/**
 * A Singleton world object, no body should make a world object outside, it should call this for singleton access
 */
var WORLD:World;

/**
 * A Singleton event listen and emitter
 */
var EVENT:EventEmitter;

/**
 * Init the game world with a map
 * @param map:string, the map name
 * @param sender:A network adapter that engine will call when sending information to client
 */

export function init_engine(map,sender:Networker){
    if(!WORLD)
        WORLD = new World(map,sender);
    if(!EVENT){
        EVENT = new EventEmitter();
    }
}
export function getWorld(){
    if(!WORLD){
        throw new Error("The engine is not initialized!");
    }
    return WORLD;
}
export function getEvent(){
    if(!EVENT){
        throw new Error("The engine is not initialized!");
    }
    return EVENT;
}

/**
 * A predefined color set in hex
 * It have 3 type:
 *      std: for standard output color
 *      team: for team color
 *      player: for play default color
 *      quality: for item quality
 */
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
        EVENT.emit("Spell(id="+this.id+") casted by "+this.caster.name );
    }
}
export class Unit{
    name:string;
    constructor(){
        this.name = "Unnamed";
    }
}
/**
 * A caller of engine need to implement this interface, so the engine can have a delegate to Server
 */
export interface Networker{
    /**
     * Send message to all player
     * @param type: the message flag/type
     * @param message : the message data to send (See Doc to see more definition of message and)
     */
    send_message_all(type,message);
    /**
     * The engine will call this method to send message to client
     * @param id : the player id
     * @param type: the message flag/type
     * @param message : the message data to send (See Doc to see more definition of message and)
     */
    send_message_to(id:number,type,message);

    /**
     * Engine will let the server know when the game is end
     * @param id:number the stop code, if not provides, the game was considered to end decently,
     * otherwise, the game exit with error
     */
    send_end_signal(id:number);
}

export class World {
    map: Map;
    players: Array<GamePlayer>;
    server:Networker;

    constructor(map_dir,sender) {
        this.server = sender;
        try{
            var mp = require("../map/" + map_dir + "/index.js");
            this.map = new mp.CustomMap();
            this.map.init();
        }catch (err){
            log_error(err);
            log_error("Fatal error: Can not load map!");
            if(this.server){
                this.server.send_end_signal(1);
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

/**
 * global log level indicator
 * Can be:
 *      5: info,success,warning,error
 *      4: success,warning,error
 *      3: warning,error
 *      2: error
 * @type {number} default:5
 */
var g_log_level = 5;

/**
 * Is debug mode
 * If this set to true, we can use log_debug to output more detail
 * @type {boolean}
 */
var g_debug = true;

/**
 * Outsize world can change the log_level
 * @param level
 */
export function set_log_level(level){
    g_log_level = level;
}

/**
 * Log color definition
 */
var LogColor = require("colors");
LogColor.setTheme(ColorSet.std);

/**
 * Log helper, those function can print log to stdout
 *
 */
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