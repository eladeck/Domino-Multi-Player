import React, {Component} from 'react'
import Board from './Board.js';
import Player from './Player.js';
import Statistics from './Statistics.js'
import ChatContainer from '../chat/chatContainer.js'
// import { stat } from 'fs';
// import Back from './back.png';
// import Front from './front.png';

function formatSeconds(secondsElapsed) {
    const minutes = Math.floor(secondsElapsed / 60);
    const seconds = ('0' + secondsElapsed % 60).slice(-2);
    return minutes + ':' + seconds;
  }

class GameRoom extends Component {
    constructor(props) {
        super(props);
        this.statesArray = [];
        this.isLastTileWasPlaced = false;
        this.boardSize = 58; // some extra room so we don't get to the edges!

        this.state = {
            // tiles:null, // ["00","01", ... ] 
            // shuffledTiles,
            // potTiles,
            playerTiles:null, 
            selectedTile:null, // an ID!!!!!!!!! NOT a ref to DOM element!!
            logicBoard:null,
            mineUniqueId:null, // UnqiueId is simply the number of the player: 0, 1 (or 2, in case of 3 players)
            activePlayer:null,
            howManyPlayersAreReady:null, // gonna be a string like "1/3" or "2/2"
            shouldGameStart:false, // server will let us know once game should start
            isGameOver:false, 
            youWon:false, 
            playersInfo:[],
            finishMessage:null,


            //stats
            stats:{
                totalTurns: 0,
                totalPot: 0,
                avgTimePerTurn: 0,
                score: 0,
            },

        }
        
        this.handleSelected = this.handleSelected.bind(this);
        this.tileWasPlaced = this.tileWasPlaced.bind(this);
        this.takeTileFromPot = this.takeTileFromPot.bind(this);
        this.isMoveValid = this.isMoveValid.bind(this);
        this.handelUndoClcik = this.handelUndoClcik.bind(this);
        this.hasNoMoreLegalMoves = this.hasNoMoreLegalMoves.bind(this);
        this.handleGoToLobby = this.handleGoToLobby.bind(this);
        
        // this.getScoreFromTiles = this.getScoreFromTiles.bind(this);
        this.deepClone = this.deepClone.bind(this);


        this.handelPrevClick = this.handelPrevClick.bind(this);
        this.handelNextClick = this.handelNextClick.bind(this);
        this.finishGame = this.finishGame.bind(this);

        this.getState = this.getState.bind(this);
        this.finishGameLogics = this.finishGameLogics.bind(this);

        
    }

  
    getState() {
        console.log(`watch only is ${this.props.watchOnly}`)
        fetch(`/game/state?gameId=${this.props.gameId}&watchOnly=${this.props.watchOnly}`, {method:'GET', credentials: 'include'})
        .then(response => {return response.json()})
        .then(state => {
            this.setState({
                logicBoard: state.logicBoard,
                playerTiles: state.playerTiles,
                mineUniqueId: state.yourUniqueId, // UnqiueId is simply the number of the player: 0, 1 (or 2, in case of 3 players)
                activePlayer: state.activePlayer,
                secondsElapsed: state.secondsElapsed,
                stats: state.stats,
                howManyPlayersAreReady:state.howManyPlayersAreReady, 
                shouldGameStart:state.shouldGameStart, 
                isGameOver: state.isGameOver,
                youWon:state.youWon, 
                playersInfo:state.playersInfo,
                allPlayersPot:state.allPlayersPot,
                playerName: state.playerName,
            })})
        
        if(!this.state.isGameOver) {
            this.timeoutId = setTimeout(this.getState, 200);
        } else {
            console.log(`in else`);
            this.finishGameLogics();
        }
    } // getState

    finishGameLogics()
    {
        console.log(`in finish Game Logics`);
        this.setState({finishMessage: 'Hope you enjoyed, going to lobby now...'}); 
        setTimeout(() => this.props.switchScreen('lobby'), 4000);
    }

    componentDidMount() {
        console.log(`in compononet DID mount`);
        this.getState();
    } // 

    componentWillUnmount() {
        console.log(`in compononet WILL mount`);
        clearTimeout(this.timeoutId);
    }

    
    hasNoMoreLegalMoves() {
        let res = false;
        // assuming logicBoard[i,j] is empty ' ', and there IS a selectedTile (both checked by the <Table /> Component)
        window.logicBoard = this.state.logicBoard;
        for(let i = 0; i < this.boardSize; i++) {
            for(let j = 0; j < this.boardSize; j++) {
                if(this.state.logicBoard[i][j] === ' ') {
                    for(let k = 0; k < this.state.playerTiles.length; k++) { //  for each player tile
                        const id = this.state.playerTiles[k];
                        const tileRef = document.getElementById(id);
                        const parentNodeVerticality = tileRef.parentNode.id;
                        let a;
                        for(a = 0; a < 4; a++) {
                            tileRef.parentNode.id = `verticality${a}`;
                            if(this.isMoveValid(i, j, tileRef)) {
                                tileRef.parentNode.id = parentNodeVerticality;
                                // console.log(`got a valid move at ${i}${j}, ${tileRef.id} could be there!`)
                                return false; // becase hasNoMoreLegalMoves is false! we DO HAVE A LEGAL
                            } // if
                            tileRef.parentNode.id = parentNodeVerticality;
                        } // for each verticality of it
                    } // for k
                } // only if it is a ' ' empty spot
            } // for j
        } // for i

        return true;
    } // hasNoMoreLegaLMoves

    boardIsEmpty() {
        for(let i = 0; i < this.boardSize; i++) 
            for(let j = 0; j < this.boardSize; j++) 
                if(this.state.logicBoard[i][j] !== ' ')
                    return false;
        return true;
    } // boardIsEmpty
    
    isMoveValid(indexI, indexJ, maybeSelectedTile) {
        
        // assuming logicBoard[i,j] is empty ' ', and there IS a selectedTile (both checked by the <Table /> Component)
        const i = parseInt(indexI);
        const j = parseInt(indexJ);
        const middleI = -2 + this.boardSize / 2;
        const middleJ = -2 + this.boardSize / 2;
        if(i === 0 || j === 0 || i === this.boardSize - 1 || j === this.boardSize - 1) {
            return false;
        }
        if(this.boardIsEmpty() && i === middleI && j === middleJ) { // first Move Case
            return true;
        }

        // not in the edge:
        const board = this.state.logicBoard;
        let selectedTile = maybeSelectedTile !== undefined ? maybeSelectedTile : this.state.selectedTile;
        selectedTile = document.getElementById(selectedTile);
        console.log(`ok...`);

        const verticality = Number(selectedTile.parentNode.id[11]);
        const top = Number(selectedTile.id[0]);
        const bottom = Number(selectedTile.id[1]);
        const isDouble = bottom === top;

        function createNeighboor(indexI, indexJ) {
            const values = board[indexI][indexJ];
            if(values === ' ') return null;

            const topBottomStr = values.split(',')[0];
            const verticalityInt = parseInt(values.split(',')[1]);
            const isDouble = topBottomStr[0] === topBottomStr[1];
            const meuzan = verticalityInt === 1 || verticalityInt === 3; 
            const meunah = verticalityInt === 2 || verticalityInt === 0; 
            let deFactoBottom = null;
            let deFactoTop = null;
            let deFactoRight = null;
            let deFactoLeft = null;

            if(meunah) { // 
                deFactoTop = parseInt(topBottomStr[verticalityInt === 0 ? 0 : 1]);
                deFactoBottom = parseInt(topBottomStr[verticalityInt === 2 ? 0 : 1]);
            } else {
                deFactoRight = parseInt(topBottomStr[verticalityInt === 1 ? 0 : 1]);
                deFactoLeft = parseInt(topBottomStr[verticalityInt === 3 ? 0 : 1]);
            } // else

            return {
                meunah,
                meuzan,
                verticalityInt,
                topBottomStr,
                isDouble,
                deFactoBottom,
                deFactoTop,
                deFactoRight, 
                deFactoLeft,
            };
        } // function createNeighboot

        const aboveMe = createNeighboor(i - 1, j);
        const bellowMe = createNeighboor(i + 1, j);
        const toMyLeft = createNeighboor(i, j - 1);
        const toMyRight = createNeighboor(i, j + 1);


        let moveValid = false;

        switch(verticality) { // assuming you can't put in the edges (we will build the board enough big)
            case 0: // Tile to put is Regular-Veritcal.
                if(isDouble) { // is double
                    if(aboveMe && !moveValid) {
                        moveValid = (top === aboveMe.deFactoBottom) || (aboveMe.isDouble && aboveMe.meuzan && aboveMe.deFactoLeft === top);
                    }
                    if(bellowMe && !moveValid) {
                        moveValid = (bottom === bellowMe.deFactoTop) || (bellowMe.isDouble && bellowMe.meuzan && bellowMe.deFactoLeft === bottom);
                    }
                    if(toMyLeft && !moveValid) {
                        moveValid = toMyLeft.meuzan && toMyLeft.deFactoRight === top;
                    }
                    if(toMyRight && !moveValid) {
                        moveValid = toMyRight.meuzan && toMyRight.deFactoLeft === top;
                    }
                } else { // I am not a double
                    if(aboveMe && !moveValid) { 
                        moveValid = (top === aboveMe.deFactoBottom) || (aboveMe.isDouble && aboveMe.meuzan && aboveMe.deFactoLeft === top);
                    } 
                    if(bellowMe && !moveValid) {
                        moveValid = (bottom === bellowMe.deFactoTop) || (bellowMe.isDouble && bellowMe.meuzan && bellowMe.deFactoLeft === bottom);
                    }
                } // else (its not a double) case verticality = 0
                break;
            case 1: // I am meuzan! top is myRight
                    if(isDouble) { // is I am double
                        if(aboveMe && !moveValid) {
                            moveValid = (top === aboveMe.deFactoBottom && aboveMe.meunah)
                        }
                        if(bellowMe && !moveValid) {
                            moveValid = (top === bellowMe.deFactoTop && bellowMe.meunah)
                        }
                        if(toMyLeft && !moveValid) {
                            moveValid = (toMyLeft.meuzan && toMyLeft.deFactoRight === bottom);
                        }
                        if(toMyRight && !moveValid) {
                            moveValid = toMyRight.meuzan && toMyRight.deFactoLeft === top;
                        }
                    } else { // I am not a double
                        if(toMyLeft && !moveValid) {
                            moveValid = (toMyLeft.meuzan && toMyLeft.deFactoRight === bottom) || (toMyLeft.meunah && toMyLeft.isDouble && toMyLeft.deFactoTop === bottom);
                        }
                        if(toMyRight && !moveValid) {
                            moveValid = (toMyRight.meuzan && toMyRight.deFactoLeft === top) || (toMyRight.meunah && toMyRight.isDouble && toMyRight.deFactoTop === top);
                        }
                    } 
                break;
            case 2: // I am meunah UpSide DOWN!
                    if(isDouble) { // is I am double
                        if(aboveMe && !moveValid) {
                            moveValid = (top === aboveMe.deFactoBottom && aboveMe.meunah)
                        }
                        if(bellowMe && !moveValid) {
                            moveValid = (top === bellowMe.deFactoTop && bellowMe.meunah)
                        }
                        if(toMyLeft && !moveValid) {
                            moveValid = (toMyLeft.meuzan && toMyLeft.deFactoRight === bottom);
                        }
                        if(toMyRight && !moveValid) {
                            moveValid = toMyRight.meuzan && toMyRight.deFactoLeft === top;
                        }
                    } else { // I am not a double
                        if(aboveMe && !moveValid) {
                            moveValid = (bottom === aboveMe.deFactoBottom && aboveMe.meunah) || (aboveMe.isDouble && aboveMe.meuzan && aboveMe.deFactoRight === bottom)
                        }
                        if(bellowMe && !moveValid) {
                            moveValid = (top === bellowMe.deFactoTop && bellowMe.meunah) || (bellowMe.isDouble && bellowMe.meuzan && bellowMe.deFactoRight === top)
                        }
                    } 
                break;
            case 3: // I am meuzan !!!TOP IS LEFT!!
            if(isDouble) { // is I am double
                if(aboveMe && !moveValid) {
                    moveValid = (top === aboveMe.deFactoBottom && aboveMe.meunah)
                }
                if(bellowMe && !moveValid) {
                    moveValid = (top === bellowMe.deFactoTop && bellowMe.meunah)
                }
                if(toMyLeft && !moveValid) {
                    moveValid = (toMyLeft.meuzan && toMyLeft.deFactoRight === bottom);
                }
                if(toMyRight && !moveValid) {
                    moveValid = toMyRight.meuzan && toMyRight.deFactoLeft === top;
                }
            } else { // I am not a double
                if(toMyLeft && !moveValid) {
                    moveValid = (toMyLeft.meuzan && toMyLeft.deFactoRight === top) || (toMyLeft.meunah && toMyLeft.isDouble && toMyLeft.deFactoTop === top);
                }
                if(toMyRight && !moveValid) {
                    moveValid = (toMyRight.meuzan && toMyRight.deFactoLeft === bottom) || (toMyRight.meunah && toMyRight.isDouble && toMyRight.deFactoTop === bottom);
                }
            } 
                break;
            } // switch

        return moveValid;
    } // isMoveValid

    handelUndoClcik(){
        this.handelPrevClick();
        this.statesArray.pop();
    }

    handelPrevClick(){
        if(this.state.currentStateIndex === parseInt(0))
            alert("There are no more moves back");
        this.setState(this.statesArray[this.state.currentStateIndex -1])
    }

    handelNextClick(){
        if(this.statesArray.length -1 === parseInt(this.state.currentStateIndex))
        {
                alert("Can not move step forward")
        }
        else
               this.setState(this.statesArray[this.state.currentStateIndex + 1])

    }

    deepClone(stateObj) {
        stateObj.selectedTile = undefined;
        const stateStr = JSON.stringify(stateObj)

        return JSON.parse(stateStr);
    }

    // getScoreFromTiles(playerTiles){
     
    //     let res = 0;
    //     for(let i = 0 ; i < playerTiles.length; i++)
    //         res += parseInt((playerTiles[i])[0]) + parseInt((playerTiles[i])[1]);

    //     return res;
    // }

    handleSelected(selectedTile) {
        // setState => selectedTile gets updated => Game gets rendered => Player props.selectedTile is having className='selected'
        this.setState({
            selectedTile
        })
    } // handleSelected

    takeTileFromPot() {
        const curPotTiles = this.state.potTiles;
      
        // 1. notyfing the sever that we made a move (we already checked that it is legal)
        fetch(`/game/pot?gameId=${this.props.gameId}`, {method:'POST', credentials: 'include'})
        .then(res => {
            if(!res.ok) {
                alert('there is problem: pot might be empty');
            }
        });

        // selectedTile is the last thing that WE hold, hence we must manually set the State.
        this.setState({selectedTile:null})


    //     if(this.state.potTiles.length === 0) {
    //         alert("Pot is empty")
    //     } else {
    //         this.setState(prevState => {
    //             const oldPotTiles = prevState.potTiles;
    //             const oldPlayerTiles = prevState.playerTiles;
    //             this.statesArray.push(this.deepClone(this.state));
    //             oldPlayerTiles.push(oldPotTiles.splice(oldPotTiles.length -1, 1)[0]);
    //             return {
    //                 potTiles: oldPotTiles,
    //                 playerTiles : oldPlayerTiles,
    //                 totalTurns: prevState.totalTurns + 1,
    //                 totalPot: prevState.totalPot + 1,
    //                 avgTimePerTurn: (prevState.secondsElapsed / (prevState.totalTurns + 1)).toFixed(2),
    //                 score : this.getScoreFromTiles(this.state.playerTiles),
    //                 currentStateIndex: prevState.currentStateIndex  + 1,
    //               //  prevTurn : turns1
    //             }
    //         }) 
    // } // else

            
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
    } // takeFromPot
    
    tileWasPlaced(tile) { // "03"


        // 1. remove this Tile from "player tyles" (once you setThis state, the props to the Player will changed)
        this.setState(prevState => {
            return {
                selectedTile:null,
                // toServer
                // totalTurns: prevState.totalTurns + 1,
                // avgTimePerTurn: (prevState.secondsElapsed / (prevState.totalTurns + 1)).toFixed(2),
                // score: this.getScoreFromTiles(this.state.playerTiles),
            }
        });



    
        // toServer
        //         if(this.state.potTiles.length === 0) {
        //             window.setTimeout(() => {
        //             if(!this.state.isGameOver && this.hasNoMoreLegalMoves()) {
        //                 alert('player loses!')
        //                 this.setState({
        //                     isGameOver:true
        //                 })
        //             } // if
        //     } , 1000); 
        // } // if
        
        // if(this.state.playerTiles.length - 1 === parseInt('0'))
        // {
        //     this.setState({
        //         isGameOver: true,
        //         win:true,
        //         isLastTile: true
        //     })
        //     for(let i = 0; i < this.statesArray.length; i++)
        //     {
        //         this.statesArray[i].isGameOver = true;
        //         this.statesArray[i].win = true;
        //     }
        // }
    } // tileWasPlaced

    

    finishGame()
    {
        const r = window.confirm("Do you want to play a new game? sure?");
         if(r == true)
          {
            this.isLastTileWasPlaced = false;
            this.shuffledTiles = this.shuffleTiles();
            this.firstSix = this.shuffledTiles.slice(0, 6);
            this.statesArray = [];
               this.setState(
                   {
                    tiles: this.createTiles(), // ["00","01", ... ] 
                    shuffledTiles: this.shuffledTiles,
                    potTiles: this.shuffledTiles.slice(6, 28),
                    playerTiles: this.shuffledTiles.slice(0, 6),
                    selectedTile:null, // a REAL reference to the tile <div> element! (it's id is selectedTile.id)
                    logicBoard: this.buildBoard(),
        
                   }
               )
          }
    }

    handleGoToLobby() {
        clearTimeout(this.timeoutId);

        fetch(`game/goToLobby?gameId=${this.props.gameId}&watchOnly=${this.props.watchOnly}`, {method:'POST', credentials:'include'})
        
        setTimeout(() => this.props.switchScreen('lobby'), 200);
    }

    
    render() {
        let isMyTurn = this.state.activePlayer === this.state.mineUniqueId; // UnqiueId is simply the number of the player: 0, 1 (or 2, in case of 3 players)
        console.log(this.state.playersInfo)
        let isThreePlayers = false;
        if(this.state.howManyPlayersAreReady != undefined)
             if(Number(this.state.howManyPlayersAreReady[2]) === Number(3))
                  isThreePlayers = true;
        window.state = this.state;
        console.log(this.state.playersInfo)
        // if(this.state.isLastTile && this.isLastTileWasPlaced === false)  // push the last move to the array 
        // {
        //     this.isLastTileWasPlaced = true;
        //     this.setState({isLastTile: false})
        //     this.statesArray.push(this.deepClone(this.state));

        // }
        // if(this.state.isTimeStarted === false && this.state.isGameStarted === true)  // start the time only once 
        // {
        //     this.setState({isTimeStarted: true});
        // }
        return (
            
            <div>

            {this.state.shouldGameStart ? ( <div><br></br>
            <br></br>
            <div>turn: {isMyTurn ? 'Yours!' : this.state.activePlayer}</div>
            <div>{this.state.isGameOver ? (<h3>{this.state.finishMessage}</h3>) : null}</div>
            <div>{this.state.isGameOver && !this.props.watchOnly ? (<h1>{this.state.youWon ? 'you won' : 'you lost!'}</h1>) : (<h1>{this.state.youWon ? "You Won! but the other can still play." : null}</h1>)}</div>
            <h2>{formatSeconds(this.state.secondsElapsed)}</h2>
             {/* <div>{this.state.isGameOver ? (null) :<button className="btnStyle" onClick={this.handleStartClick}>start</button>}</div> */}
             <div style={{textDecoration: "underline"}}>Players:</div>
             <div>
                {this.state.playersInfo.map((playerInfo, index) => {
                    let style = {
                        fontWeight: this.state.activePlayer === index ? "bold" : "normal", 
                        color: playerInfo.won ? "red" : "black", 
                    } // style
                    let playerNameText = playerInfo.won ? playerInfo.name + " (won)" : playerInfo.name;
                    return <div style={style}>{playerNameText}</div>
                })}
            </div>

             <div>{this.state.isGameOver ? (null) : <button disabled={!isMyTurn} className="btnStyle" onClick={this.takeTileFromPot}>Pot</button>}</div>
             <br></br>
             <br></br>
            <h1 style={{top:"-14px", position:"fixed", left:"400px"}}>welcome to game {this.props.gameId.split(',')[1]}</h1>

              
                  {this.props.watchOnly ? null : <Statistics 
                    myName = {this.state.playerName}
                    allPlayersPot = {this.state.allPlayersPot}
                    totalTurns = {this.state.stats.totalTurns}
                    totalPot = {this.state.stats.totalPot}
                    avgTimePerTurn={this.state.stats.avgTimePerTurn}
                    score = {this.state.stats.score} 
                />}

                <div className="chat-base-container">
                    <ChatContainer 
                         gameId={this.props.gameId}
                    />
                </div>


                <Board 
                    selectedTile={this.state.selectedTile}
                    tileWasPlaced={this.tileWasPlaced}
                    logicBoard={this.state.logicBoard}
                    isMoveValid={this.isMoveValid}       
                    isGameOver={this.state.isGameOver}
                    win={this.state.win}
                    gameId={this.props.gameId}
                />
                {/* } */}
                
                
                {this.props.watchOnly ? null : <Player 
                    tiles={this.state.playerTiles}
                    tileSelected={this.tileSelected}
                    handleSelected={this.handleSelected}
                    selectedTile={this.state.selectedTile}
                    isGameOver={this.state.isGameOver}             
                    isMyTurn={isMyTurn}
                />}
                </div>) : 
                ( 
                    <div>
                        <div title="flipping TAKI card" className="flipping-card-wrapper">
                            {/* <img className="front-card" src={Back}/>
                            <img className="back-card" src={Front} /> */}
                        </div>
                        <button onClick={this.handleGoToLobby}>go to lobby</button>
                          <div className="container-2">
                                <div className="btn btn-two">
                                 <span>Waiting for players! {this.state.howManyPlayersAreReady/* 1/3 */}  </span>
                                 </div>
                        </div>
                    </div>
                )}

                        <div>{this.state.isGameOver ? 
                        <div>
                            <Statistics 
                            myName = {this.state.playersInfo[0].name}
                            allPlayersPot = {this.state.allPlayersPot}
                            totalTurns = {this.state.playersInfo[0].stats.totalTurns}
                            totalPot = {this.state.playersInfo[0].stats.totalPot}
                            avgTimePerTurn={this.state.playersInfo[0].stats.avgTimePerTurn}
                            score = {this.state.playersInfo[0].stats.score} 
                            />

                            <Statistics 
                            myName = {this.state.playersInfo[1].name}
                            allPlayersPot = {this.state.allPlayersPot}
                            totalTurns = {this.state.playersInfo[1].stats.totalTurns}
                            totalPot = {this.state.playersInfo[1].stats.totalPot}
                            avgTimePerTurn={this.state.playersInfo[1].stats.avgTimePerTurn}
                            score = {this.state.playersInfo[1].stats.score} 
                            />
                                {isThreePlayers ? 
                                <Statistics 
                                myName = {this.state.playersInfo[2].name}
                                allPlayersPot = {this.state.allPlayersPot}
                                totalTurns = {this.state.playersInfo[2].stats.totalTurns}
                                totalPot = {this.state.playersInfo[2].stats.totalPot}
                                avgTimePerTurn={this.state.playersInfo[2].stats.avgTimePerTurn}
                                score = {this.state.playersInfo[2].stats.score} 
                                />
                                : null}
                        </div>
                         : null}</div>
               </div>

        )
} // render
} // Game

  
export default GameRoom


