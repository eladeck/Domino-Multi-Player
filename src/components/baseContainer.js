import React from 'react';
import LoginModal from './login-modal';
import ChatContaier from './chat/chatContainer';
import Lobby from './Lobby';
import GameRoom from './Game/GameRoom';

export default class BaseContainer extends React.Component {
    constructor(args) {
        super(...args);
        this.state = {
            screenToRender:'login',
            gameId:null,

            currentUser: {
                name: ''
            }
        };
        
        this.handleSuccessedLogin = this.handleSuccessedLogin.bind(this);
        this.handleLoginError = this.handleLoginError.bind(this);
        this.fetchUserInfo = this.fetchUserInfo.bind(this);
        this.logoutHandler= this.logoutHandler.bind(this);
        this.switchScreen = this.switchScreen.bind(this);
        this.handleNewGame = this.handleNewGame.bind(this);
        
        this.getUserName();
    } // class c'tor

    handleNewGame() { // im in the middle. should figure how to add req.body to the fetch, and then get the detials (gameName, numOfplayers) in the epxress, and use this data
        let game = {};
        game.gameName = prompt("enter game name");
        game.numOfPlayers = Number(prompt("2 or 3 players?"))

        console.log(`about to send this object to server:`)
        console.log(game);

        fetch('/game/createNewGame', {method:'POST', body:JSON.stringify(game), credentials:'include'})
        .then(res => res.json())
        .then(theRealRes => this.setState({gameId: theRealRes.gameId}));

        // this.switchScreen('game');

    } // handleNewGame

    render() {        
        if (this.state.screenToRender === 'login') {
            return (<LoginModal loginSuccessHandler={this.handleSuccessedLogin} loginErrorHandler={this.handleLoginError}/>)
        } else if(this.state.screenToRender === 'lobby') { // no need to show login
            console.log(`should go to lobby`)
            return <Lobby
                        switchScreen={this.switchScreen}
                        logoutHandler={this.logoutHandler}
                        handleNewGame={this.handleNewGame}
                    />; // must return jsx
        } else {
             // render 'game'
            return (
            <GameRoom
                switchScreen={this.switchScreen}
                gameId={this.state.gameId}
            />)


        } // else

        //for bonus: return this.renderChatRoom();
    } // render

    switchScreen(screenToRender, gameId) {
        this.setState({screenToRender, gameId})
    } // switchScreen


    handleSuccessedLogin() {
        this.switchScreen('lobby');
        this.getUserName();
    } // handleSuccessedLogin

    handleLoginError() {
        console.error('login failed');
        this.setState(()=>({screenToRender:'login'}));
    }


    renderChatRoom() {
        console.log(`about to fetch sID`)
        let sID;
        fetch('/sID',{method: 'GET', credentials: 'include'})
        .then(res => res.json())
        .then(res => {console.log(`this is what got back from server ${res}`); sID = res; })


        

        return(
            <div className="chat-base-container">
                <div className="user-info-area">
                    Hello {this.state.currentUser.name} 
                    <button className="logout btn" onClick={this.logoutHandler}>Logout</button>
                </div>
                <ChatContaier />                
            </div>
        )
    }

    getUserName() {
        this.fetchUserInfo()
        .then(userInfo => {
            this.setState(()=>({currentUser:userInfo, screenToRender: 'lobby'}));
        })
        .catch(err=>{            
            if (err.status === 401) { // incase we're getting 'unautorithed' as response
                this.setState(()=>({screenToRender: 'login'}));
            } else {
                throw err; // in case we're getting an error
            }
        });
    }

    fetchUserInfo() { // I have a session ID, now bring me my name? I guess. 25/6 response: yap.
        return fetch('/users',{method: 'GET', credentials: 'include'})
        .then(response => {            
            if (!response.ok){
                throw response;
            }
            return response.json();
        });
    }

    logoutHandler() {
        fetch('/users/logout', {method: 'GET', credentials: 'include'})
        .then(response => {
            if (!response.ok) {
                console.log(`failed to logout user ${this.state.currentUser.name} `, response);                
            }
            this.setState(()=>({currentUser: {name:''}, screenToRender: 'login'}));
        })
    } // logoutHandler
}