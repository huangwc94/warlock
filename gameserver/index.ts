/**
 * Created by Weicheng Huang on 2016/11/10.
 */
import {GameServer} from "./GameServer";
import * as process from "process";
if (require.main === module) {

    var fs = require("fs");
    process.chdir(__dirname);


    /**
     * Argument preparation
     * g_user_names(required): a list of slot description, only valid user can join this game, socket need to login
     * port(optional,default:8000): the port that runs this game server
     * map_folder(optional,default:"FirstMap"): the map that will be used in this game
     * debug(optional,default:true): if we need to output debug information
     */

    try {
        var g_user_names;
        if (process.argv[2]) {
            g_user_names = JSON.parse(process.argv[2]);
        } else {
            console.log("Caller did not provides user_name definition, using test definition instead!");
            g_user_names = [
                {"empty": false, "id": "111", "name": "qqq"},
                {"empty": false, "id": "222", "name": "www"},
                {"empty": false, "id": "333", "name": "eee"},
                {"empty": false, "id": "444", "name": "rrr"},
                {"empty": false, "id": "555", "name": "ttt"},
                {"empty": true},
                {"empty": false, "id": "666", "name": "yyy"},
                {"empty": false, "id": "777", "name": "uuu"},
                {"empty": false, "id": "888", "name": "iii"},
                {"empty": false, "id": "999", "name": "ooo"},
                {"empty": false, "id": "000", "name": "ppp"},
                {"empty": true}];
        }

        if (!g_user_names) {
            /**
             var g_user_names = [{
         "empty":boolean // if this was set to true, then this slot is empty
         "id":user_id, // system generated one time use id
         "name":user_name // user preferred name
         },]
             */
            console.log("Usage: $ node GameServer [list of user object(required)] [port|8000] [map_folder_name|FirstMap] [Loglevel|5]");
            process.exit();
        }
        if (g_user_names.length != 12) {
            console.log("User name structure is invalid");
            console.log("Usage: $ node GameServer [list of user object(required)] [port|8000] [map_folder_name|FirstMap] [Loglevel|5]");
            process.exit();
        }
        for (let user of g_user_names) {
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

    var g_port = process.argv[3] || 8000;
    var g_map_folder = process.argv[4] || "FirstMap";
    if (!fs.existsSync("../map/" + g_map_folder + "/index.js")) {
        console.log("The map file is not existed");
        process.exit();
    }
    var g_log_level = process.argv[5] || 5;
    /**
     * This is the function call to start the game server
     */
    var s = new GameServer(g_user_names, g_map_folder, g_port, g_log_level);
    s.start();
}