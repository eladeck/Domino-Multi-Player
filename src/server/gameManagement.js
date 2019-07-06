const express = require('express');
const auth = require('./auth');

const gameManagement = express.Router(); // router is like a 'mini-app'... 

let allGames = {}; // pairs of {gameId : state}

/********************************** */

gameManagement.post('/createNewGame', (req, res) => {
    req.body = JSON.parse(req.body);
    console.log(`server just got request to open a new game with req.body.gameName of ${req.body.gameName}`)
    console.log(req.body.numOfPlayers)

    let gameId = `${req.session.id}${req.body.gameName}`;

    let newGame = new State(gameId,
                            gameOwnerId = req.session.id,
                            gameName = req.body.gameName,
                            numOfPlayers = req.body.numOfPlayers);

    allGames[gameId] = newGame;

    calculatePlayersScore(gameId);

    res.send({gameId}); // sending back to the client the gameId
});



/******************************* business logic of the game ******************************************************/
const boardSize = 58;

// playersSessionIds = [];

// gameId = `${req.session.id}${req.body.gameName}`,
//                             gameOwnerId = req.session.id,
//                             gameName = req.body.gameName,
//                             numOfPlayers = req.body.numOfPlayers);

let State = function(gameId, gameOwnerId, gameName, numOfPlayers) {

    this.gameId = gameId;
    this.numOfPlayers = numOfPlayers; // should change it all over the code, cause it was OUTSIDE of state
    this.gameName = gameName; 
    this.gameOwnerId = gameOwnerId;

    this.boardSize = boardSize;
    this.logicBoard = buildBoard();
    this.shuffledTiles = shuffleTiles();
    this.tiles = createTiles(); // ["00","01", ... ] 
    this.potTiles = this.shuffledTiles.slice(6 * numOfPlayers, 28);
    this.playersTiles = createPlayersTiles(this.shuffledTiles);
    this.activePlayer = 0; // 0 -> 1 -> 2 -> (3?) -> 0 ... (activePlayer + 1) % numOfPlayers
    this.activePlayersArr = numOfPlayers === 2 ? [0, 1] : [0, 1, 2]
    this.activePlayerIndex = 0;
    this.howManyPlayersAreReady = '';
    this.shouldGameStart = false; // maybe chagne name to: isGameOn?
    this.isGameOver = false;
    this.playersInfo = createPlayersInfo();


    //Clock
    this.incrementer = null;
    this.secondsElapsed = 0;
    



} // State c'tor

// gameStates[gameId].playersTile

// const states;
//  = new State(); // the main instance of the state (of the gameState)

// startGameLogics();

function startGameLogics(gameId) {
    this.incrementer = setInterval(() => 
            allGames[gameId].secondsElapsed = allGames[gameId].secondsElapsed + 1 ,1000 /*ms*/);

    allGames[gameId].shouldGameStart = true;
} // startGameLogics

function finishGameLogics(gameId) {
    clearInterval(allGames[gameId].incrementer);
} // finishGameLogics

function createPlayersInfo() {
    let playersInfo = [];
    for(let i = 0; i < numOfPlayers; i++) {
        let player = {
            name: '',
            sessionId: '',
            playerTime: 0,
            won: false,
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
} // getScoreFromTiles

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

function fillPlayersSessionIds(id, gameId) {
    if(allGames[gameId].playersInfo[0].sessionId === '') {
        allGames[gameId].playersInfo[0].sessionId = id;
        allGames[gameId].howManyPlayersAreReady = `1/${numOfPlayers}`;
    }
    if(allGames[gameId].playersInfo[1].sessionId === '' && id !== allGames[gameId].playersInfo[0].sessionId) {
        allGames[gameId].playersInfo[1].sessionId = id;
        allGames[gameId].howManyPlayersAreReady = `2/${numOfPlayers}`;
    }
    if(allGames[gameId].playersInfo[2] && allGames[gameId].playersInfo[2].sessionId === '' && id !== allGames[gameId].playersInfo[0].sessionId && id !== allGames[gameId].playersInfo[1].sessionId) {
        allGames[gameId].playersInfo[2].sessionId = id;
        allGames[gameId].howManyPlayersAreReady = `3/${numOfPlayers}`;
    }

    // start game! numOfplayers === 2 && 2 taim => tathil
    if(((numOfPlayers === 2 && allGames[gameId].playersInfo[1].sessionId !== '') ||
       (numOfPlayers === 3 && allGames[gameId].playersInfo[2].sessionId !== '')) &&
       !allGames[gameId].shouldGameStart) {
           startGameLogics(gameId);
       }  // if
} // fillPlayersSessionIds

function calculatePlayersScore(gameId) {
    console.log(`in calcu players and gameId is ${gameId}, while allGames.gameId is ${allGames[gameId]}`);
    // for(let i = 0; i < numOfPlayers; i++) {
    //     allGames[gameId].playersInfo[i].stats.score = getScoreFromTiles(allGames[gameId].playersTiles[i])
    for(let i = 0; i < allGames[gameId].activePlayersArr.length; i++) { 
        // updating the score ONLY of the players that left in the game. activePlayerArr could look like [0,2] cause 1 has won
        allGames[gameId].playersInfo[allGames[gameId].activePlayersArr[i]].stats.score = getScoreFromTiles(allGames[gameId].playersTiles[i])
    } // for
} // calculatePlayersScore

function extractPlayerUniqueId(id, gameId) { // UnqiueId is simply the number of the player: 0, 1 (or 2, in case of 3 players)
    for(let i = 0; i < numOfPlayers; i++)
        if(allGames[gameId].playersInfo[i].sessionId === id)
            return i;
    return 'err';
} // extractPlayerUniqueId

function calcPlayerSeconds(gameId)
{
    if(numOfPlayers === 3) // the time is the total time minus the other users times.
    {
        allGames[gameId].playersInfo[allGames[gameId].activePlayer].playerTime = allGames[gameId].playersInfo[allGames[gameId].activePlayer].playerTime 
         + allGames[gameId].secondsElapsed - allGames[gameId].playersInfo[(allGames[gameId].activePlayer + 1 ) % numOfPlayers].playerTime
          - allGames[gameId].playersInfo[(allGames[gameId].activePlayer + 2 ) % numOfPlayers].playerTime 
    }
    if(numOfPlayers === 2)
    {
        allGames[gameId].playersInfo[allGames[gameId].activePlayer].playerTime = allGames[gameId].playersInfo[allGames[gameId].activePlayer].playerTime 
         + allGames[gameId].secondsElapsed - allGames[gameId].playersInfo[(allGames[gameId].activePlayer + 1 ) % numOfPlayers].playerTime
    }
} // calcPlayerSeconds

function updateStats(gameId) {
    allGames[gameId].playersInfo[allGames[gameId].activePlayer].stats.totalTurns = allGames[gameId].playersInfo[allGames[gameId].activePlayer].stats.totalTurns + 1;
    allGames[gameId].playersInfo[allGames[gameId].activePlayer].stats.totalPot = allGames[gameId].playersInfo[allGames[gameId].activePlayer].stats.totalPot + 1;
    allGames[gameId].playersInfo[allGames[gameId].activePlayer].stats.avgTimePerTurn =   (allGames[gameId].playersInfo[allGames[gameId].activePlayer].playerTime / (  allGames[gameId].playersInfo[allGames[gameId].activePlayer].stats.totalTurns)).toFixed(2)
} // updateStats

function updateStatsAndCalcPlayerSeconds(gameId) {
    calcPlayerSeconds(gameId);
    updateStats(gameId);
} // updateStats

function activePlayerWinsLogics(gameId) {
    allGames[gameId].activePlayersArr.splice(allGames[gameId].activePlayer, 1); // delete the 'activePlayer' in the arr
    allGames[gameId].playersInfo[allGames[gameId].activePlayer].won = true; // mark activePlayer won to true in it's object
    
    if(allGames[gameId].activePlayersArr.length === 1) { // if only 1 player left... then:
        allGames[gameId].isGameOver = true; // it's like: isGameOver = true;
    } // else


} // activePlayerWinsLogics

function switchTurn(gameId) {
    // allGames[gameId].activePlayer = (allGames[gameId].activePlayer + 1) % numOfPlayers; // for instacne: [0,1,2] => [0,2]
    if(allGames[gameId].playersInfo[allGames[gameId].activePlayer].won === true) {
        allGames[gameId].activePlayerIndex = allGames[gameId].activePlayerIndex % allGames[gameId].activePlayersArr.length; // no "+ 1", cause we spliced him from the array
    } else {
        allGames[gameId].activePlayerIndex = (allGames[gameId].activePlayerIndex + 1) % allGames[gameId].activePlayersArr.length; 
    }

    allGames[gameId].activePlayer = allGames[gameId].activePlayersArr[allGames[gameId].activePlayerIndex];
} // switchTurn

/******************************* request handling ***************************************************/
// gameManagement.get('/state',auth.userAuthentication, (req, res) => {
gameManagement.get('/state', (req, res) => { // העפתי את הקוד של שפיבק אבל עכשיו זה מכניס לפה שחקנים שלא רשומים בסשן'ס ליסט. כן צריך את האות' של ספיבק שיסנן שחקנים שלא ביוזרס ליסט. צריך לחשוב זה מקרה קצה בתכל'ס. נראלי.


    let gameId = req.query.gameId;

   fillPlayersSessionIds(req.session.id, gameId);



   const playerUniqueId = extractPlayerUniqueId(req.session.id, gameId); // UnqiueId is simply the number of the player: 0, 1 (or 2, in case of 3 players)
   if(playerUniqueId === 'err') throw `${req.session.id} is not in the sessions list!!`
 
    res.send({ // returning the logic board, and the SPECIFIC playerTiles that requested the state!
        logicBoard: allGames[gameId].logicBoard,
        playerTiles: allGames[gameId].playersTiles[playerUniqueId],
        yourUniqueId: playerUniqueId, // UnqiueId is simply the number of the player: 0, 1 (or 2, in case of 3 players)
        youWon: allGames[gameId].playersInfo[playerUniqueId].won,
        activePlayer: allGames[gameId].activePlayer,
        secondsElapsed: allGames[gameId].secondsElapsed,
        stats: allGames[gameId].playersInfo[playerUniqueId].stats,
        howManyPlayersAreReady: allGames[gameId].howManyPlayersAreReady,
        isGameOver: allGames[gameId].isGameOver,
        shouldGameStart: allGames[gameId].shouldGameStart,
    });
});

gameManagement.post('/move', auth.userAuthentication, (req, res) => {

    const gameId = req.query.gameId;
    
    // update the state of the game: 
    let i = req.query.i;
    let j = req.query.j;
    let tile = req.query.selectedTile;
    let verticality = req.query.verticality;

    // 1. the logic board should change
    allGames[gameId].logicBoard[i][j] = `${tile},${verticality}`; 

    // 2. the active player tiles should be shorter... 
    activePlayerTiles = allGames[gameId].playersTiles[allGames[gameId].activePlayer];
    activePlayerTiles.splice(activePlayerTiles.indexOf(tile), 1);
    
    // 3. score and stuff...
    calculatePlayersScore(gameId);
    updateStatsAndCalcPlayerSeconds(gameId);

    if(activePlayerTiles.length === 0) {
        activePlayerWinsLogics(gameId); // then activePlayerWins!
    }

    // switch turn...
    switchTurn(gameId);


    res.sendStatus(200);
});

gameManagement.post('/pot', auth.userAuthentication, (req, res) => {

    const gameId = req.query.gameId;

    if(allGames[gameId].potTiles.length === 0) { // gonna be an error
           console.log ("Pot is empty")
           res.status(403).send('pot is empty!');
    } else { // gonna be good
        const oldPotTiles = allGames[gameId].potTiles;
        const oldPlayerTiles = allGames[gameId].playersTiles[allGames[gameId].activePlayer];
        //this.statesArray.push(this.deepClone(this.state));
        oldPlayerTiles.push(oldPotTiles.splice(oldPotTiles.length -1, 1)[0]);


        allGames[gameId].potTiles = oldPotTiles;
        allGames[gameId].playersTiles[allGames[gameId].activePlayer] = oldPlayerTiles;

        // after taking from the pot, we should re-calc the player score
        calculatePlayersScore(gameId);
        calcPlayerSeconds(gameId);

        // update some Shay's stuff that we should bring out to a function!
        allGames[gameId].playersInfo[allGames[gameId].activePlayer].stats.totalTurns = allGames[gameId].playersInfo[allGames[gameId].activePlayer].stats.totalTurns + 1;
        allGames[gameId].playersInfo[allGames[gameId].activePlayer].stats.totalPot = allGames[gameId].playersInfo[allGames[gameId].activePlayer].stats.totalPot + 1;
        allGames[gameId].playersInfo[allGames[gameId].activePlayer].stats.avgTimePerTurn =   (allGames[gameId].playersInfo[allGames[gameId].activePlayer].playerTime / (  allGames[gameId].playersInfo[allGames[gameId].activePlayer].stats.totalTurns)).toFixed(2)

        if(allGames[gameId].potTiles.length === 0) { // if now potTiles === 0, it means no more potTiles. if you don't have legal moves: game is over
            var someCodeLine = 'some';
            if(hasNoMoreLegalMoves()) { // should delete this and move all to client. he'll notify us if hasMoreLegalmoves

            } else {

            }
        } // if
        
        switchTurn(gameId);
   
        res.sendStatus(200);
        //   : (prevState.secondsElapsed / (prevState.totalTurns + 1)).toFixed(2),

        /////////////////////////////////

        // need to deal with this as well!

        // score : this.getScoreFromTiles(this.allGames[gameId].playerTiles),
        // currentStateIndex: prevState.currentStateIndex  + 1,

                //         if(curPotTiles.length <= 1) {
        //                 window.setTimeout(() => {
        //                 if(!this.allGames[gameId].isGameOver && this.hasNoMoreLegalMoves()) {
        //                     alert('player loses!')
        //                     this.setState({
        //                         isGameOver:true
        //                     })
        //                 } // if
        //         } , 1000); 
        //     } // if

    } // else
    

}); // POST.'/pot' handling





module.exports = {gameManagement, allGames}