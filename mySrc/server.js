const path = require('path');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const chatsRouter = require('./server/chats') // it is an express.Router() instance
const auth = require('./server/auth') // auth is only an OBJECT! that has some useful methods

const app = express();
app.use(session({ secret: 'whatever...', cookie: {maxAge:/*some big Number*/269999999999}}));
app.use(bodyParser.text());
app.use(express.static(path.resolve(__dirname, '..', 'public')));




app.use('/chats', chatsRouter)
app.use('/signIn', auth.signIn)

// Equivilnt to: app.use(express.static("../public"));

// app.get('/',auth.userAuthentication, (req, res, next) => {
// 	console.log('root', req.session.id);
// 	next();
// })



app.listen(3000, console.log('Example app listening on port 3000!'));