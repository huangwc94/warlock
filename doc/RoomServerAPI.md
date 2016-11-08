##This file describe the Room Server API

### Client Call

#### Room related client call
* Join room
~~~js
channel = "action"
data = {type:"join",data:room_id}
~~~
* Create room
~~~js
channel = "action"
data = {type:"create"}
~~~
* Leave room
~~~js
channel = "action"
data = {type:"rename", data:new_name}
~~~
* Rename room (room owner only)
~~~js
channel = "action"
data = {type:"rename_room",data:"new room name"}
~~~
* Kick player (room owner only)
~~~js
channel = "action"
data = {type:"kick",data:"player_id"}
~~~
* ready & unready (only valid when user is in room)
~~~js
channel = "action"
data = {type:ready/unready}
~~~
* start game (room owner only)
~~~js
channel = "action"
data = { type: "start" }
~~~
* Room chat send (only works in room)
~~~js
channel = "action"
data = {type:"chat",data:"message to chat"}
~~~
#### User related client call

* refresh global
~~~js
channel = "action"
data = { type: "request_global" }
~~~
* Rename user
~~~js
channel = "action"
data = { type: "rename_player", data: "new name"}
~~~

### Server call
* Update room status (player in room will receive)
~~~js
channel = "reply"
data = {type:"update_room",data:room_data}
~~~
* Update global data (everyone will receice)
~~~js
channel = "reply"
data = {type:"update_global",data:global_data}
~~~
* Update User (user will receive its own update)
~~~js
channel = "reply"
data = {type:"update_player",data:user_data}
~~~
* Start game (player in room will receive)
~~~js
channel = "reply"
data = {
    type:"start_game",
    data:{
        address:"address of game server",
        port:"port of game server"
    }
}
~~~
* Room chat receive (player in room will receive)
~~~js
channel = "reply"
data = {type:"chat",data:"message with sender name"}
~~~
* Error on client call (caller will receive)
~~~js
channel = "user_log"
data = "Reason"
~~~

#### Server call Data Structure
~~~js
var user_data = {
    id:string, // the id of this user
    name:string, // the name of this user
    room:Room, // the room name if this user is in a room, otherwise="Not In Room"
    is_ready:boolean // if this user is ready for game, only valid in room
}
var room_data = {
    room_id:number, // the room id of this room
    room_name:string, // the room name of this room
    room_owner:user_data, // the owner's user_data
    game_started:boolean, // to mark if this room is start playing
    player_list:Array<user_data> // an array of user_data of all member in this room
}
var global_data = Array<room_data> // an array of room_data explained above
~~~