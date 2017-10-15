import React from 'react';
import { render } from 'react-dom';

console.clear();

class TodoApp extends React.Component{
  render(){
    // Render JSX
    return (
        <h1> HELLO WORLD </h1>
    );
  }
}

render(<TodoApp />, document.getElementById('container'));

console.log("Working!")
