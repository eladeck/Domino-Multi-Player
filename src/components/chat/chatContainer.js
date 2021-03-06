import React from 'react';
import ConverssionArea from './converssionArea';
import ChatInput from './chatInput';

export default class chatContainer extends React.Component {
    constructor(props) {
        super(props);
    }     
    render() {
        return(
            <div className="chat-contaier">
                <ConverssionArea gameId={this.props.gameId} watchOnly={this.props.watchOnly}/>
                <ChatInput gameId={this.props.gameId} watchOnly={this.props.watchOnly}/>
            </div>
        )
    } // render         
} // class