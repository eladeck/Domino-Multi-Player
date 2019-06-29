const express = require('express');
const auth = require('./auth');

const gameManagement = express.Router(); // router is like a 'mini-app'... 

/******************************* business logic of the game ******************************************************/
const boardSize = 58;
const numOfPlayers = 2; // future: get it dynamicly from lobby (2 or 3!) 

playersSessionIds = [];

let State = function() {
    this.boardSize = boardSize;
    this.logicBoard = buildBoard();
    this.shuffledTiles = shuffleTiles();
    this.tiles = createTiles(); // ["00","01", ... ] 
    this.potTiles = this.shuffledTiles.slice(6 * numOfPlayers, 28);
    this.playersTiles = createPlayersTiles(this.shuffledTiles);
    this.activePlayer = 0; // 0 -> 1 -> 2 -> (3?) -> 0 ... (activePlayer + 1) % numOfPlayers
    this.playersStats = createPlayerStatsArray();
} // State c'tor

const state = new State(); // the main instance of the state (of the gameState)

function createPlayerStatsArray()
{
    console.log("createPlayerStatsArray")
     let arr = [];
     for(let i = 0; i < numOfPlayers; i++)
     {
         let obj = {totalTurns: 0,
                    totalPot: 0,
                    avgTimePerTurn: 0,
                    score:0,};
        arr.push(obj);
     }
     return arr;
}

function getScoreFromTiles(playerTiles){
     
    let res = 0;
    for(let i = 0 ; i < playerTiles.length; i++)
        res += parseInt((playerTiles[i])[0]) + parseInt((playerTiles[i])[1]);

    return res;
}

function createPlayersTiles(shuffledTiles) {
    let playersTiles = [shuffledTiles.slice(0, 6), shuffledTiles.slice(6, 12)];
    if(numOfPlayers === 3) {
    let playersTiles = [shuffledTiles.slice(0, 6), shuffledTiles.slice(6, 12)];
        playersTiles.push(shuffledTiles.slice(12, 18))
    } // if (numOfPlayers === 3)

    return playersTiles;
} // createPlayersTiles

function shuffleTiles() {
    let organized = createTiles();
    let shuffled = [];
    var a = [];
    var b = [];
    for (var i = 0; i < 28; i++)
      a.push(i);
    for (a, i = a.length; i--; ) {
      var random = a.splice(Math.floor(Math.random() * (i + 1)), 1)[0];
      b.push(random)
    }
    for(let i = 0; i <=27; i++) {
        shuffled[b[i]] = organized[i];
    }
    return shuffled;
} // shuffleTiles

function createTiles() {
    let res = [];
    for(let i = 0; i <= 6; i++) 
        for(let j = 0; j <= 6; j++) 
            if(j >= i) 
                res.push(`${i}${j}`);
            
    return res;
} // createTiles

function buildBoard() {
    let board = [];
    let row = [];
    for(let i = 0; i < boardSize; i++) {
        for(let j = 0; j < boardSize; j++) {
            row.push(` `);
        }
        board.push(row);
        row = [];
    }

    return board;
} // buildBoard



/**************************** request handling ***************************************************/
gameManagement.get('/state', auth.userAuthentication, (req, res) => { // 'get the whole board'

   // console.log(playersSessionIds)
    if(playersSessionIds[0] === undefined) // enter the first player id
         playersSessionIds[0] = req.session.id;
    if(playersSessionIds[1] === undefined && req.session.id !== playersSessionIds[0]) // // enter the second player id
        playersSessionIds[1] = req.session.id;
    if(playersSessionIds[2] === undefined && req.session.id !== playersSessionIds[0] && req.session.id !== playersSessionIds[1]) // // enter the third player id
        playersSessionIds[2] = req.session.id;

    if(state.playersStats !== undefined) // calc the score of the players 
    {
        for(let i = 0; i < numOfPlayers; i++)
        {
           state.playersStats[i].score = getScoreFromTiles(state.playersTiles[i])
        }

    }
    console.log(state.playersStats[playersSessionIds.indexOf(req.session.id)].score)
    res.send({ // returning the logic board, and the SPECIFIC playerTiles that requested the state!
        logicBoard: state.logicBoard,
        playerTiles: state.playersTiles[playersSessionIds.indexOf(req.session.id)], 
        yourUniqueId: playersSessionIds.indexOf(req.session.id), // number 0, 1 or 2 
        activePlayer: state.activePlayer,
        yourScore: state.playersStats[playersSessionIds.indexOf(req.session.id)].score,
    });
});

gameManagement.post('/move', auth.userAuthentication, (req, res) => {
    
    
    // update the state of the game: 
    let i = req.query.i;
    let j = req.query.j;
    let tile = req.query.selectedTile;
    let verticality = req.query.verticality;

    console.log(`got a request to make a move, i,j are ${i},${j},
    and tile is ${tile}`);

    // 1. the logic board should change
    state.logicBoard[i][j] = `${tile},${verticality}`; 


    // 2. the active player tiles should be shorter... 
    activePlayerTiles = state.playersTiles[state.activePlayer];
    activePlayerTiles.splice(activePlayerTiles.indexOf(tile), 1);


    // 3. score and stuff...

    // 4. switch turn...
    state.activePlayer = (state.activePlayer + 1) % numOfPlayers;

    res.sendStatus(200);
});

gameManagement.post('/pot', auth.userAuthentication, (req, res) => {

    //console.log("in here" + state.potTiles.length);

    console.log(state.playersStats);


    if(state.potTiles.length === 0) {
           console.log ("Pot is empty")
            //there is no alert in the server 
            //we need to allert the client 
    }
    else
    {
        const oldPotTiles = state.potTiles;
        const oldPlayerTiles = state.playersTiles[state.activePlayer];
        //this.statesArray.push(this.deepClone(this.state));
        oldPlayerTiles.push(oldPotTiles.splice(oldPotTiles.length -1, 1)[0]);


        state.potTiles = oldPotTiles;
        state.playersTiles[state.activePlayer] = oldPlayerTiles;

        /////////////////////////////////

        // need to deal with this as well!

        // totalTurns: prevState.totalTurns + 1,
        // totalPot: prevState.totalPot + 1,
        // avgTimePerTurn: (prevState.secondsElapsed / (prevState.totalTurns + 1)).toFixed(2),
        // score : this.getScoreFromTiles(this.state.playerTiles),
        // currentStateIndex: prevState.currentStateIndex  + 1,

                //         if(curPotTiles.length <= 1) {
        //                 window.setTimeout(() => {
        //                 if(!this.state.isGameOver && this.hasNoMoreLegalMoves()) {
        //                     alert('player loses!')
        //                     this.setState({
        //                         isGameOver:true
        //                     })
        //                 } // if
        //         } , 1000); 
        //     } // if


   }
   
   state.activePlayer = (state.activePlayer + 1) % numOfPlayers
   res.sendStatus(200);


});





module.exports = gameManagement