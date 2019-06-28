const express = require('express');
const auth = require('./auth');

const gameManagement = express.Router(); // router is like a 'mini-app'... 

/******************************* business logic of the game ******************************************************/
const boardSize = 58;

let State = function() {
    this.boardSize = boardSize;
    this.board = buildBoard();
    // ...
} // State c'tor


const state = new State(); // the main instance of the state (of the gameState)


function buildBoard() {
    let board = [];
    let row = [];
    for(let i = 0; i < boardSize; i++) {
        for(let j = 0; j < boardSize; j++) {
            row.push(` `);
        }
        board.push(row);
        row = [];
    }

    return board;
} // buildBoard



/**************************** request handling ***************************************************/
gameManagement.get('/board', auth.userAuthentication, (req, res) => {
	res.send(state.board); 
});








module.exports = gameManagement