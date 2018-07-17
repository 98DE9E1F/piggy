import React, { Component } from 'react';
import styled from 'styled-components';

import Editor from "../../components/Edit";

const Ap = styled.div`
height:100vh;
.App-logo {
  animation: App-logo-spin infinite 20s linear;
  height: 80px;
}

.App-header {
  position: sticky;
  top: 0;
  z-index:40;
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
  constructor(props){
    super(props)
    this.state = {}
  }
  render() {
    return (
      <Ap className="App">
         
        <Editor style={{height:'100%'}}/>
      </Ap>
    );
  }
}

export default App;