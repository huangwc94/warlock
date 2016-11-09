/**
 * GameServer class handles the incoming/outcoming socket event,
 * And provides as a Singleton Object to all other game class
 *
 * The purpose of this class is to provide an abstract player input/output layer
 * So everything come into game logic(World class) is safe
 *
 * This class manages all sockets, the world will not need to touch socket programming at all
 * Created by Weicheng Huang on 2016/11/7.
 *
 * caller: $ node GameServer [list of user name(required)] [port|8000] [map_folder_name|FirstMap] [Loglevel|5]
 */
// Import all necessary module
import * as process from "process";
import {ColorSet} from "./gamecolor";
import {World} from "./world";
var fs = require("fs");
process.chdir(__dirname);

var LogColor = require("colors");
LogColor.setTheme(ColorSet.std);

var S = require("socket.io");

/**
 * Argument preparation
 * user_names(required): a list of slot description, only valid user can join this game, socket need to login
 * port(optional,default:8000): the port that runs this game server
 * map_folder(optional,default:"FirstMap"): the map that will be used in this game
 * debug(optional,default:true): if we need to output debug information
 */

try {
    var user_names;
    if(process.argv[2]){
        user_names = JSON.parse(process.argv[2]);
    }else{
        console.log("Caller did not provides user_name definition, using test definition instead!");
        user_names = [
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
    }

    if (!user_names) {
        /**
         var user_names = [{
         "empty":boolean // if this was set to true, then this slot is empty
         "id":user_id, // system generated one time use id
         "name":user_name // user preferred name
         },]
         */
        console.log("Usage: $ node GameServer [list of user object(required)] [port|8000] [map_folder_name|FirstMap] [Loglevel|5]");
        process.exit();
    }
    if (user_names.length != 12) {
        console.log("User name structure is invalid");
        console.log("Usage: $ node GameServer [list of user object(required)] [port|8000] [map_folder_name|FirstMap] [Loglevel|5]");
        process.exit();
    }
    for (let user of user_names) {
        if (user.empty) {
            continue;
        }
        if (!user["id"] || !user["name"]) {
            console.log("User name structure is invalid");
            console.log("Usage: $ node GameServer [list of user object(required)] [port|8000] [map_folder_name|FirstMap] [Loglevel|5]");
            process.exit();
        }
    }
} catch (err) {
    console.log(err);
    console.log("Usage: $ node GameServer [list of user name(required)] [port|8000] [map_folder_name|FirstMap] [Loglevel|5]");
    process.exit();
}

let debug = true;
let port = process.argv[3] || 8000;
let map_folder = process.argv[4] || "FirstMap";
if (!fs.existsSync("../map/" + map_folder + "/index.js")) {
    console.log("The map file is not existed");
    process.exit();
}
let log_level = process.argv[5] || 5;

export class GameServer {
    /**
     * Singleton instance of GameServer itself, can be access from anywhere
     * @type {GameServer}
     */
    static instance: GameServer = new GameServer();

    /**
     * A world instance, that handles all game logic
     */
    world: World;

    /**
     * The socket.io server
     */
    sio;

    /**
     * kick list maintains the a dict of socket_id and timer_id
     * only socket that login added to world will keep, other socket will be kicked after 5s
     *  var kick_list = {
     *      socket_id:timer_id
     *  }
     */
    kick_list: {};

    /**
     * var in_game_socket = [socket]
     * the test.ts is the player id
     * the value is the player socket
     */
    in_game_socket: Array<SocketIO.Socket>;

    constructor() {


        this.kick_list = {};
        this.in_game_socket = new Array<SocketIO.Socket>(12);
    }

    /**
     * Start the game, add socket event listener
     * @param port: The port number of this server to use
     */
    public start(port) {
        // init world
        this.log_info("Init World...");
        this.world = new World(map_folder);

        // init socket.io server
        this.log_info("Socket.io start");
        this.sio = new S(port);

        this.log_success("Network is up, listening port:" + port);

        // handling socket connection
        this.sio.on("connection", function (socket) {
            GameServer.instance.user_connect(socket);
            socket.on("login", function (e) {
                GameServer.instance.user_login(this, e);
            });
            socket.on("game_action", function (e) {
                GameServer.instance.user_input(this, e);
            });
            socket.on("disconnect", function () {
                GameServer.instance.user_disconnect(this);
            })
        });
        this.log_success("World is running now!");
        this.world.run();
    }

    /**
     * End game
     * This will quit the server decently, should only be called by world object
     */
    public end(code) {
        if (code) {
            this.log_error("Game Shut down because of error");
        } else {
            this.log_success("Game Finish Successfully!");
            this.world = null;
        }

        process.exit();
    }

    /**
     * auto kick function
     * A user will be kick after 5s if it is not login
     * @param socket: the socket that need to be "taking care of"
     */
    private add_auto_kick(socket) {
        let timer_id = setTimeout(function () {
            GameServer.instance.kick_user(socket);
        }, 3000);
        this.log_info("Socket:" + socket.id + " will be kicked after 3s");
        this.kick_list[socket.id] = timer_id;
    }

    private remove_auto_kick(socket) {
        if(this.kick_list[socket.id]){
            clearTimeout(this.kick_list[socket.id]);
            delete this.kick_list[socket.id];
            this.log_info("Socket:" + socket.id + " auto kick function was disabled");
        }
    }

    /**
     * Socket event
     * @param socket
     */
    private user_connect(socket) {
        this.log_info("A User connect to server, socket_id=" + socket.id);
        this.add_auto_kick(socket);
    }

    private user_input(socket, action) {
        if (this.in_game_socket.indexOf(socket) > 0) {
            this.log_info("Getting Player Input:" + JSON.stringify(action));
            this.world.player_input(this.in_game_socket.indexOf(socket), action);
        }
    }

    private user_disconnect(socket) {
        if (this.in_game_socket.indexOf(socket) >= 0) {
            this.world.player_leave(this.in_game_socket.indexOf(socket));
            this.log_warning("In game Player leave, ID = "+this.in_game_socket.indexOf(socket));
            this.in_game_socket[this.in_game_socket.indexOf(socket)] = null;

        } else {
            this.remove_auto_kick(socket);
        }
        this.log_info("A User disconnect from server:"+socket.id);
    }

    public kick_user(socket) {
        let id = this.in_game_socket.indexOf(socket);
        if (id >= 0) {
            this.log_warning("In Game Player:" + id + " was kick by Game Server");
            this.world.player_leave(id);
            this.in_game_socket[id] = null;
        } else {
            this.remove_auto_kick(socket);
        }
        socket.disconnect();
        this.log_warning("A User:" + socket.id + " was kick by Game Server");
    }

    /**
     * User Login
     * @param socket: the socket
     * @param e: {[id:string]:[name]:[string]}
     */
    public user_login(socket, e) {
        if (!e || !e["id"] || !e["name"]) {
            this.log_warning("A user is using wrong data structure to login:" + JSON.stringify(e));
            this.kick_user(socket);
        } else {
            let playerid = -1;
            let cont = -1;
            for (let usr of user_names) {
                cont += 1;
                if (usr.empty) {
                    continue;
                } else {
                    if (usr["id"] == e.id && usr["name"] == e.name) {
                        playerid = cont;
                        break;
                    }
                }
            }
            if (playerid >= 0) {
                this.log_success("Player:" + JSON.stringify(user_names[playerid]) + " login successfully as playerid=" + playerid);
                this.add_user_to_world(playerid, user_names[playerid]["name"], socket);
            } else {
                this.log_warning("Player:" + user_names[playerid] + " login fail as playerid=" + playerid);
                this.kick_user(socket);
            }
        }
    }

    /**
     * Add a user to the world, this user was successfully login
     * @param id
     * @param name
     * @param socket
     */
    private add_user_to_world(id, name, socket) {
        if(this.in_game_socket[id] == socket){
            this.log_warning("Duplicated user login action d="+id+", ignored");
            return;
        }
        if(this.in_game_socket[id]){
            this.log_warning("Different user login into same slot:id="+id+", kick old socket");
            this.kick_user(this.in_game_socket[id]);
        }
        this.remove_auto_kick(socket);
        this.world.player_join(id, name);
        this.in_game_socket[id] = socket;
        this.log_success("A user was adding to world name=" + JSON.stringify(name) + " id=" + id);
    }

    /**
     * Send information to player with id
     *
     * @param id:number
     * @param information: JSON
     */
    public send_to_user(id, information) {
        try {
            this.in_game_socket[id].emit("game_reply", information);
            this.log_info("send out message to player="+id+":" + JSON.stringify(information));
        } catch (err) {
            this.log_error("Unable to send reply to player id=" + id + " with information:" + JSON.stringify(information));
        }
    }

    /**
     * Broadcast Message to all player in the game
     * @param msg
     */


    // logger
    public log_info(msg) {
        if (log_level > 4) {
            console.log(LogColor.info(Date() + ":" + msg));
        }

    }

    public log_debug(msg) {
        if (debug) {
            console.log(LogColor.debug(Date() + ":" + msg));
        }
    }

    public log_warning(msg) {
        if (log_level > 2) {
            console.log(LogColor.warning(Date() + ":" + msg));
        }
    }

    public log_error(msg) {
        if (log_level > 1) {
            console.log(LogColor.error(Date() + ":" + msg));
        }
    }

    public log_success(msg) {
        if (log_level > 3) {
            console.log(LogColor.success(Date() + ":" + msg));
        }
    }
    public log_dump(){
        this.log_debug("====================== CORE DUMP ======================");

        this.log_debug("========================= END =========================");
    }
}

/**
 * This is the function call to start the game server
 */
GameServer.instance.start(port);

