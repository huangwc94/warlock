# Engine will fire those event if specific event happend
`World.EventSystem` will be the singleton variable that emit and register event listener
~~~js
    import {World} from "./world";
~~~
## Player Related
##### PlayerObject will be kept, and all its unit will be keep as well by default, even the player leaves forever
##### And only the same player can rejoin into game.

| Event String | Event Explain | Event data | Note |
|:---:|---|---|---|
| `OnPlayerJoin` | Happens when a player join the world  | PlayerObject | 
| `OnPlayerLeave`| Happens when a player leave the world | PlayerObject | 
| `OnPlayerPause`| Happens when a player request a pause | PlayerObject |
|`OnPlayerResume`| Happens when a player call a resume| PlayerObject|

## World Related
| Event String | Event Explain | Event data | Note |
|:---:|---|---|---|
|`OnGameStarted`| Happens when system call the game start | Nothing | By the time when world initialized, the game is not considered `start`. only when all player join the game, GameServer will start the world | 
|`OnGameEnd`| Happens when system end the game | Nothing |
|`OnSecondPass`| Happens each second after game start | time in second from the game start|
|`OnPause`| Happens when system call the pause | Nothing |
|`OnResume`| Happens when system call the resume | Nothing |


