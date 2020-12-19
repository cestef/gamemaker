const Matchmaker = require("./src/index");

function startMatch(players) {
    //"player" parameter structure: {player: the player object, addedAt: timestamp when the player was added to the queue}
    console.log(`Match started with players: ${players.map(e => e.player.name)}`); //fired when a match starts, passing all the players as arguments
};

function getPlayerID(player) {
    return player.id; //Return the player property that includes its id
};

function matchPlayers(players) {
    ///... do something to check if the players match together
    return true;
    //return true or false
};

function sortQueue(a, b) {
    //sort with the a and b player object
    return a - b
};
const defaultQueue = []; // default matchmaker queue (array)
const matcher = new Matchmaker(startMatch, getPlayerID, {
    checkInterval: 2000, // interval in ms to check the queue
    minMatchSize: 2, //minimal party size to launch the match
    maxMatchSize: 5, //max party size
    matchPlayersFunction: matchPlayers, //the function used to tell if the player match together or not (default returns true)
    sortQueueFunction: sortQueue, //the function used to sort the queue (default sort by add time)
    queue: defaultQueue, //the default queue for the matchMaker (default [])
});
matcher.init(); //init the matchmaker interval
matcher.addPlayer({name:"Bob", id:0}); //Add a player named "Bob"
matcher.addPlayer({name:"John", id:1, someRandomProperty:[123]}) //You can also add other properties to the player object
matcher.removePlayerByID(0); //will remove "Bob" from the queue
matcher.addPlayer({name:"Alice", id:2}) //Add a player named "Alice"
matcher.getPlayerByID(1) //will return the "John" player object
