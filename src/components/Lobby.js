import React, {Component} from 'react'


class Lobby extends Component {
    constructor(props) {
        super(props)

        this.state = {
            userDetails:{}, // {name: 'elad', gameOwner:true}
            sessionId:null, // eskjfdlk90384@323SD
            allGames:{},
            allUsers:{},
        } // state

        this.getState = this.getState.bind(this)
        this.renderGames = this.renderGames.bind(this)
        this.renderUsers = this.renderUsers.bind(this)
        this.isEmpty = this.isEmpty.bind(this)
        this.handleDeleteClick = this.handleDeleteClick.bind(this)
        this.handleWatchGame = this.handleWatchGame.bind(this);
        this.howManyPropsInOnj = this.howManyPropsInOnj.bind(this);

        this.userListDoesntContainMe = this.userListDoesntContainMe.bind(this)
    } // c'tor

    howManyPropsInOnj(obj) {
        let count = 0;
        for(var key in obj) {
            count++;
        }
        return count;
    } // howManyPropsInOnj



    //some methods
    componentDidMount() {
        this.getState();
    }

    componentWillUnmount() {
        clearTimeout(this.timeoutId);
    }

    isEmpty(obj) {
        for(var key in obj) {
            if(obj.hasOwnProperty(key))
                return false;
        }
        return true;
    } // isEmpty

    handleWatchGame(gameId) {

        this.props.switchScreen('game', gameId, /*watchOnly*/true);

    } // handleWatchGame
        
    handleDeleteClick(numOfPlayers, gameId)
    {
       
        if(Number(numOfPlayers[0]) === 0)
        {
            //delete game by game name 
            fetch(`/game/deleteGame?gameId=${gameId}`, {method:'POST', credentials:'include'});
        }
        else 
             alert(`you can not remove this game because there are already ${numOfPlayers}players in the game `);

    }

    renderUsers() {
        if(this.isEmpty(this.state.allUsers)) return;

        let allUsers = [];

        window.allUsers = this.state.allUsers;

        for (var sessionId in this.state.allUsers) { // traversing the properties (sessionid are the keys!!)
            const name = this.state.allUsers[sessionId]; // 'name' is the value of the key 'sessionid'
            allUsers.push({sessionId, name})
        } // foreach user in userList

        return (
            <React.Fragment>
                <h2>allUsers:</h2>
                {allUsers.map(user =>
                    <ul>
                        <li>
                            {user.sessionId}: {user.name}
                        </li>
                    </ul>
                )}
            </React.Fragment>
        )   
    } // renderUsers

    renderGames() {
        let allGames = [];

        for (var gameId in this.state.allGames) { // traversing the properties (sessionid are the keys!!)
            const gameName = this.state.allGames[gameId].gameName; // 'name' is the value of the key 'sessionid'
            const numOfPlayers = this.state.allGames[gameId].numOfPlayers; // 'name' is the value of the key 'sessionid'
            const gameOwnerId = this.state.allGames[gameId].gameOwnerId; // 'name' is the value of the key 'sessionid'
            const howManyPlayersAreReady = this.state.allGames[gameId].howManyPlayersAreReady;
            const shouldGameStart = this.state.allGames[gameId].shouldGameStart;
            const allWatchers = this.state.allGames[gameId].allWatchers;
            let shouldHaveDeleteButton = false;
            if(this.state.sessionId === gameOwnerId)
                shouldHaveDeleteButton = true;

            allGames.push({gameId, gameName, numOfPlayers, gameOwnerId, howManyPlayersAreReady, shouldGameStart, shouldHaveDeleteButton, allWatchers});
        } // for

    //     this.howManyPlayersAreReady = '';
    // this.shouldGameStart = false; // maybe chagne name to: isGameOn?

        if(!allGames || allGames.length === 0) {
            return <h2>There are no current Games.</h2>
        }

        
        return (
            <React.Fragment>
                <h2>all Games:</h2>
                {allGames.map((game) => {
                    
                    let buttonClass = game.shouldGameStart ? "beating-button" : "";
                    let gameStartedText = game.shouldGameStart ? ` game already started!` : ` game hasn't started yet!`;
                    return (
                    <React.Fragment>

                        <button disabled={game.shouldGameStart} className={buttonClass} onClick={() => this.props.switchScreen('game', game.gameId)}>
                            go to game {game.gameName} by {this.state.allUsers[game.gameOwnerId]}! 
                            it requires {game.numOfPlayers} players. 
                             {game.howManyPlayersAreReady} players are in the game ({this.howManyPropsInOnj(game.allWatchers)} watchers!), {gameStartedText}
                        </button>
                        <button onClick={() => this.handleWatchGame(game.gameId)}>WATCH GAME (bonus!)</button>
                        {game.shouldHaveDeleteButton ? <button onClick={()=>this.handleDeleteClick(game.howManyPlayersAreReady, game.gameId)} >delete game</button> : null}
                        
                        <br></br>
                    </React.Fragment>
                )})}
            </React.Fragment>
        )
    } // renderGames

    render() {

        return(
            <React.Fragment>
                <h1>
                    in Lobby! name is {this.state.userDetails.name} and session ID is {this.state.sessionId}
                </h1>

                <button onClick={this.props.handleNewGame}>
                     create new game
                </button>

                {this.renderUsers()}
                {this.renderGames()}

                <button onClick={this.props.logoutHandler}>
                    logout
                </button>
            </React.Fragment>
        ); // return 
    } // render

    userListDoesntContainMe(userList, sessionId) {
        for(var sId in userList)
            if(sId === sessionId)
                return false;

        return true;
    } // userListDoesntContainMe

    getState() {
        fetch('/lobby/state', {method:'GET', credentials: 'include'})
        .then(response => {
          //  console.log(response);
             return response.json()})
        .then(state => {
            if(this.userListDoesntContainMe(state.allUsers, state.sessionId)) {
                this.props.switchScreen('login');
            } else {
                this.setState({
                sessionId: state.sessionId,
                userDetails: state.userDetails,
                allGames: state.allGames,
                allUsers: state.allUsers,
                })
            }
        });

        this.timeoutId = setTimeout(this.getState, 200);

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