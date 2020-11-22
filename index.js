const express = require('express') // express stores 'request' app as variable

const app = express();

const Movie = require('./Movie.js')

const login_data = require('data-store')({path: process.cwd() + '/data/users.json'})

const bodyParser = require('body-parser')
app.use(bodyParser.json())

const expressSession = require('express-session')

app.use(expressSession({
    name: "sessionCookie",
    secret: "express sesssion",
    resave: false,
    saveUninitialized: false
}))


app.get('/movies', (req, res) => { //gets all movies for a user
    if (req.session.user == undefined) {
        res.status(403).send("Unauthorized")
        return
    }
    res.json(Movie.getAllMoviesUser(req.session.user))
    return
})


app.post('/login', (req, res) => { // user logs in

    let user = req.body.user;
    let password = req.body.password;

    let user_data = login_data.get(user);
    if(user_data == null) {
        res.status(404).send("Not found");
        return;
    }
    if (user_data.password == password) {
        console.log("User " + user + "logged in");
        req.session.user = user;
        res.json(true);
        return;
    } 
    res.status(403).send("incorrect login");
}) 

app.get('/logout', (req, res) => { // user logs out
    delete req.session.user;
    res.json(true);
})

app.post('/register', (req,res) => { // registers a new user

    let user = req.body.user;
    let password = req.body.password;

    //checks if user exists
    let array = Object.keys(login_data.data)
    if (array.includes(user)) {
        res.status(404).send("User already exists")
        return
    }

    login_data.set(user.toString(),{"password": password})

    res.json(true);
});

// app.get('/movies/:id', (req, res) => { // gets particular user by ID
//     if (req.session.user == undefined) {
//         res.status(403).send("Unauthorized")
//         return
//     }
//     let u = Movie.findByID(req.params.id)
    
//     if (u == null) { // send error status if no user exists by this ID
//         res.status(404).send("Movie not found")
//         return
//     } 
//     res.json(u) //if user exists, return user
// })

app.post('/movies', (req, res) => { // adds movie to user logged in
    if (req.session.user == undefined) {
        res.status(403).send("Unauthorized")
        return
    }

    let u = Movie.create(req.body.id, req.session.user, req.body.title, req.body.liked, req.body.poster)

    if (u == null) { // not necessary for our project but still practical in other situations
        res.status(400).send("Bad Request")
        return
    }
    return res.json(u)
})




app.put('/movies/:id', (req, res) => { // updates liked status of a movie
    if (req.session.user == undefined) {
        res.status(403).send("Unauthorized")
        return
    }
    let u = Movie.findByID(req.params.id) 
    if (u == null) {
        res.status(404).send("Movie not found")
        return
    }
    if (u.user != req.session.user) {
        res.status(403).send("Unauthorized");
        return;
    }

    // let {liked} = req.body  //update movie info
    // u.liked = liked
    u.update(req.body.liked)
    res.json(u)
})

app.delete('/movies/:id', (req, res) => { // deletes movie off of user's list
    if (req.session.user == undefined) {
        res.status(403).send("Unauthorized")
        return
    }
    
    let u = Movie.findByID(req.params.id)
    if( u == null) {
        res.status(404).send("Movie not found")
        return
    }
    u.delete() 
    res.json(true)
})

const port = 3000 // change based on heroku later; 19:30 of kmp video
app.listen(port, () => {
    console.log("backend running on port " + port)
})
