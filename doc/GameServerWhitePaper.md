# Warlock Game Server Architecture

## What we want to accomplish
* This is a iOS online game, inspired by `Warcraft III` RPG map "Warlock", using a RTS style control system.  
* In this game, each player will have a controllable character to move in a plane
* Each player can launch a fire ball to shoot each other
* The fire ball and character are following certain 2D physics rules, like two fireball will bounce when collision happen,
or character can be push to the reversed direction where fire ball comes and hit it.
* The system is scalable and expendable, can add new spell and play mode without changing server's engine.
* Contains a map system, that user can play different map without changing server.
* User should not feel lag or hugh lag.
* Player will not need to update their client when publishing new map on the server.

## Client and Server Technology
* Client using Unity Mobile technology
* Server using nodejs and socket.io for communicating
* Networking using websocket for communication
* Centralize Server will be hosted on Heroku or other Saas platform
* Game asset are collected from Unity Asset Store and free online model website

## Networking Technology
* Lockstep is bounded by the most slow client in a game, since we are developing a mobile game, it is impossible to use
Lockstep because mobile phone and it's 3G connection is unpredictable, plus iOS and Android will have different implementation
on float point. Lockstep will not be enrolled our consideration.
* Using Dumb Client & Master Server is not feasible because, still, mobile phone network is unpredictable. Too much data packet
will overwhelm the client.
* To make things easier, we have current assumption:
  * Server have unlimited calculation resource. (This can be achieve by adding more node in AWS)
  * Packet will arrived ASAP to client, and vice versa. (Latency is stable)
  * Latency will <=100ms. (Provides more )
* Finally, the curve implementation of client/server idea, introduced by [Forrest Smith](https://blog.forrestthewoods.com/the-tech-of-planetary-annihilation-chronocam-292e3d6b169a#.pidp66dxn) was taking into account.

## Network Structure
* Client is act like a half monitor and half server in the game, the client will upload all player's action to server. like (move to (x,y)), (cast spell, id = X, angle = X)
* Server will update the character in the world, and return back the status of character, like (update character set speed_x = X,speed_y = Y Where id = X)
* Client will play animation and move that character with latest updated data structure.
* Server will not send packet until new client input arrive. or internal event happen.
* Take a look at Game Server API for more information about this structure.

## Pros and cons
#### Pros
* All game logic are calculated in server, cheat is hard to happen.
* Server is easy to design: can be considered as a single player game from the server's perspective.
* Less client update patch required, balance spell damage and other data can be adjusted on the fly.
* Only adding new model and client side code will require client update.
* Player can play at their best network condition, only slow network player will suffer from latency.
* Player can join in the middle of game. i.e. Inspector

#### Cons
* Player will see a little "pull back" when moving.
* Can not guarantee every player see exact same world. (latency <=50ms can see almost the same world)
* Have to reimplementing some wheels that unity can provides. i.e. physics system
* Server needs more calculation resource, since Nodejs is not good at CPU heavy task. To make sure game is run smoothly, server pulses at least 30fps
* Player might be hit by fire ball that seems not possible to collied character. or vice versa.

## Other Concern
* The team have no experience on mobile online game developing, nobody knows what the game will look like when all our design 
push on the table.
* Once popular, the budget for running server is a significant number.

  