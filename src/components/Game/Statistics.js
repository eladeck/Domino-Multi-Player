import React, {Component} from 'react'



class Statistics extends Component {
    constructor(props) {
        super(props);
        this.state = {
           
        }
    }



    render() {
        return (
            <div className="box">
                <h3>Name: {this.props.myName}</h3>
                <h3>total turns: {this.props.totalTurns}</h3>
                <h3>total Pot: {this.props.totalPot}</h3>
                <h3>average time: {this.props.avgTimePerTurn}</h3>
                <h3>score: {this.props.score}</h3>
                <h3>All players pot: {this.props.allPlayersPot}</h3>


            </div>
            
        );
    } // render 
} // component


export default Statistics