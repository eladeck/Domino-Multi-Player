import React, {Component} from 'react'
import ReactDOM from 'react-dom'

class BaseContainer extends Component {
    constructor(props) {
        super(props);

        this.name = `elad tmprry`;
        this.key = -1;

        this.state = {
            chats:[]
        } // state

        this.signIn = this.signIn.bind(this);
        this.fetchChats = this.fetchChats.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
        this.getKey = this.getKey.bind(this);
    } // c'tor

    sendMessage(e) {
		e.preventDefault();
        fetch('/chats', {method:'POST', body: prompt('message?'), credentials:'include'})
    }

    signIn(e) {
		e.preventDefault();
        fetch('/signIn', {method:'POST', body: prompt(`name?`), credentials:'include'})
    }

    fetchChats() {
        fetch('/chats', {method: 'GET', credentials: 'include'})
        .then(res => res.json())
        .then(chats => this.setState({chats}))

        this.timeoutId = setTimeout(this.fetchChats, 200);
    }

    componentDidMount() {
        this.fetchChats();
    }

    componentWillUnmount() {clearTimeout(this.timeoutId)}

    getKey() {
        this.key++;
        return this.key;
    }

    render() {
        window.chats = this.state.chats;
        return (
            <div>
                <form onSubmit={this.signIn}>
                    <input type='textbox' placeholder='what is your name?'/>
                    <button>sign in</button>
                </form>
                <form onSubmit={this.sendMessage}>
                    <input type='textbox' placeholder='enter message'/>
                    <button>send</button>
                </form>


                {/* in ARROW FUNCTION where you open 
                a curly {

                }

                then you must RETURNNNNNNNNNNN RETURN RETURN RETURN !!!!!!!!!!
                */}

                <div>
                    {this.state.chats.map(msgObject => 
                        <div key={this.getKey()}>
                            <h2>{msgObject.name}: </h2> <h3>{msgObject.msg}</h3>
                            <hr />
                        </div>
                    )}
                </div>
            </div>
        );
    } // render
} // App class

export default BaseContainer;