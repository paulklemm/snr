import React from 'react';
import logo from './logo.svg';
import './App.css';
import BarChart from './BarChart';
import Scatterplot from './Scatterplot';

// <div className="App-header">
//          <img src={logo} className="App-logo" alt="logo" />
//          <h2>Welcome to React</h2>
//        </div>
//        <p className="App-intro">
//          To get started, edit <code>src/App.js</code> and save to reload.
//        </p>
//        <BarChart width={600} height={600}/>

class App extends React.Component {
  render() {
    return (
      <div className="App">
        <BarChart width={600} height={600} />
        <Scatterplot width={600} height={600}/>
      </div>
    );
  }
}

export default App;
