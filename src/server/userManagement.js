const express = require('express');
const auth = require('./auth');
const chatManagement = require('./chat');

const userManagement = express.Router(); // router is like a 'mini-app'... 

userManagement.get('/', auth.userAuthentication, (req, res) => { // path is actually '/users' and 
	const userName = auth.getUserInfo(req.session.id).name;
	res.json({name:userName}); // return the name of this req.sessionId user, only if he is already signed-in
});

userManagement.get('/allUsers', auth.userAuthentication, (req, res) => { // this is nothing right now
	res.json(userList);
});

userManagement.post('/addUser', auth.addUserToAuthList, (req, res) => {		
	res.sendStatus(200);	
});

userManagement.get('/logout', [
	(req, res, next) => {	
		const userinfo = auth.getUserInfo(req.session.id);	
		next();
	}, 
	auth.removeUserFromAuthList, 
	(req, res) => {
		res.sendStatus(200);		
	}]
);


module.exports = userManagement; // exposing the Router