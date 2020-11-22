const express = require('express') // express stores 'request' app as variable

const app = express();

const Movie = require('./Movie.js')

const login_data = require('data-store')({path: process.cwd() + '/data/users.json'})

const bodyParser = require('body-parser')
app.use(bodyParser.json())


// app.get('/movie', (req, res) => { //gets all user IDs     // Do we need this? What will backend retrieve for just url/movie
//     res.json(Movie.getAllIDs())
//     return
// })

app.post('/login', (req, res) => {

    let user = req.body.user;
    let password = req.body.password;

    let user_data = login_data.get(user);
    if(user_data == null) {
        res.status(404).send("Not found");
        return;
    }
    if (user_data.password == password) {
        console.log("User " + user + "logged in");
        res.json(true);
        return;
    }
    res.status(403).send("incorrect login");
}) 

app.get('/movies/:id', (req, res) => { // gets particular user by ID
    let u = Movie.findByID(req.params.id)
    if (u == null) { // send error status if no user exists by this ID
        res.status(404).send("Movie not found")
        return
    } 
    res.json(u) //if user exists, return user
})

app.post('/movies', (req, res) => {
    let {id, title, rating, poster} = req.body

    let u = Movie.create(id, title, rating, poster)

    if (u == null) { // not necessary for our project but still practical in other situations
        res.status(400).send("Bad Request")
        return
    }
    return res.json(u)
})




app.put('/movies/:id', (req, res) => {     //isnt being used
    let u = Movie.findByID(req.params.id) 
    if (u == null) {
        res.status(404).send("Movie not found")
        return
    }

    let {id, title, rating, poster} = req.body  //update movie info
    u.id = id;
    u.title = title;
    u.rating = rating
    u.poster = poster
    
    u.update()
    res.json(u)
})

app.delete('/movies/:id', (req, res) => {
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