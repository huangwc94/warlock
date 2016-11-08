/**
 * Created by Weicheng Huang on 2016/11/7.
 */
import {Room} from "./room";
export class Player{
    id:string;
    name : string;
    socket : SocketIO.Socket;
    room:Room;
    is_ready:boolean;

    constructor(socket) {

        this.socket = socket;
        this.room = null;
        this.is_ready = false;
        this.id = socket.id;
        this.update_name(socket.id);
    }

    public toJSON(){
        let res = {};
        res["id"] = this.id;
        res["name"] = this.name;
        res["is_ready"] = this.is_ready;
        res["room"] = this.room === null ? "Not In Room" : this.room.room_name;
        return res;
    }
    public update_user(){
        this.socket.emit("reply",{type:"update_player",data:this.toJSON()});
    }
    public chat(message:string){
        if(message && this.room){
            this.room.broadcast("chat",this.name +" said:"+message);
        }
    }
    public update_name(new_name){
        console.log("new name:"+new_name);
        if(new_name){
            this.name = new_name;

            this.socket.emit("reply",{type:"update_player",data:this.toJSON()});
            if(this.room){
                this.room.update_room();
            }
        }

    }
}