const path = require('path');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const auth = require('./server/auth');
const userManagement = require('./server/userManagement'); 
const gameManagement = require('./server/gameManagement'); 
const lobbyManagement = require('./server/lobbyManagement'); 
const chatManagement = require('./server/chat');

const app = express();

app.use(session({ secret: 'whatever', cookie: {maxAge:269999999999}}));
app.use(bodyParser.text());

app.use(express.static(path.resolve(__dirname, "..", "public"))); // same as: app.use(express.static("../public"));




app.use('/users', userManagement);
app.use('/chat', chatManagement);
app.use('/game', gameManagement.gameManagement); // because gameManagement is an OBJECT! that the gameManagement property of it, is the ROUTER!
app.use('/lobby', lobbyManagement);

app.listen(3000, console.log('statred listening on port 3000!'));