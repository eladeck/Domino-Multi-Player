

let names = {};

function getName(id) {
    console.log(`the names is ${names} and they wanted to get ${id}`)
    return names[id]; 
}

let signIn = (req, res) => {
    console.log(`server got a new signIn name: ${req.body}, from ${req.session.id}`)
    if(names[req.session.id] !== undefined) {
        console.log(`${req.body} you were signed in`)
        res.sendStatus(401);
    } else {
        names[req.session.id] = req.body;
        console.log(`${req.body} has succusfully entered`)
        res.sendStatus(200);
    }
} // signIn functnio

module.exports = {signIn, getName}