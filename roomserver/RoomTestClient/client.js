/**
 * Created by Weicheng Huang on 2016/11/7.
 */
/// <reference path="./node_modules/@types/jquery/index.d.ts"/>
/// <reference path="./node_modules/@types/socket.io-client/index.d.ts"/>
var client = io("ws://127.0.0.1:3000");
function draw_global(data) {
    var text = "<div class='row'><table class='table table-striped'><tr><td>ID</td><td>Room name</td><td>Host</td><td># of player</td><td>game started</td><td>action</td></tr>";
    for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
        var room = data_1[_i];
        text += "<tr>";
        text += "<td>" + room.room_id + "</td>";
        text += "<td>" + room.room_name + "</td>";
        text += "<td>" + room.room_owner.name + "</td>";
        text += "<td>" + room.player_list.length + "</td>";
        if (room.game_started) {
            text += "<td><span class='label label-danger'>Yes</span> </td>";
        }
        else {
            text += "<td><span class='label label-success'>No</span> </td>";
        }
        text += "<td><button class='btn btn-info' onclick=\"join_room(\'" + room.room_id + "\')\">" + "Join" + "</button></td>";
        text += "</tr>";
    }
    text += "</table></div>";
    $("#lobby").html(text);
}
function draw_room(data) {
    var text = "<h3>Room Name:" + data.room_name + "</h3>";
    if ($("#player_id").text() == data.room_owner.id) {
        text += "<input type='text' id='room_name_change'/>";
        text += "<button type='button' class='btn btn-success' onclick='rename_room()'>" + "Rename Room" + "</button>";
        text += "<button type='button' class='btn btn-info' onclick='start_game()'>" + "Start Game" + "</button>";
    }
    text += "<button type='button' class='btn btn-warning' onclick='leave_room()'>" + "Leave" + "</button>";
    text += "<button type='button' class='btn btn-primary' onclick='ready()'>" + "Ready" + "</button>";
    text += "<button type='button' class='btn btn-warning' onclick='unready()'>" + "Unready" + "</button>";
    text += "<h3>Owner:" + data.room_owner.name + "</h3>";
    text += "<h3>Number of Player:" + data.player_list.length + "</h3>";
    text += "<h3>Player List:</h3>";
    text += "<div class='row'><table class='table table-striped'><tr><td>ID</td><td>User name</td><td>ready</td><td>action</td></tr>";
    for (var _i = 0, _a = data.player_list; _i < _a.length; _i++) {
        var player = _a[_i];
        text += "<tr>";
        text += "<td>" + player.id + "</td>";
        text += "<td>" + player.name + "</td>";
        if (player.is_ready) {
            text += "<td><span class='label label-success'>Ready</span></td>";
        }
        else {
            text += "<td><span class='label label-danger'>Not Ready</span></td>";
        }
        if ($("#player_id").text() == data.room_owner.id) {
            text += "<td><button onclick=\"kick(\'" + player.id + "\')\">" + "Kick</button></td>";
        }
        text += "</tr>";
    }
    $("#room_inside").html(text);
}
function send_chat() {
    if ($("#chat_message").val() != "") {
        client.emit("action", { type: "chat", data: $("#chat_message").val() });
        $("#chat_message").val("");
    }
}
function join_room(room_id) {
    client.emit("action", { type: "join", data: room_id });
}
function start_game() {
    client.emit("action", { type: "start" });
}
function leave_room() {
    client.emit("action", { type: "leave" });
}
function rename() {
    client.emit("action", { type: "rename_player", data: $("#new_name").val() });
}
function rename_room() {
    client.emit("action", { type: "rename_room", data: $("#room_name_change").val() });
}
function create_room() {
    client.emit("action", { type: "create" });
}
function kick(id) {
    client.emit("action", { type: "kick", data: id });
}
function refresh() {
    client.emit("action", { type: "request_global" });
}
function ready() {
    client.emit("action", { type: "ready" });
}
function unready() {
    client.emit("action", { type: "unready" });
}
$(function () {
    client.emit("action", { type: "request_global" });
    $("#room").hide();
    $("#lobby").show();
    client.on("reply", function (data) {
        console.log(data);
        switch (data.type) {
            case "update_global":
                draw_global(data.data);
                break;
            case "update_room":
                draw_room(data.data);
                break;
            case "start_game":
                $("#room").html("<h1>Game Started! Good luck!</h1>");
                break;
            case "join":
                $("#title").text("Room Data");
                $("#lobby").hide();
                $("#room").show();
                break;
            case "update_player":
                $("#player_name").text(data.data.name);
                $("#player_ready").text(data.data.is_ready);
                $("#player_room").text(data.data.room);
                $("#player_id").text(data.data.id);
                if ($("#player_room").text() == "Not In Room") {
                    $("#title").text("Room List");
                    $("#lobby").show();
                    $("#room").hide();
                }
                break;
            case "chat":
                var p = document.createElement("p");
                p.innerText = data.data;
                $("#chat").append(p);
                $("#chat").scrollTop($("#chat").height());
                break;
            case "leave":
                $("#title").text("Room List");
                $("#lobby").show();
                $("#room").hide();
                refresh();
                break;
        }
    });
    client.on("user_log", function (e) {
        alert(e);
    });
});
//# sourceMappingURL=client.js.map