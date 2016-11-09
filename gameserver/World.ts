/**
 * Created by Weicheng Huang on 2016/11/8.
 */
import {GamePlayer} from "./GamePlayer";
import {Map} from "./Map";

export class World {
    map: Map;
    players: Array<GamePlayer>;

    constructor(map_dir) {
        let mp = require("../map/" + map_dir + "/FirstMap/index");
        this.map = new mp.CustomMap();
        this.map.init();
        this.players = [];
    }

    public player_join(id, name) {

    }

    public player_input(id, e) {

    }
    public player_leave(id){

    }
}