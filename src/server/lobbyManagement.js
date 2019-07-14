const express = require('express');
const auth = require('./auth');
const gameManagement = require('./gameManagement');

const lobbyManagement = express.Router(); // router is like a 'mini-app'... 


let count = 0;

lobbyManagement.get('/state', (req, res) => {
    // console.log(req.session.id)
    // console.log(auth.getUserInfo(req.session.id))
    // console.log(`user list is:`);
    // console.log(auth.userList)
    // console.log(`all games are:`);
    // console.log(gameManagement.allGames)
    // console.log(gameManagement.allGames)
    if(count < 20) {
        console.log(gameManagement.allGames);
        console.log(gameManagement.allGames.playersTiles);
        console.log(gameManagement.allGames.playersInfo);
        count++;
    }

    res.send({
        sessionId: req.session.id,
        userDetails: auth.getUserInfo(req.session.id),
        allUsers: auth.userList,
        allGames: gameManagement.allGames,
    }) // res.send
}) // get '/state'



module.exports = lobbyManagement
