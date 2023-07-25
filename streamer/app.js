import { UI } from '@hyext/hy-ui'
import React, { Component } from 'react'
import AppConfig from '../config'
import { controlPanelInVisible, controlPanelVisible } from './utils/controlPanelVisible'
import Launch from '../launch/Launch'
import LaunchLoadView from '../launch/LaunchLoadView'
import { LogInfo } from '../launch/util/Log';
import './app.hycss'

const TAG = "app"
class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      initFinish: false
    }
    this.param = null;
    this.init();
  }

  async init() {
    await Launch.init({
      gameBusizName:AppConfig.game_name,
      gameConfigApi:this.gameConfigApi,
      exit:this.disposal,
      finish:()=>{
        controlPanelInVisible()
      }
    });

    Launch.start();
    LogInfo("AppConfig", JSON.stringify(AppConfig))
    this.state.initFinish = true;
    this.setState({ ...this.state })
  }


  async gameConfigApi() {
    let rsp = {};
    rsp.gameUrl = AppConfig.game_url;
    rsp.gameMd5 = AppConfig.game_md5;
    rsp.gameExeName = AppConfig.game_exe_name;
    return rsp;
  }

  async disposal() {
    hyExt.panel.disposal()
  }

  render() {
    return (
      <>
        {this.state.initFinish && <LaunchLoadView>hello world</LaunchLoadView>}
      </>
    )
  }
}

export default App
