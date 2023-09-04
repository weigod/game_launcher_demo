import { LogError, LogInfo } from "./util/Log";
import AppManager from "./AppManager";
import {
    ShutdownGame,
    LaunchGame,
} from './stream';

const TAG = "Launch_LocalFunctionManager";
class LocalFunctionManager{

    private startLocalFunctionSuccess = false;
    private progress:(progress:number) => void;
    private result:(success:boolean) => void;
    private first:boolean = true;
    private startLocalFunctionNow:boolean = false;
    private intervalId :any;
    private startTime:number = 0;
    public init(req:{
        progress:(progress:number) => void,
        result: (success:boolean) => void
    }):void{
        this.progress = req.progress;
        this.result = req.result;
        return;
    }

    public async startLocalFunctionProcessing(){
        if(this.startLocalFunctionNow){
            return;
        }
        this.startLocalFunctionNow = true;
        const model = {
            "gameId":AppManager.gameId
        }
        const req = {
            "processMode": 'local',
            "md5": AppManager.localLaunchMd5,
            "exeName": AppManager.localLaunchExeName,
            // "exeParams": JSON.stringify(model),
        }
        LogInfo(TAG,"开启加工 req=" + JSON.stringify(req))
        let startLocalFunctionTime = Date.now();
        let first = this.first;
        if(first){
            this.first = false;
            LogInfo(TAG, {
                code: 1200,
                msg: "首次启动game",
                extra: {
                    gameId:AppManager.gameId
                }
            }, true)
        }
        this.showStartLocalProgress();
        LaunchGame(req).then(rsp => {
            LogInfo(TAG,"开启加工 rsp=" + JSON.stringify(rsp))
            this.stopStartLocalProgress();
            this.progress && this.progress(100);
            this.result && this.result(true);
            this.startLocalFunctionNow = false;
            this.startLocalFunctionSuccess = true;
            LogInfo(TAG, {
                code: 1201,
                msg: "启动game调用成功",
                extra: {
                    time: Date.now() - startLocalFunctionTime,
                    gameId:AppManager.gameId,
                    first:this.first,
                }
            }, true)
            AppManager.startLocalFunctionSuccess = true;
            AppManager.startLaunchTime = Date.now();
        }).catch(async (err) => {
            LogError(TAG,'开启加工 失败' + JSON.stringify(err) + ",err=" + err);
            this.startLocalFunctionNow = false;
            this.stopStartLocalProgress();
            this.result && this.result(false);
            LogInfo(TAG, {
                code: -1200,
                msg: "启动game调用失败",
                extra: {
                    msg: JSON.stringify(err),
                    gameId:AppManager.gameId,
                }
            }, true);
        })
    }

    public restartLocalFunctionProcess = () => {
        ShutdownGame().then(() => {
            LogInfo(TAG,"停止加工 成功")
            this.startLocalFunctionProcessing();
        }).catch((err) => {
            LogError(TAG,"停止加工 err=" + JSON.stringify(err))
            this.startLocalFunctionProcessing();
        })
    }

    private showStartLocalProgress() {
        if(this.intervalId){
            clearInterval(this.intervalId);
        }
        this.startTime = Date.now();
        this.intervalId = setInterval(() => {
            var progress = Math.round((Date.now() - this.startTime) / 3000 * 100);
            if (progress >= 100) {
                progress = 99;
                clearInterval(this.intervalId)
            }
            this.progress && this.progress(progress);
        }, 200);
    }

    private stopStartLocalProgress() {
        clearInterval(this.intervalId);
        this.intervalId = null;
    }
}

export default  new LocalFunctionManager;