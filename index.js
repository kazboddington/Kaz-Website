const express = require('express')
const path = require('path')
const port = process.env.PORT || 3000
const app = express()

// serve static assets normally
app.use(express.static(__dirname + '/public'))

// Handles all routes so you do not get a not found error
app.get('/', function (request, response){
    response.sendFile(path.resolve(__dirname, 'public', 'index.html'))
})

app.get('/goofspiel', function (request, response){
    response.sendFile(path.resolve(__dirname, 'public', 'goofspiel.html'))
})

var gameState = {
    zak:{
        cardsToPlay: [1,2,3,4,5,6,7,8,9,10,11,12,13],
        cardsWon: []
    },
    peter:{
        cardsToPlay:[1,2,3,4,5,6,7,8,9,10,11,12,13],
        cardsWon:[]
    },
    cardsToPlayFor:[1,2,3,4,5,6,7,8,9,10,11,12,13]
}

app.get('/goofspiel/state', function (request, response){
    response.send(JSON.stringify(gameState))
})

app.listen(port)
console.log("server started on port " + port)
