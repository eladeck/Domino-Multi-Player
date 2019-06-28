import React, {Component} from 'react'
import Board from './Board.js';
import Player from './Player.js';
import Statistics from './Statistics.js'
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
        this.isLastTileWasFlaced = false;
        const shuffledTiles = this.shuffleTiles();
        const firstSix = shuffledTiles.slice(0, 6);
        this.boardSize = 58; // some extra room so we don't get to the edges!
        const tiles = this.createTiles();
        const potTiles = shuffledTiles.slice(6, 28);
        const playerTiles = shuffledTiles.slice(0, 6);
        const logicBoard = []
        const score = this.getScoreFromTiles(firstSix);

        this.state = {
            tiles, // ["00","01", ... ] 
            shuffledTiles,
            potTiles,
            playerTiles,
            selectedTile:null, // an ID!!!!!!!!! NOT a ref to DOM element!!
            logicBoard,

            //stats
            incrementer: null,
            secondsElapsed: 0,
            totalTurns: 0,
            totalPot: 0,
            avgTimePerTurn: 0,
            score,
            prevTurn: null,
            currentStateIndex: 0,
            isGameStated: false,
            isGameOver: false,
            win: false,
            isLastTile: false,
            isTimeStarted: false,
        }
        
        this.createTiles = this.createTiles.bind(this);
        this.shuffleTiles = this.shuffleTiles.bind(this);
        this.handleSelected = this.handleSelected.bind(this);
        this.tileWasPlaced = this.tileWasPlaced.bind(this);
        this.takeTileFromPot = this.takeTileFromPot.bind(this);
        this.updateLogicBoard = this.updateLogicBoard.bind(this);
        this.isMoveValid = this.isMoveValid.bind(this);
        this.handelUndoClcik = this.handelUndoClcik.bind(this);
        this.hasNoMoreLegalMoves = this.hasNoMoreLegalMoves.bind(this);
        
        this.handleStartClick = this.handleStartClick.bind(this);
        this.getScoreFromTiles = this.getScoreFromTiles.bind(this);
        this.deepClone = this.deepClone.bind(this);


        this.handelPrevClick = this.handelPrevClick.bind(this);
        this.handelNextClick = this.handelNextClick.bind(this);
        this.handleOpenMenuSatrtClick = this.handleOpenMenuSatrtClick.bind(this);
        this.finishGame = this.finishGame.bind(this);

        this.getBoard = this.getBoard.bind(this);


        
    }

    getBoard() {
        fetch('/game/board', {method:'GET', credentials: 'include'})
        .then(response => {return response.json()})
        .then(logicBoard => this.setState({logicBoard}))

        this.timeoutId = setTimeout(this.getBoard, 200);
    }

    componentDidMount() {
        this.getBoard();
    } // componenetDidMount

    componentWillUnmount() {
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

    updateLogicBoard(logicBoard) {
        this.setState({
            logicBoard
        })
    }

    handelUndoClcik(){
        this.handelPrevClick();
        this.statesArray.pop();
    }

    handleOpenMenuSatrtClick()
    {
        this.setState({isGameStated : true});
    }

    // deepClone(x){
        
    //         if (!item) { return item; } // null, undefined values check
        
    //         var types = [ Number, String, Boolean ], 
    //             result;
        
    //         // normalizing primitives if someone did new String('aaa'), or new Number('444');
    //         types.forEach(function(type) {
    //             if (item instanceof type) {
    //                 result = type( item );
    //             }
    //         });
        
    //         if (typeof result == "undefined") {
    //             if (Object.prototype.toString.call( item ) === "[object Array]") {
    //                 result = [];
    //                 item.forEach(function(child, index, array) { 
    //                     result[index] = clone( child );
    //                 });
    //             } else if (typeof item == "object") {
    //                 // testing that this is DOM
    //                 if (item.nodeType && typeof item.cloneNode == "function") {
    //                     result = item.cloneNode( true );    
    //                 } else if (!item.prototype) { // check that this is a literal
    //                     if (item instanceof Date) {
    //                         result = new Date(item);
    //                     } else {
    //                         // it is an object literal
    //                         result = {};
    //                         for (var i in item) {
    //                             result[i] = clone( item[i] );
    //                         }
    //                     }
    //                 } else {
    //                     // depending what you would like here,
    //                     // just keep the reference, or create new object
    //                     if (false && item.constructor) {
    //                         // would not advice to do that, reason? Read below
    //                         result = new item.constructor();
    //                     } else {
    //                         result = item;
    //                     }
    //                 }
    //             } else {
    //                 result = item;
    //             }
    //         }
        
    //         return result;
        
    // } // deep clone

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
        console.log(`in json stringy deep clone, stateObj is`)
        console.log(stateObj);
        const stateStr = JSON.stringify(stateObj)
        console.log(stateStr);

        return JSON.parse(stateStr);
    }

    getScoreFromTiles(playerTiles){
     
        let res = 0;
        for(let i = 0 ; i < playerTiles.length; i++)
            res += parseInt((playerTiles[i])[0]) + parseInt((playerTiles[i])[1]);

        return res;
    }

    handleStartClick() {
        this.incrementer = setInterval(() => {
          this.setState({
            secondsElapsed: (this.state.secondsElapsed + 1)
          });
        }, 1000);
        this.setState({incrementer: this.incrementer});
      }

    handleSelected(selectedTile) {
        // setState => selectedTile gets updated => Game gets rendered => Player props.selectedTile is having className='selected'
        this.setState({
            selectedTile
        })
    } // handleSelected

    takeTileFromPot() {
        const curPotTiles = this.state.potTiles;
        
        if(this.state.potTiles.length === 0) {
            alert("Pot is empty")
        } else {
            this.setState(prevState => {
                const oldPotTiles = prevState.potTiles;
                const oldPlayerTiles = prevState.playerTiles;
                this.statesArray.push(this.deepClone(this.state));
                oldPlayerTiles.push(oldPotTiles.splice(oldPotTiles.length -1, 1)[0]);
                return {
                    potTiles: oldPotTiles,
                    playerTiles : oldPlayerTiles,
                    totalTurns: prevState.totalTurns + 1,
                    totalPot: prevState.totalPot + 1,
                    avgTimePerTurn: (prevState.secondsElapsed / (prevState.totalTurns + 1)).toFixed(2),
                    score : this.getScoreFromTiles(this.state.playerTiles),
                    currentStateIndex: prevState.currentStateIndex  + 1,
                  //  prevTurn : turns1
                }
            }) 
    } // else

            
            if(curPotTiles.length <= 1) {
                    window.setTimeout(() => {
                    if(!this.state.isGameOver && this.hasNoMoreLegalMoves()) {
                        alert('player loses!')
                        this.setState({
                            isGameOver:true
                        })
                    } // if
            } , 1000); 
        } // if


        // if(curPotTiles.length === 1) {
        //     // now it's gonna be empty: need to check if has more valid moves (otherwise loses)
        //     if(this.hasNoMoreLegalMoves()) {
        //         alert('player loses!');
        //         this.setState({
        //             isGameOver:true
        //         })
        //     }
        // } // if
    } // takeFromPot

    componentDidUpdate(prevProps, prevState) {

    }

    shuffleTiles() {
        let organized = this.createTiles();
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

    tileWasPlaced(tile) {
        this.statesArray.push(this.deepClone(this.state));
        // 1. remove this Tile from "player tyles" (once you setThis state, the props to the Player will changed)
        this.setState(prevState => {
            const playerTiles = prevState.playerTiles;
            playerTiles.splice(playerTiles.indexOf(tile), 1);
            return {
                selectedTile:null,
                playerTiles,
                totalTurns: prevState.totalTurns + 1,
                avgTimePerTurn: (prevState.secondsElapsed / (prevState.totalTurns + 1)).toFixed(2),
                score : this.getScoreFromTiles(this.state.playerTiles),
                currentStateIndex: prevState.currentStateIndex  + 1,
             //   prevTurn : turns1
                
            }
        });

    
                if(this.state.potTiles.length === 0) {
                    window.setTimeout(() => {
                    if(!this.state.isGameOver && this.hasNoMoreLegalMoves()) {
                        alert('player loses!')
                        this.setState({
                            isGameOver:true
                        })
                    } // if
            } , 1000); 
        } // if
        
        if(this.state.playerTiles.length - 1 === parseInt('0'))
        {
            this.setState({
                isGameOver: true,
                win:true,
                isLastTile: true
            })
            for(let i = 0; i < this.statesArray.length; i++)
            {
                this.statesArray[i].isGameOver = true;
                this.statesArray[i].win = true;
            }
        }
    } // tileWasPlaced

    createTiles() {
        let res = [];
        for(let i = 0; i <= 6; i++) 
            for(let j = 0; j <= 6; j++) 
                if(j >= i) 
                    res.push(`${i}${j}`);
                
        return res;
    }

    finishGame()
    {
    //     clearInterval(this.state.incrementer);
        const r = window.confirm("Do you want to play a new game? sure?");
         if(r == true)
          {
            this.isLastTileWasFlaced = false;
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
        
                    //stats
                    secondsElapsed: 0,
                    totalTurns: 0,
                    totalPot: 0,
                    avgTimePerTurn: 0,
                    score: this.getScoreFromTiles(this.firstSix),
                    prevTurn: null,
                    currentStateIndex: 0,
                    isGameStated: true,
                    isGameOver: false,
                    win: false,
                    isLastTile: false,
                    isTimeStarted: false,
                   }
               )
          }
    }
    
    render() {
        
        window.state = this.state;
        if(this.state.isLastTile && this.isLastTileWasFlaced === false)  // push the last move to the array 
        {
            this.isLastTileWasFlaced = true;
            this.setState({isLastTile: false})
            this.statesArray.push(this.deepClone(this.state));
            clearInterval(this.state.incrementer);

        }
        if(this.state.isTimeStarted === false && this.state.isGameStated === true)  // start the time only once 
        {
            this.handleStartClick();
            this.setState({isTimeStarted: true});
        }
            
        
        window.playerTiles = this.state.playerTiles;
        
        return (
            
            <div>

            <button onClick={() => this.props.switchScreen('lobby')}>
                     go to lobby!
            </button>
            
            {this.state.isGameStated ? ( <div><br></br>
            <br></br>
            <div>{this.state.isGameOver ? (<h1>{this.state.win ? 'you won' : 'no moves-lost!'}</h1>) : null}</div>
             <h2>{formatSeconds(this.state.secondsElapsed)}</h2>
             {/* <div>{this.state.isGameOver ? (null) :<button className="btnStyle" onClick={this.handleStartClick}>start</button>}</div> */}
             <div>{this.state.isGameOver ? (null) : <button className="btnStyle" onClick={this.takeTileFromPot}>Pot</button>}</div>
             <br></br>
             <div>{this.state.isGameOver ? (<button className="btnStyle" onClick={this.handelPrevClick}>back!</button>) : (null)}</div>
             <div>{this.state.isGameOver ? (<button className="btnStyle" onClick={this.handelNextClick}>next!</button>) : (null)}</div>
             <div>{this.state.isGameOver ? (<button className="btnStyle" onClick={this.finishGame}>New Game!</button>) : (null)}</div>
             <br></br>
            <div>{this.state.isGameOver ? (null) : <button className="btnStyle" onClick={this.handelUndoClcik}>undo!</button>}</div>


                <Statistics 
                    totalTurns = {this.state.totalTurns}
                    totalPot = {this.state.totalPot}
                    avgTimePerTurn={this.state.avgTimePerTurn}
                    score = {this.state.score}
                    />
                    
                <Board 
                    selectedTile={this.state.selectedTile}
                    tileWasPlaced={this.tileWasPlaced}
                    updateLogicBoard={this.updateLogicBoard}
                    logicBoard={this.state.logicBoard}
                    isMoveValid={this.isMoveValid}       
                    isGameOver={this.state.isGameOver}
                    win={this.state.win}       

                />
                <Player 
                    tiles={this.state.playerTiles}
                    tileSelected={this.tileSelected}
                    handleSelected={this.handleSelected}
                    selectedTile={this.state.selectedTile}
                    isGameOver={this.state.isGameOver}             
                /></div>) : 
                ( 
                    <div>
                        <div title="flipping TAKI card" className="flipping-card-wrapper">
                            {/* <img className="front-card" src={Back}/>
                            <img className="back-card" src={Front} /> */}
                        </div> 
                          <div className="container-2" onClick={this.handleOpenMenuSatrtClick}>
                                <div className="btn btn-two">
                                 <span>Open Game</span>
                                 </div>
                        </div>
                    </div>
                )}
               </div>

        )
} // render
} // Game


  

export default GameRoom


