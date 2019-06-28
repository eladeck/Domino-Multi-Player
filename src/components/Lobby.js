import React, {Component} from 'react'


class Lobby extends Component {
    constructor(props) {
        super(props)

        this.state = {
            userDetails:{}, // {name: 'elad', gameOwner:true}
            sessionId:null, // eskjfdlk90384@323SD
        } // state

        this.getDetails = this.getDetails.bind(this)
    } // c'tor

    //some methods

    render() {
        return(
            <div>
                <div>
                    in Lobby! name is {this.state.userDetails.name} and session ID is {this.state.sessionId}
                </div>
                <button onClick={() => this.props.switchScreen('game')}>
                     go to game!
                </button>
                <button onClick={this.getDetails}>
                    get own details
                </button>
            </div>
        ); // return 
    } // render

    getDetails() {
        fetch('/getSessionIdAndName', {method:'GET', credentials: 'include'})
        .then(response => {console.log(response); return response.json()})
        .then(resObj => this.setState({
            sessionId:resObj.sessionId,
            userDetails:resObj.userDetails
        }))

    } // getDetails

} // class

// let sId, name=`hard coded`;
//         fetch('/getSessionIdAndName', {method:'GET', credentials: 'include'})
//         .then(response => {console.log(response); return response.json()})
//         .then(theRealObject => console.log(theRealObject))

//         return (
//             <div>
//                 <button onClick={() => this.setState({screenToRender:'game'})}>
//                     go to game!
//                 </button>

//                 hello this is lobby here! name is {name} and sID is {sId}
//             </div>
//         );


export default Lobby