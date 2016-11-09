/**
 * Created by Weicheng Huang on 2016/11/8.
 */
import {GamePlayer} from "./GamePlayer";
import {Map} from "./Map";
import {GameServer} from "./GameServer";

export class World {
    map: Map;
    players: Array<GamePlayer>;

    constructor(map_dir) {

        try{
            var mp = require("../map/" + map_dir + "/FirstMap/index");
        }catch (err){
            GameServer.instance.log_error("Fatal error: Can not load map!");
            GameServer.instance.end(1);
        }

        this.map = new mp.CustomMap();
        this.map.init();
        this.players = [];
    }
    public run(){

    }

    public player_join(id, name) {

    }

    public player_input(id, e) {

    }
    public player_leave(id){

    }

}