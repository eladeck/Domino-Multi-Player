const express = require('express');
const bodyParser = require('body-parser');
const auth = require('./auth');

const chatContent = []; // [ {user: {name: %theName%}, text: %theMsgString% }, { ... } ]

const chatManagement = express.Router();

chatManagement.use(bodyParser.text());

chatManagement.route('/') // it's already have the '/chat' prefix
	.get(auth.userAuthentication, (req, res) => {		
		// console.log(`${new Date().toLocaleTimeString()}: server got a request for the chat content`);
		res.json(chatContent); // equals to res.send(chatConetnt) it also sends the the JSON of chatContent
	})
	.post(auth.userAuthentication, (req, res) => {		
		const body = req.body; // the msg text itself
        const userInfo =  auth.getUserInfo(req.session.id); // userInfo is an object (for now has only `name` property)
        chatContent.push({user: userInfo, text: body});
        res.sendStatus(200); // telling client we succusfully got their post request.
	});

chatManagement.appendUserLogoutMessage = function(userInfo) {
	chatContent.push({user: userInfo, text: `user had logout`}); 
} // 


module.exports = chatManagement; // we expost out the chatManagement ROUTER. it's a router instance