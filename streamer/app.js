import React, { Component } from 'react';
import LaunchLoadView from '../launch/LaunchLoadView';
import './app.hycss';

const TAG = 'app';
class App extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <LaunchLoadView></LaunchLoadView>
    );
  }
}

export default App;
