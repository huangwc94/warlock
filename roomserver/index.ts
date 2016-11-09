import {Player} from "./player";
import {Room} from "./room";
import {stringify} from "querystring";
/**
 * Created by Weicheng Huang on 2016/11/7.
 */

var S = require("socket.io");
/**
 * TODO:
 * 1, Add Team element to room server
 */


export class MasterRoom{
    player_list:Array<Player>;
    room_list:Array<Room>;
    sio;
    constructor(){
        this.player_list = new Array<Player>();
        this.room_list = new Array<Room>();
    }
    public run(){
        this.sio = S(3000);

        this.sio.on("connection",function (socket) {
            var player = new Player(socket);
            console.log("New Player connected!");
            MR.player_list.push(player);
            let res = [];
            for(let room of MR.room_list) {
                res.push(room.room_status());
            }
            console.log("user request global");
            player.socket.emit("reply",{type:"update_global",data:res});

            socket.on("action",function (action) {
                console.log("Player Request:" + stringify(action));
                if(action){
                    switch (action.type) {
                        case "create":
                            if(player.room){
                                player.socket.emit("user_log","You are in a room already! Can not create room.");
                            }else{
                                let room = new Room(MR,player.name+" room",player);
                                MR.room_list.push(room);
                                MR.update_global();
                            }
                            break;
                        case "join":
                            let room_index = -1;
                            for(let room of MR.room_list){
                                if(room.room_id == action.data){
                                    room_index = MR.room_list.indexOf(room);
                                    break;
                                }
                            }
                            if(room_index>=0){
                                let rm = MR.room_list[room_index];
                                rm.join(player);
                            }else{
                                player.socket.emit("user_log","Can not find room.");
                            }
                            break;
                        case "rename_player":
                            player.update_name(action.data);
                            break;
                        case "rename_room":
                            if(player.room){
                                player.room.rename_room(player,action.data);
                            }else{
                                player.socket.emit("user_log","You are not in any room.");
                            }
                            break;
                        case "chat":
                            if(player.room){
                                player.chat(action.data);
                            }else{
                                player.socket.emit("user_log","You are not in any room.");
                            }
                            break;
                        case "leave":
                            if(player.room){
                                player.room.leave(player);
                            }else{
                                player.socket.emit("user_log","You are not in any room.");
                            }
                            break;
                        case "kick":
                            if(player.room){
                                player.room.kick_player(player,action.data);
                            }else{
                                player.socket.emit("user_log","You are not in any room.");
                            }
                            break;
                        case "ready":
                            if(player.room){
                                player.room.ready(player);
                            }else{
                                player.socket.emit("user_log","You are not in any room.");
                            }
                            break;
                        case "unready":
                            if(player.room){
                                player.room.unready(player);
                            }else{
                                player.socket.emit("user_log","You are not in any room.");
                            }
                            break;
                        case "start":
                            if(player.room){
                                player.room.start_game(player);
                            }else{
                                player.socket.emit("user_log","You are not in any room.");
                            }
                            break;
                        case "request_global":
                            let res = [];
                            for(let room of MR.room_list) {
                                res.push(room.room_status());
                            }
                            console.log("user request global");
                            player.socket.emit("reply",{type:"update_global",data:res});
                            break;
                        default:
                            console.log("Invalid action posted by player:" + action);
                            break;
                    }
                }else{
                    console.log("Invalid action posted by player:"+action);
                }

            });
            socket.on("disconnect",function () {
                if(player.room){
                    player.room.leave(player);
                }
                MR.player_list.splice(MR.player_list.indexOf(player),1);
                console.log("Player:"+player.name+" disconnected!");
            });
        });
        console.log("Server Started on Port:3000");
    }
    public remove_room(room){
        if(MR.room_list.indexOf(room) >= 0){
            MR.room_list.splice(MR.room_list.indexOf(room),1);
            console.log("Room "+room.room_id+" has been removed");
            this.update_global();
        }else{
            console.log("Strange stuff happend! trying to remove room that is not existed");
        }
    }
    public update_global(){
        let res = [];
        for(let room of MR.room_list) {
            res.push(room.room_status());
        }
        this.broadcast("update_global",res);
    }
    public broadcast(type,msg){
        console.log("broadcast message global: with type:"+type + " data:"+msg);
        for(let player of MR.player_list){
            player.socket.emit("reply",{type:type,data:msg});
        }
    }
}
var MR = new MasterRoom();
MR.run();


