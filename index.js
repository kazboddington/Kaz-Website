const express = require('express')
const path = require('path')
const port = process.env.PORT || 8787
const app = express()
const bodyParser = require('body-parser')
var _ = require('lodash')
// serve static assets normally
app.use(express.static(__dirname + '/public'))

// Tell express to use the body-parser middleware and to not parse extended bodies
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());


// Handles all routes so you do not get a not found error
app.get('/', function (request, response){
    response.sendFile(path.resolve(__dirname, 'public', 'index.html'))
})

app.get('/goofspiel', function (request, response){
    response.sendFile(path.resolve(__dirname, 'public', 'goofspiel.html'))
})

const results = []

const newGameState = {
    zak:{
        cardsToPlay: [1,2,3,4,5,6,7,8,9,10,11,12,13],
        cardsWon: [],
        currentBid: null
    },
    peter:{
        cardsToPlay:[1,2,3,4,5,6,7,8,9,10,11,12,13],
        cardsWon:[],
        currentBid: null
    },
    currentCards: [],
    cardsToPlayFor:[1,2,3,4,5,6,7,8,9,10,11,12,13],
    gameId: 0

}

function getNewGame(){
    var newGame = _.cloneDeep(newGameState)
    var newCard = newGame.cardsToPlayFor[ 
        Math.floor( Math.random() * newGame.cardsToPlayFor.length)
    ]; 
    _.pull(newGame.cardsToPlayFor, newCard)
    newGame.currentCards.push(newCard)
    if (gameState != undefined){
        newGame.gameId += gameState.gameId + 1; 
    }
    return newGame
}

var gameState = getNewGame()

app.get('/goofspiel/state', function (request, response){
    console.log(request.query)

    if (request.query.gameId == undefined){
        // Did not request a specific game
        response.send(JSON.stringify(getCleanState(gameState)))
        return
    }

    console.log("A specfic game coming up ")
    // Requested a specific game
    if (!isNumeric(request.query.gameId)){
        response.send("Your requested game was not a number: " + request.query.gameId)
    }

    var id = parseInt(request.query.gameId)
    if (id < results.length){
        // requested valid game 
        response.send(getCleanState(results[id]))
    }else if (id == results.length){
        response.send(getCleanState(gameState))
    }else{
        response.send("You requested an invalid game: " + request.query.gameId)
    }
})

const requestFormat = 
    `
        The format of the request should be:
        data = 
        {
            "player": "NAME",
            "bid": CARD_NUMBER
        }
        Also remember to set the Content-Type to 'application/json'
        `
function getCleanState(state){
    var gameState = _.cloneDeep(state)
    var cleanState = {
        zak: {
            cardsToPlay: gameState.zak.cardsToPlay,
            cardsWon: gameState.zak.cardsWon,
            hasBid: null
        },
        peter:{
            cardsToPlay: gameState.peter.cardsToPlay,
            cardsWon: gameState.peter.cardsWon,
            hasBid: null
        },
        currentCards: gameState.currentCards,
        cardsToPlayFor: gameState.cardsToPlayFor,
        gameId: gameState.gameId,

    }

    // Set the has bid variable
    if (gameState.zak.currentBid == null){
        cleanState.zak.hasBid = false
    }else{
        cleanState.zak.hasBid = true
    }

    if (gameState.peter.currentBid == null){
        cleanState.peter.hasBid = false
    }else{
        cleanState.peter.hasBid = true
    }

    if (gameState.result != undefined && gameState.result.winner != undefined){
        cleanState.result = {winner: gameState.result.winner} 
    }
    return cleanState
}
function endGame(){
    console.log("Game ended")
    var totalZak = gameState.zak.cardsWon.reduce((tot, num) => tot + num, 0)
    var totalPeter = gameState.peter.cardsWon.reduce((tot, num) => tot + num, 0)
    var finalState = _.cloneDeep(gameState)
    if(totalZak > totalPeter){
        finalState.result = {winner: 'zak'}
        console.log("Zak wins")
    }else{
        finalState.result = {winner: 'peter'}
        console.log("Peter wins")        
    }
    results.push(finalState)
    gameState = getNewGame()
}

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

app.post('/goofspiel/bid', function(req, res){
    console.log("\n\n")

    const body = req.body
    console.log(body) 
    console.log("\n GameState before is ")
    console.log(gameState)

    var responseString = "Json we recognised from your response: \n";
    responseString += JSON.stringify(body) + "\n"
    // Check for various errors with the request
    var error = true
    if (typeof body == 'undefined'){
        responseString += "\nCould not recognise the bid as a javascript object"
        responseString += requestFormat;
    }else if(typeof body.player == 'undefined'){
        responseString += "\nThe player was undefined"
        responseString += requestFormat;
    }else if (typeof body.bid == 'undefined'){
        responseString += "\nThe bid was undefined"
        responseString += requestFormat;
    }else if(body.player !== 'zak' && body.player !== 'peter'){
        responseString += '\nDo not recognise the player: ' + body.player
    }else if(!isNumeric(body.bid)){
        responseString += '\nThe bid is not a number! (' + body.bid + ')'
    }else if(body.bid < 1 || body.bid > 13){
        responseString += "\nYou must bid a number between 1 and 13! (you sent " + body.bid + ")"
    }else{
        var error = false
    }
    if (error == true){
        res.set('Content-Type', 'text/plain')
        res.status(400)
        res.send(responseString)
        return
    }

    // Set up some nicer variables 
    var player
    var opponent
    var bid = body.bid

    if(body.player === 'zak'){
        player = gameState.zak         
        opponent = gameState.peter
    }else{
        player = gameState.peter 
        opponent = gameState.zak
    }

    // Check that the bid can be played 
    if (!_.includes(player.cardsToPlay, bid)){
        responseString += "The bid " + bid + " cannot be played"
        res.set('Content-Type', 'text/plain')
        res.status(400)
        res.send(responseString)
        return
    }

    // Data is validated

    // Now change the state
    player.currentBid = bid 

    if(isNumeric(opponent.currentBid)){
        console.log("Moving the game on")
        // Move the game on! 
        if (opponent.currentBid > player.currentBid){
            console.log("Opponent won the cards")
            opponent.cardsWon = opponent.cardsWon.concat(gameState.currentCards)
            gameState.currentCards = []
        }else if (opponent.currentBid < player.currentBid){
            console.log("Player won the cards")
            player.cardsWon = player.cardsWon.concat(gameState.currentCards)
            gameState.currentCards = []
        }else{
            // Draw, add new card to the cards to play for, or end the game
            // (all necesarry logic happens anyway!)
        }



        console.log("Completing move")
        _.pull(player.cardsToPlay, player.currentBid)
        _.pull(opponent.cardsToPlay, opponent.currentBid)
        player.currentBid = null
        opponent.currentBid = null
        var newCard = gameState.cardsToPlayFor[ 
            Math.floor( Math.random() * gameState.cardsToPlayFor.length)
        ]; 
        if (newCard != null) {
            gameState.currentCards.push(newCard)                
        }

        _.pull(gameState.cardsToPlayFor, newCard)

        if(player.cardsToPlay.length == 0){
            console.log("Ending game")
            endGame()
        }
    }else{
        console.log("Waiting for other player to bid")
    }



    var cleanState = getCleanState(gameState)
    responseString += "\n" + JSON.stringify(cleanState)

    res.set('Content-Type', 'text/plain')
    res.send(responseString)

    console.log("\n GameState after is ")
    console.log(gameState)

})

app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send('Something broke!')
})

app.listen(port)
console.log("server started on port " + port)
