import React, {Component} from 'react'
import Tile from './Tile.js';


class Board extends Component {
    constructor(props) {
        super(props);
        this.wrapperRef = React.createRef();
       // this.boardSize = 10; // it's not part of the state! it's a property...

        this.state = {
            jsx:null,
            //logicBoard:this.buildBoard(),
           // boardSize:26,
            oldLogicBoard:[
                        ['66,2', ' ','56'],
                        [' ', '66',' '],
                        [' ', ' ',' ']
            ]
        }


        this.manageBoard = this.manageBoard.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleMouseEnter = this.handleMouseEnter.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
        this.eventsParent = this.eventsParent.bind(this);
    }

    eventsParent(event) {
        if(this.props.isGameOver)
            return;
        switch(event.type) {
            case 'mouseenter':
                this.handleMouseEnter(event);
                break;
            case 'mouseleave':
                this.handleMouseLeave(event);
                break;
            case 'click':
                this.handleClick(event);
                break;
        } // switch
    } // eventParent

    handleMouseLeave(event) {
        event.target.closest('td').style.backgroundColor="transparent";
    } // handleMouseLeave

    handleMouseEnter(event) {
        console.log(`in board handleomuserenter`)
        const target = event.target.closest('td');
        
        const id = target.id.split(',');
        const i = id[0];
        const j = id[1];

        // only if there is not already tile in this <td>, and if there's a selected tile
        if(this.props.selectedTile !== null && this.props.logicBoard[i][j] === ' ') {
            const values = this.props.selectedTile;
            
            // only if the selecctedId is not empty string
            if(values) {
                if(this.props.isMoveValid(i, j)) {
                    target.style.backgroundColor="blue";
                } else {
                    target.style.backgroundColor="red";

                    // ...
                }
            } // if value
        } // if the board is empty in this cell, and there is a cell you wanna add!
    } // handleHover

    handleClick(event) {
        const target = event.target.closest('td');
        
        const id = target.id.split(',');
        const i = id[0];
        const j = id[1];

        // only if there is not already tile in this <td>, and if there's a selected tile
        if(this.props.selectedTile != null && this.props.logicBoard[i][j] === ' ') {
            const values = this.props.selectedTile;
            
            // only if the selecctedId is not empty string
            if(values) {
                if(this.props.isMoveValid(i, j)) {

                    // 1. notyfing the sever that we made a move (we already checked that it is legal)
                    fetch(`/game/move?i=${i}&j=${j}&selectedTile=${this.props.selectedTile}&verticality=${document.getElementById(this.props.selectedTile).parentNode.id[11]}`,
                    {method:'POST', credentials: 'include'})

                    // 2.
                    this.props.tileWasPlaced(this.props.selectedTile);

                    target.style.backgroundColor = 'transparent';
                } else {
                    alert('NOT A LEGAL MOVE');
                }
            } // if value
        } // if the board is empty in this cell, and there is a cell you wanna add!
    } // handleClick


    // buildBoard() {
    //     const boardSize = this.boardSize;

    //     let board = [];
    //     let row = [];
    //     for(let i = 0; i < boardSize; i++) {
    //         for(let j = 0; j < boardSize; j++) {
    //             //row.push(`${i}${j}`);
    //             row.push(` `);
    //         }
    //         board.push(row);
    //         row = [];
    //     }

    //     return board;
    // }

    manageBoard() { // tahles: build the jsx array
        const boardSize = this.props.logicBoard.length;

        let innerJSX = [];
        let jsx = [
            <div className='table-wrapper' ref={this.wrapperRef} key={'wrapper'}>
                <table key={`table`} className="game-table">
                   <tbody key={`tbody`}>
                       {innerJSX}
                    </tbody>
                </table>
           </div>
            ];

            

        for(let i = 0; i < boardSize; i++) {
            let tds=[];
            innerJSX.push(<tr key={`${i}`}>{tds}</tr>);
            for(let j = 0; j < boardSize; j++) {
                tds.push(
                    <td key={`${i},${j}`} id={`${i},${j}`} align="center" onClick={this.eventsParent} onMouseEnter={this.eventsParent} onMouseLeave={this.eventsParent}>
                        {this.props.logicBoard[i][j] === ' ' ?  /*`${i},${j}`*/ null : 
                        <Tile
                            key={`${i}${j}`}
                            top={this.props.logicBoard[i][j][0]}
                            bottom={this.props.logicBoard[i][j][1]}
                            verticality={this.props.logicBoard[i][j][3]}
                            isGameOver={this.props.isGameOver}
                            win={this.props.win}       
                        />
                        }
                    </td>);
            }
        }

        // this.setState({
        //     jsx
        // })

        return jsx;


    }

    componentDidMount() {
        this.wrapperRef.current.scrollTop = 2152; // middle of screen
        this.wrapperRef.current.scrollLeft =  2143; // middle of screen
    }

    render() {
        const jsx = this.manageBoard();

        return (
            <React.Fragment>
                {/*that's should create a "logic" array that should be mapped here & build JSX here */}
                {jsx} 
            </React.Fragment>
        );
    } // render 
} // component


export default Board