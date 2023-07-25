import { LogError, LogInfo } from "./util/Log";
import AppManager from "./AppManager";
import {InitGameEnv} from './stream';

const TAG = 'Launch_GameEnvDownloader'
class GameEnvDownloader{
    private startDownlaod:boolean = false;
    private startTime:number = 0;
    private progressCallback?:(progress:number) => void;
    private finishCallback?: (res:number,success:boolean,msg:string) => void;
    start(req:{
        progress:(progress:number) => void, 
        finish:(res:number,success:boolean,msg:string) => void
    }) {
        this.progressCallback = req.progress;
        this.finishCallback = req.finish;
        //监听独立exe的下载进度
       LogInfo(TAG,'start listenLocalFunctionReady')
        LogInfo(TAG, {
            code: 1002,
            msg: "listenLocalFunctionReady成功",
            extra:{
                gameId:AppManager.gameId
            }
        }, true);
        this.startTime = Date.now();
        this.startDownlaod = false;
        InitGameEnv((resp:string) => {
            var resObj = JSON.parse(resp)
            var res = resObj.res;
           LogInfo(TAG,'splash InitGameEnv:' + JSON.stringify(resp) + "," + res)
            if (res == 1) {
                //准备中
                this.progressCallback && this.progressCallback(resObj.progress)
                if(!this.startDownlaod){
                    this.startDownlaod = true;
                    LogInfo(TAG, {
                        code: 1110,
                        msg: "环境依赖开始下载",
                        extra: {
                            gameId:AppManager.gameId
                        }
                    }, true);
                }
            } else if (res == 0) {
                //准备完毕
                this.progressCallback && this.progressCallback(resObj.progress)
                this.finishCallback && this.finishCallback(res,true,"下载完成")
                LogInfo(TAG, {
                    code: 1111,
                    msg: "环境依赖下载完成",
                    extra: {
                        time: Date.now() - this.startTime,
                        gameId:AppManager.gameId
                    }
                }, true);
            } else if (res == 2) {
                this.finishCallback && this.finishCallback(res,false,"相关功能已被其他小程序占用")
                LogInfo(TAG, {
                    code: -1100,
                    msg: "环境依赖下载失败",
                    extra: {
                        res: res,
                        msg: "相关功能已被其他小程序占用",
                        extra:{
                            gameId:AppManager.gameId
                        }
                    }
                }, true);
            } else if (res == 3) {
                this.finishCallback && this.finishCallback(res,false,"解压失败")
                LogInfo(TAG, {
                    code: -1100,
                    msg: "环境依赖下载失败",
                    extra: {
                        res: res,
                        msg: "解压失败",
                        extra:{
                            gameId:AppManager.gameId
                        }
                    }
                }, true);
            }else{
                this.finishCallback && this.finishCallback(res,false,"其它异常")
            }
        })
    }
}

export default  new GameEnvDownloader();