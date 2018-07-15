import React, { Component } from 'react';
import logo from '../../assets/pacman.png';
import Editor from "../../components/Edit";
import styled from 'styled-components'
const Ap = styled.div`

.App-logo {
  animation: App-logo-spin infinite 20s linear;
  height: 80px;
}

.App-header {
  background-color: #222;
  height: 150px;
  padding: 20px;
  color: white;
  text-align: center;
  
}

.App-title {
  font-size: 1.5em;
}

.App-intro {
  font-size: large;
}

@keyframes App-logo-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

`
class App extends Component {
  render() {
    return (
      <Ap className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to Piggy</h1>
        </header>
        <Editor/>
      </Ap>
    );
  }
}

export default App;
