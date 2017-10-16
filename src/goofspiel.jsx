import React from 'react';
import { render } from 'react-dom';

console.clear();

function httpGetAsync(theUrl, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
                callback(xmlHttp.responseText);
        }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}

function httpPostAsync(theUrl, body, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
                callback(xmlHttp.responseText);
        }
    xmlHttp.open("POST", theUrl, true); // true for asynchronous 
    xmlHttp.setRequestHeader("Content-type", "application/json");
    xmlHttp.send(body);
}

class CardList extends React.Component{

    handleClick(card, e){
        console.log("called")
        this.props.postCardChoice(card)
    }
    render(){
        const listContainerStyle = {
            display:'flex', 
            flexWrap: 'wrap',
            justifyContent:'space-between'
        }

        const listItemStyle = {
            width: 'calc(100% * (1/4))',
            textAlign: 'center',
            border: '1px black solid',
            flex: '0 0 21%',
            marginBottom: '1%',
            cursor: 'pointer'
        }
        

        const cardList = this.props.cards.map((number) =>
            <div onClick={(e) => this.handleClick(number, e)} style={listItemStyle} key={number.toString()}>
            {number}
            </div>
        );
        return <div style={listContainerStyle}>{cardList}</div>
    }
    
}

class SidePanel extends React.Component{
    constructor(props){
        super(props)
    }
    render(){
        const cardList = this.props.currentCards.map((number) =>
            <h3 key={number.toString()}>
            {number}
            </h3>
        );
        var retVal = 
            <div className={`col-md-2 col-md-offset-2`}>
                <h4>
                    Cards being played for: <br/>
                </h4>
                {cardList}
            </div>
        return retVal
    }
}

class GoofBoard extends React.Component{
    
    constructor(props){
        super(props)
        this.state = {data: null}
        this.postCardChoice = this.postCardChoice.bind(this)
    }

    componentDidMount() {
        httpGetAsync('/goofspiel/state', function(data) {
            this.setState({data: JSON.parse(data)});
        }.bind(this));
    }
    
    postCardChoice(player, card){
        console.log(card)
        console.log(player)
        var postRequestBody = JSON.stringify({
            player: player,
            bid: card
        })
        httpPostAsync('/goofspiel/bid',
            postRequestBody,
            function(data) {
                console.log("Played")
                httpGetAsync('/goofspiel/state', function(data) {
                    this.setState({data: JSON.parse(data)});
                }.bind(this));
        }.bind(this));
    }

    render() {
        var retVal 
        if (this.state.data) {
            const zakWinnings = this.state.data.zak.cardsWon.map((number) =>
                <div key={number.toString()}>
                    {number}
                </div>
            );
            const peterWinnings = this.state.data.peter.cardsWon.map((number) =>
                <div key={number.toString()}>
                    {number}
                </div>
            );

            retVal =  
                <div>
                <h1 className={`col-md-10 col-md-offset-2`}>
                GoofSpiel!
                </h1>
                <SidePanel currentCards={this.state.data.currentCards}/> 

                <div className={`col-md-4`}>
                <h3>
                Zak
                </h3>
                Won Cards: <br/>
                {zakWinnings}
                Click a card to play
                <CardList 
                    postCardChoice={(card) => this.postCardChoice('zak', card)} 
                    cards={this.state.data.zak.cardsToPlay} 
                />

                <h3>
                Peter 
                </h3>
                Won Cards: <br/>
                {peterWinnings}
                Click a card to play
                <CardList 
                    postCardChoice={(card) => this.postCardChoice('peter', card)} 
                    cards={this.state.data.peter.cardsToPlay} 
                />

                <h5>{JSON.stringify(this.state.data)}</h5>
                
                </div>
                </div>;
        }else{
            retVal = <h1>Loading...</h1>;
        }
        
        return retVal
    }
}




render(<GoofBoard />, document.getElementById('container'));

console.log("Working!")


