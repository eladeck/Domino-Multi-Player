const userList = {}; // auth holds the users list, pairs of {sessioId, userName}

function userAuthentication(req, res, next) {		
	// console.log(`userList is`);
	// console.log(userList);

	if (userList[req.session.id] === undefined) { // means this sessionId is not in the system yet				
		res.sendStatus(401); // therefore we decline with 401 "user does not exist"		
	} else {
		next(); // this user exists in the system. let's move 'next' to the real mission.
	} // else
} // userAuthentication

function addUserToAuthList(req, res, next) { // --- new user wants to sign in ---
	if (userList[req.session.id] !== undefined) {
		res.status(403).send('user (this session) already exists'); // you (*your session*!) are already in the system. why would you wanna add yourself again? :)
	} else {		
		for (sessionid in userList) { // traversing the properties (sessionid are the keys!!)
			const name = userList[sessionid]; // 'name' is the value of the key 'sessionid'
			if (name === req.body) { // you wanted to add a name that already exists in the system
				res.status(403).send('user name already exists');
				return;
			} // if
		} // foreach user in userList
		userList[req.session.id] = req.body; // assigning the user under the key of it's seesionId
		next(); // calling the next logic to happen after adding the user
	} // else 
}

function removeUserFromAuthList(req, res, next) {	
	if (userList[req.session.id] === undefined) {
		res.status(403).send('user does not exist');
	} else {						
		delete userList[req.session.id]; // I think it's equal to: userList[req.session.id] = undefined;
		next();
	}
}

function getUserInfo(id) {	
    return {name: userList[id]}; // returning an object {name: _theUserName_}
}

module.exports = {userAuthentication, addUserToAuthList, removeUserFromAuthList, getUserInfo, userList}
