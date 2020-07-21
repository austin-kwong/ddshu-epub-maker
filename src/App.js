import React, { Component } from 'react';
import logo from './logo.svg';
import styled from 'styled-components';
import PreviewLinks from './Preview/PreviewLinks';
import './App.css';

const Title = styled.h1`
  font-size: 30px;
  text-align: center;
`

class App extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <Title>Save as ePub</Title>
          <PreviewLinks />
        </header>
      </div>
    );
  }
}

export default App;
