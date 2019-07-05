const express = require('express');
const auth = require('./auth');

const lobbyManagement = express.Router(); // router is like a 'mini-app'... 




lobbyManagement.get('/state', (req, res) => {


    res.send({
        sessionId: req.session.id,
        userDetails: auth.getUserInfo(req.session.id),
        allUsers: auth.userList,
        allGames: ["Shay'sGame", "elad'sGame"],
    }) // res.send
}) // get '/state'



module.exports = lobbyManagement
