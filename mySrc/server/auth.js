

let names = {};

function getName(id) {
    return names[id]; 
}

let signIn = (req, res) => {
    if(names[req.session.id] !== undefined) {
        res.sendStatus(401);
    } else {
        names[req.session.id] = req.body;
        res.sendStatus(200);
    }
} // signIn functnio

module.exports = {signIn, getName}