import React from 'react';
import ReactDOM from 'react-dom';

export default class ChatInput extends React.Component {
    constructor(args) {
        super(...args);        

        this.state = {
            sendInProgress:false
        };

        this.sendText = this.sendText.bind(this);
    }

    render() {               
        return(
            <form className="chat-input-wrapper" onSubmit={this.sendText}>
                <input disabled={this.state.sendInProgress || this.props.watchOnly} placeholder={this.props.watchOnly ? "watchers can't chat :(" : "enter text here"} ref={input => this.inputElement = input} />
                <input type="submit" className="btn" disabled={this.state.sendInProgress || this.props.watchOnly} value="Send" />
            </form>
        )
    }   

    sendText(e) {
        e.preventDefault();
        this.setState(()=>({sendInProgress: true}));
        const text = this.inputElement.value;
        this.inputElement.value = '';   
        fetch(`/chat?gameId=${this.props.gameId}`, {
            method: 'POST',
            body: text,
            credentials: 'include'
        })
        .then(response => {            
            if (!response.ok) {                
                throw response;
            }
            this.setState(()=>({sendInProgress: false}));
            this.inputElement.focus();
        });
        return false;
    }
}