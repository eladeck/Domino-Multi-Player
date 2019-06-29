const express = require('express');
const auth = require('./auth');

const gameManagement = express.Router(); // router is like a 'mini-app'... 

/******************************* business logic of the game ******************************************************/
const boardSize = 58;
const numOfPlayers = 2; // future: get it dynamicly from lobby (2 or 3!) 

// playersSessionIds = []; 

let State = function() {

    this.boardSize = boardSize;
    this.logicBoard = buildBoard();
    this.shuffledTiles = shuffleTiles();
    this.tiles = createTiles(); // ["00","01", ... ] 
    this.potTiles = this.shuffledTiles.slice(6 * numOfPlayers, 28);
    this.playersTiles = createPlayersTiles(this.shuffledTiles);
    this.activePlayer = 0; // 0 -> 1 -> 2 -> (3?) -> 0 ... (activePlayer + 1) % numOfPlayers
    this.isGameStarted = true;
    this.isGameOver = false;
    this.howManyPlayersAreReady = '';
    this.shouldGameStart = false;

    //Clock
    this.incrementer = null;
    this.secondsElapsed = 0;

    this.playersInfo = createPlayersInfo();



} // State c'tor

const state = new State(); // the main instance of the state (of the gameState)
calculatePlayersScore();
// startGameLogics();

function startGameLogics() {
    this.incrementer = setInterval(() => 
            state.secondsElapsed = state.secondsElapsed + 1 ,1000 /*ms*/);

    state.shouldGameStart = true;
} // startGameLogics

function finishGameLogics() {
    clearInterval(state.incrementer);
} // finishGameLogics

function createPlayersInfo() {
    let playersInfo = [];
    for(let i = 0; i < numOfPlayers; i++) {
        let player = {
            name: '',
            sessionId: '',
            stats: {
                totalTurns: 0,
                totalPot: 0,
                avgTimePerTurn: 0,
                score: 0,
            } // player stats
        }; // player

        playersInfo[i] = player;
    } // for

    return playersInfo;
} // createPlayersInfo


function getScoreFromTiles(playerTiles){
     
    let res = 0;
    for(let i = 0 ; i < playerTiles.length; i++)
        res += parseInt((playerTiles[i])[0]) + parseInt((playerTiles[i])[1]);

    return res;
}

function createPlayersTiles(shuffledTiles) {
    let playersTiles = [shuffledTiles.slice(0, 6), shuffledTiles.slice(6, 12)];
    if(numOfPlayers === 3) {
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

function fillPlayersSessionIds(id) {
    if(state.playersInfo[0].sessionId === '') {
        state.playersInfo[0].sessionId = id;
        state.howManyPlayersAreReady = `1/${numOfPlayers}`;
    }
    if(state.playersInfo[1].sessionId === '' && id !== state.playersInfo[0].sessionId) {
        state.playersInfo[1].sessionId = id;
        state.howManyPlayersAreReady = `2/${numOfPlayers}`;
    }
    if(state.playersInfo[2] && state.playersInfo[2].sessionId === '' && id !== state.playersInfo[0].sessionId && id !== state.playersInfo[1].sessionId) {
        state.playersInfo[2].sessionId = id;
        state.howManyPlayersAreReady = `3/${numOfPlayers}`;
    }

    // start game! numOfplayers === 2 && 2 taim => tathil
    if(((numOfPlayers === 2 && state.playersInfo[1].sessionId !== '') ||
       (numOfPlayers === 3 && state.playersInfo[2].sessionId !== '')) &&
       !state.shouldGameStart) {
           startGameLogics();
       }  // if
} // fillPlayersSessionIds

function calculatePlayersScore() {
    for(let i = 0; i < numOfPlayers; i++) {
        state.playersInfo[i].stats.score = getScoreFromTiles(state.playersTiles[i])
    } // for
} // calculatePlayersScore

function extractPlayerUniqueId(id) {
    for(let i = 0; i < numOfPlayers; i++)
        if(state.playersInfo[i].sessionId === id)
            return i;
    return 'err';
} // extractPlayerUniqueId

/******************************* request handling ***************************************************/
// gameManagement.get('/state',auth.userAuthentication, (req, res) => {
gameManagement.get('/state', (req, res) => { // העפתי את הקוד של שפיבק 

   fillPlayersSessionIds(req.session.id);

   const playerUniqueId = extractPlayerUniqueId(req.session.id);
   if(playerUniqueId === 'err') throw `${req.session.id} is not in the sessions list!!`
 
    res.send({ // returning the logic board, and the SPECIFIC playerTiles that requested the state!
        logicBoard: state.logicBoard,
        playerTiles: state.playersTiles[playerUniqueId],
        yourUniqueId: playerUniqueId,
        activePlayer: state.activePlayer,
        secondsElapsed: state.secondsElapsed,
        stats: state.playersInfo[playerUniqueId].stats,
        howManyPlayersAreReady: state.howManyPlayersAreReady,
        shouldGameStart: state.shouldGameStart,
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
    calculatePlayersScore();

    // 4. switch turn...
    state.activePlayer = (state.activePlayer + 1) % numOfPlayers;

    res.sendStatus(200);
});

gameManagement.post('/pot', auth.userAuthentication, (req, res) => {

    if(state.potTiles.length === 0) { // gonna be an error
           console.log ("Pot is empty")
           res.status(403).send('pot is empty!');
    } else { // gonna be good
        const oldPotTiles = state.potTiles;
        const oldPlayerTiles = state.playersTiles[state.activePlayer];
        //this.statesArray.push(this.deepClone(this.state));
        oldPlayerTiles.push(oldPotTiles.splice(oldPotTiles.length -1, 1)[0]);


        state.potTiles = oldPotTiles;
        state.playersTiles[state.activePlayer] = oldPlayerTiles;

        // after taking from the pot, we should re-calc the player score
        calculatePlayersScore();

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

        state.activePlayer = (state.activePlayer + 1) % numOfPlayers
        res.sendStatus(200);
    } // else
    

}); // POST.'/pot' handling





module.exports = gameManagement