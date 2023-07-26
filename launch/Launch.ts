import LaunchDownloader from "./LaunchDownloader";
import GameEnvDownloader from "./GameEnvDownloader";
import LocalFunctionManager from "./LocalFunctionManager";
import AppManager from "./AppManager";
import { LogError, LogInfo } from "./util/Log";

import {
    onGameMessage,
    ShutdownGame,
    InitGameEnvInner
} from './stream';
const TAG = "Launch";

export type LaunchConfigRsp = {
    gameUrl: string;
    gameMd5: string;
    gameExeName: string;
}

export enum ErrorType {
    Download,
    Launch,
    Run
}
class Launch {
    private gameProgress: number = 0;
    private gameEnvProgress: number = 0;
    private launchLaunchProgress: number = 0;
    private progress: number = 0;
    private gameConfigApi: () => Promise<LaunchConfigRsp>;
    private progressCallback: Array<(progress: number) => void> = new Array;
    private errorCallback: Array<(type: ErrorType, res: number, msg: string) => void> = new Array;
    private finishCallback: Array<() => void> = new Array;
    private firstFrameCallback: Array<() => void> = new Array;
    private messageCallback: Array<(info: {name: string, message: any}) => void> = new Array;
    private exitCallback: (() => void) | undefined;
    private appStartTime: number;
    private firstRefreshProgress = true;
    private downloadLaunchFinish: boolean = false;
    private downloadMetaShellFinish: boolean = false;


    public async init(req: {
        gameBusizName: string,
        gameConfigApi: () => Promise<LaunchConfigRsp>,
        progress?: (progress: number) => void,
        error?: (type: ErrorType, res: number, msg: string) => void,
        finish?: () => void,
        firstFrame?: () => void,
        message?: (info: {name: string, message: any}) => void,
        exit?: () => void,
    }): Promise<void> {
        req.progress && this.progressCallback.push(req.progress);
        req.error && this.errorCallback.push(req.error);
        req.finish && this.finishCallback.push(req.finish);
        req.firstFrame && this.firstFrameCallback.push(req.firstFrame);
        req.message && this.messageCallback.push(req.message);
        this.gameConfigApi = req.gameConfigApi;
        this.exitCallback = req.exit;
        AppManager.gameId = Date.now();
        AppManager.gameBusizName = req.gameBusizName;
        LogInfo(TAG, {code: 1000, msg: "game初始化成功", extra: { extra: {gameId: AppManager.gameId}}}, true);
    }

    public addCallback(req: {
        progress: (progress: number) => void,
        error: (type: ErrorType, res: number, msg: string) => void,
        finish: () => void,
        firstFrame?: () => void,
        message?: (info: {name: string, message: any}) => void,
    }): void {
        req.progress && this.progressCallback.push(req.progress)
        req.finish && this.finishCallback.push(req.finish)
        req.error && this.errorCallback.push(req.error)
        req.firstFrame && this.firstFrameCallback.push(req.firstFrame)
        req.message && this.messageCallback.push(req.message)
    }

    public start(req: {
        gameUrl?: string,
        gameMd5?: string,
        gameExeName?: string,
    }): void {
        if (!req || !req.gameUrl) {
            this.gameConfigApi && this.gameConfigApi().then(rsp => {
                this.doWark(rsp.gameUrl, rsp.gameMd5, rsp.gameExeName);
            }).catch(err => {
                LogError(TAG, "getLaunchConfigError:", err);
            })
        } else {
            this.doWark(req.gameUrl, req.gameMd5 as string, req.gameExeName as string);
        }
    }

    private doWark(gameUrl: string, gameMd5: string, gameExeName: string) {
        GameEnvDownloader.start({
            progress: (progress: number) => {
                this.gameEnvProgress = progress;
                this.refreshProgress();
            },
            finish: (res: number, success: boolean, msg: string) => {
                if (!success) {
                    this.errorCallback && this.errorCallback.forEach(error => {
                        error(ErrorType.Download, res, msg)
                    })
                    return;
                }
                this.downloadMetaShellFinish = true;
                this.downloadLaunchFinish && LocalFunctionManager.startLocalFunctionProcessing();
            }
        });
        LaunchDownloader.start({
            gameUrl: gameUrl,
            gameMd5: gameMd5,
            gameExeName: gameExeName,
            progress: (progress: number) => {
                LogInfo(TAG, "LaunchDownloader progress:" + progress);
                this.gameProgress = progress;
                this.refreshProgress();
            },
            finish: () => {
                this.downloadLaunchFinish = true;
                this.downloadMetaShellFinish && LocalFunctionManager.startLocalFunctionProcessing();
            }
        })
        LocalFunctionManager.init({
            progress: (progress: number) => {
                this.launchLaunchProgress = progress;
                this.refreshProgress();
            },
            result: (success: boolean) => {
                if (success) {
                    this.finishCallback && this.finishCallback.forEach(finish => {
                        finish()
                    })
                } else {
                    this.errorCallback && this.errorCallback.forEach(error => {
                        error(ErrorType.Launch, -1, "加载异常")
                    })
                }
            }
        })
        // 注册监听本地进程消息，之后初始化环境
        this.listenerLocalMsg().then(() => {
            InitGameEnvInner();
        });
        this.appStartTime = Date.now();
    }

    public restart() {
        LocalFunctionManager.restartLocalFunctionProcess();
    }

    private refreshProgress() {
        var progress = this.gameEnvProgress * 0.3 + this.gameProgress * 0.6 + this.launchLaunchProgress * 0.1;
        progress = Math.round(progress);
        this.progress = progress;
        if (this.firstRefreshProgress) {
            LogInfo(TAG, {
                code: 1130,
                msg: "进度条开始刷新",
                extra: {
                    progress: progress,
                    gameId: AppManager.gameId
                }
            }, true);
            this.firstRefreshProgress = false;
        }
        this.progressCallback && this.progressCallback.forEach(callback => {
            callback(this.progress);
        })
    }

    async listenerLocalMsg() {
        await onGameMessage(async ({name, message}) => {
            LogInfo(TAG, 'onGameMessage message:' + message, 'name:', name);
            this.messageCallback && this.messageCallback.forEach(callback => {
                callback({name, message})
            })

            const eventName = name;
            const eventMessage = message;
            if (eventName === 'ExceptionEvent') {
                LogError(TAG, '进程异常');
                LogInfo(TAG, {
                    code: -1501,
                    msg: "进程异常",
                    extra: {
                        gameId: AppManager.gameId
                    }
                }, true);
                this.errorCallback && this.errorCallback.forEach(error => {
                    error(ErrorType.Run, -1501, "运行异常")
                })
            }

            if (eventName === 'GameMsg') {
                const {message} = JSON.parse(eventMessage);
                LogError(TAG, message);
                if (message === 'GameExit') {
                    LogInfo(TAG, {
                        code: 1601,
                        msg: "game Exit",
                        extra: {
                            gameId: AppManager.gameId
                        }
                    }, true);
                    this.errorCallback && this.errorCallback.forEach(error => {
                        error(ErrorType.Run, 1601, "游戏退出")
                    })
                }
            }
        })
    }

}

export default new Launch();