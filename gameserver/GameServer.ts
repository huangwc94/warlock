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
    var user_names = JSON.parse(process.argv[2]);
    if (!user_names) {
        /**
         var user_names = [{
         "empty":boolean // if this was set to true, then this slot is empty
         "id":user_id, // system generated one time use id
         "name":user_name // user preferred name
         },]
         */
        console.log("Usage: $ node GameServer [list of user object(required)] [port|8000] [map_folder_name|FirstMap] [Loglevel|5]");
        process.abort();
    }
    if (user_names.length != 12) {
        console.log("User name structure is invalid");
        console.log("Usage: $ node GameServer [list of user object(required)] [port|8000] [map_folder_name|FirstMap] [Loglevel|5]");
        process.abort();
    }
    for (let user of user_names) {
        if (user.empty) {
            continue;
        }
        if (!user.id || !user.name) {
            console.log("User name structure is invalid");
            console.log("Usage: $ node GameServer [list of user object(required)] [port|8000] [map_folder_name|FirstMap] [Loglevel|5]");
            process.abort();
        }
    }
} catch (err) {
    console.log("Usage: $ node GameServer [list of user name(required)] [port|8000] [map_folder_name|FirstMap] [Loglevel|5]");
    process.abort();
}

let debug = true;
let port = process.argv[3] || 8000;
let map_folder = process.argv[4] || "FirstMap";
if (!fs.existsSync("../map/" + map_folder + "/index")) {
    console.log("The map file is not existed");
    process.abort();
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
    sio: SocketIO.Server;

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
     * the index is the player id
     * the value is the player socket
     */
    in_game_socket: Array<SocketIO.Socket>;

    constructor() {
        this.log_info("Init World...");
        this.world = new World(map_folder);
        this.kick_list = {};
        this.in_game_socket = new Array<SocketIO.Socket>(13);
    }

    /**
     * Start the game, add socket event listener
     * @param port: The port number of this server to use
     */
    public start(port) {
        // init socket.io server
        this.log_info("Socket.io start");
        this.sio = S(port);
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

        process.abort();
    }

    /**
     * auto kick function
     * A user will be kick after 5s if it is not login
     * @param socket: the socket that need to be "taking care of"
     */
    private add_auto_kick(socket) {
        let timer_id = setTimeout(function () {
            GameServer.instance.kick_user(socket);
        }, 5);
        this.log_info("Socket:" + socket.id + " will be kicked after 5 s");
        this.kick_list[socket.id] = timer_id;
    }

    private remove_auto_kick(socket) {
        clearTimeout(this.kick_list[socket.id]);
        delete this.kick_list[socket.id];
        this.log_info("Socket:" + socket.id + " auto kick function was disabled");
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
        if (this.in_game_socket.indexOf(socket) > 0) {
            this.world.player_leave(this.in_game_socket.indexOf(socket));
            this.in_game_socket[this.in_game_socket.indexOf(socket)] = null;
        } else {
            this.remove_auto_kick(socket);
        }
        this.log_info("A User disconnect from server");
    }

    public kick_user(socket) {
        let id = this.in_game_socket.indexOf(socket);
        if (id > 0) {
            this.log_warning("In Game Player:" + id + " was kick by Game Server");
            this.world.player_leave(id);
            this.in_game_socket[id] = null;
        } else {
            this.remove_auto_kick(socket);
        }
        this.log_warning("A user was kicked by server");
    }

    /**
     * User Login
     * @param socket: the socket
     * @param e: {[id:string]:[name]:[string]}
     */
    public user_login(socket, e) {
        if (!e.id || !e.name) {
            this.log_warning("A user is using wrong data structure to login" + JSON.stringify(e));
        } else {
            let playerid = -1;
            let cont = 0;
            for (let usr of user_names) {
                cont += 1;
                if (usr.empty) {
                    continue;
                } else {
                    if (usr.id == e.id && usr.name == e.name) {
                        playerid = cont;
                        break;
                    }
                }
            }
            if (playerid > 0) {
                this.log_success("Player:" + user_names[playerid - 1] + " login successfully as playerid=" + playerid);
                this.add_user_to_world(playerid, user_names[playerid - 1], socket);
            } else {
                this.log_warning("Player:" + user_names[playerid - 1] + " login fail as playerid=" + playerid);
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
        this.remove_auto_kick(socket);
        this.world.player_join(id, name);
        this.in_game_socket[id] = socket;
        this.log_success("A user was adding to world name=" + name + " id=" + id);
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
            this.log_info("send out message:" + JSON.stringify(information));
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
}

GameServer.instance.start(port);