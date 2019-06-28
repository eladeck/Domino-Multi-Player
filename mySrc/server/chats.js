
const express = require('express');
const bodyParser = require('body-parser');
const auth = require('./auth')

const chatsRouter = express.Router();
chatsRouter.use(bodyParser.text());

let messages = []


chatsRouter.route('/')
    .get((req, res) => {
    res.send(JSON.stringify(messages));
})
.post((req, res) => {
    console.log(`server got a message to save: ${req.body}, from ${req.session.id}`)
    messages.push({name:auth.getName(req.session.id), msg:req.body})
    res.sendStatus(200);
});

module.exports = chatsRouter