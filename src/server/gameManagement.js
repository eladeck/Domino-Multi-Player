const express = require('express');
const auth = require('./auth');

const gameManagement = express.Router(); // router is like a 'mini-app'... 

/******************************* business logic of the game ******************************************************/
const boardSize = 58;
const numOfPlayers = 1; // future: get it dynamicly from lobby (2 or 3!) 

// playersSessionIds = [`243rfSA@`, `23232dsd`, `232432DFavdvG34`];
playersSessionIds = ['2321eSAD'];

let State = function() {
    this.boardSize = boardSize;
    this.logicBoard = buildBoard();
    this.shuffledTiles = shuffleTiles();
    this.tiles = createTiles(); // ["00","01", ... ] 
    this.potTiles = this.shuffledTiles.slice(6 * numOfPlayers, 28);
    this.playersTiles = createPlayersTiles(this.shuffledTiles);
    this.activePlayer = 0; // 0 -> 1 -> 2 -> (3?) -> 0 ... (activePlayer + 1) % numOfPlayers
} // State c'tor

const state = new State(); // the main instance of the state (of the gameState)


function createPlayersTiles(shuffledTiles) {
    let playersTiles = [shuffledTiles.slice(0, 6), shuffledTiles.slice(6, 12)];
    if(numOfPlayers === 3) {
        playersTiles.push(shuffleTiles(slice(12, 18)))
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

    // toDelete
    playersSessionIds[0] = req.session.id;

    res.send({
        logicBoard: state.logicBoard,
        playerTiles: state.playersTiles[playersSessionIds.indexOf(req.session.id)],
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









module.exports = gameManagement