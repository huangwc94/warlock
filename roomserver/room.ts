/**
 * Created by Weicheng Huang on 2016/11/7.
 */
import {Player} from "./player";
import {GameServer} from "GameServer.ts";
import {MasterRoom} from "./index";
import Timer = NodeJS.Timer;
var ROOM_ID = 0;
const ROOM_CAPACITY = 10;
export class Room{
    owner:Player;
    room_id:number;
    room_name:string;
    player_list:Array<Player>;
    game_started:boolean;
    master_server:MasterRoom;
    ban_list:Array<string>;
    start_remain:number;
    start_timer:Timer;
    constructor(master_server,room_name:string,room_owner:Player){
        this.master_server = master_server;
        this.room_id = ROOM_ID;
        ROOM_ID ++ ;
        this.owner = room_owner;
        this.player_list = [];
        this.room_name = room_name;
        this.game_started = false;
        this.ban_list = [];
        this.join(room_owner);
        this.start_remain = 5;
        this.start_timer = null;
        console.log("Room:"+this.room_name+" created by "+room_owner.name);
    }

    public join(caller:Player){
        if(this.game_started){
            caller.socket.emit("user_log","Cannot join game, the game is started!");
            return;
        }
        if(caller.room !== null){
            caller.socket.emit("user_log","You are already in a room,leave that room first");
            return;
        }
        if(this.player_list.length >= ROOM_CAPACITY){
            caller.socket.emit("user_log","Can not join room, the room is full!");
            return;
        }
        if(this.ban_list.indexOf(caller.id) >=0){
            caller.socket.emit("user_log","You were kicked by this room before, can not join again");
            return;
        }
        caller.room = this;
        this.player_list.push(caller);
        caller.socket.emit("reply",{type:"join"});
        this.update_room();
        console.log("Player:"+caller.name+" join room:"+this.room_name);
    }
    public rename_room(caller,new_name){
        if(this.owner != caller){
            caller.socket.emit("user_log","Only the owner of this room can change the name");
            return;
        }
        if(!new_name){
            caller.socket.emit("user_log","New name is invalid!");
            return;
        }
        console.log("Room name changed from:"+this.room_name + " to:"+new_name);
        this.room_name = new_name;
        this.update_room();
        this.master_server.update_global();
    }
    public destroy_room(){
        for(let player of this.player_list){
            if(player.id != this.owner.id){
                this.leave(player);
            }
        }
        console.log("Room:"+this.room_name+" destroyed!");
        this.master_server.remove_room(this);
    }
    public kick_player(caller:Player,target_id:string){
        if(caller != this.owner){
            caller.socket.emit("user_log","You are not the owner of this room, can not kick other player");
            return;
        }
        if(caller.id == target_id){
            caller.socket.emit("user_log","You can not kick yourself");
            return;
        }

        for(let player of this.player_list){
            if(player.id == target_id){
                this.ban_list.push(player.id);
                console.log("Player:"+player.name+" has been kicked by host! and added to ban list");
                this.leave(player);
                return;
            }
        }

    }
    public leave(caller:Player){
        if(this.player_list.indexOf(caller) >=0){
            caller.room = null;
            caller.is_ready = false;
            caller.socket.emit("reply",{type:"leave"});
            console.log("Player:"+caller.name+" leave room:"+this.room_name);
            this.player_list.splice(this.player_list.indexOf(caller),1);
            caller.update_user();
            this.update_room();
            if(caller == this.owner){
                this.destroy_room();
            }
        }else{
            console.log("user is not in room");
        }

    }
    public ready(caller:Player){
        if(this.player_list.indexOf(caller) >=0) {
            caller.is_ready = true;
            console.log("Player:"+caller.name + " ready for game in room:"+this.room_name);

            this.update_room();
        }
    }
    public unready(caller:Player){
        if(this.player_list.indexOf(caller) >=0) {
            caller.is_ready = false;

            console.log("Player:"+caller.name+" unready for the game in room:"+this.room_name);
            this.update_room();
        }
    }

    public start_game(caller:Player){
        if(caller != this.owner){
            caller.socket.emit("user_log","You are not the owner of this room, can not start the game");
            return;
        }
        for(let player of this.player_list){
            if(!player.is_ready){
                caller.socket.emit("user_log","Someone in your room is not ready! Can not start the game!");
                return;
            }
        }
        console.log("Room:"+this.room_name+" game started after 5 seconds");
        this.start_timer = setInterval(function (room) {
            if(room.start_remain == 0){
                room._real_start_game();
            }
            room.broadcast("chat","Game start in "+room.start_remain + "s");
            room.start_remain --;

        },1000,this);
    }
    public _real_start_game(){
        clearInterval(this.start_timer);
        this.master_server.update_global();
        this.broadcast("start_game",{address:"127.0.0.1",port:8080 + this.room_id});
        this.game_started = true;
        this.master_server.update_global();
    }
    public room_status(){
        let res = {};
        res['room_name'] = this.room_name;
        res['room_id'] = this.room_id;
        res['room_owner'] = this.owner.toJSON();
        res['player_list'] = this.player_status();
        res["game_started"] = this.game_started;
        return res;
    }

    public player_status(){
        let res = [];
        for(let player of this.player_list){
            res.push(player.toJSON());
        }
        return res;
    }
    public update_room(){
        console.log("update room broadcast:"+this.room_name);
        this.broadcast("update_room",this.room_status());
    }

    public broadcast(type,msg){
        console.log("broadcast message in room:"+this.room_name + "with type:"+type + " data:"+msg);
        for(let player of this.player_list){
            player.update_user();
            player.socket.emit("reply",{type:type,data:msg});
        }
    }
}