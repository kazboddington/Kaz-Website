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

class GoofBoard extends React.Component{
    
    constructor(props){
        super(props)
        this.state = {data: null}
    }

    componentDidMount() {
        httpGetAsync('/goofspiel/state', function(data) {
            this.setState({data: data});
        }.bind(this));
    }
  
    render() {
        var retVal 
        if (this.state.data) {
             
            retVal =  
                <div>
                <h1>
                GoofSpiel!
                </h1>
                <h3>
                Zak
                </h3>
                </div>;
        }else{
            retVal = <h1>Loading...</h1>;

        }
        
        return retVal
    }
}




render(<GoofBoard />, document.getElementById('container'));

console.log("Working!")


