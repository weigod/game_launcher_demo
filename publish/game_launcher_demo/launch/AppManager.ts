class AppManager{
    gameRunning:boolean = false;
    exeRunning:boolean = false;
    gameTime:number = 0;
    gameRunningStart:number = 0;
    exeRunningStart:number = 0;
    gameId:number = 0;
    startLocalFunctionSuccess:boolean = false;
    startLaunchTime:number = 0;
    appStartTime:number = 0;
    localLaunchMd5:string = "";
    localLaunchExeName:string = "";
    gameBusizName:string = "";
}

export default new AppManager();