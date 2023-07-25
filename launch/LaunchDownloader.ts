import { LogError, LogInfo } from "./util/Log";
import { localLaunchStoreKey } from "./util/Store";
import { getData, storeData } from './util/Store'
import AppManager from "./AppManager";
const TAG = 'LaunchDownloader'
class LaunchDownloader {

    private localLaunchDownloadUrl: string = '';
    private localLaunchDownloadMd5: string = '';
    private localLaunchExeName: string = "";
    private progressCallback?: (progress: number) => void;
    private finishCallback?: () => void;
    private gameStartDownTime: number = 0;

    /**
     * 
     * @param req game下载请求
     * - gameUrl game包的下载链接
     * - gameMd5 game包的md5
     * - gameExeName game包下进程入口文件名
     */
    public start(req: {
        gameUrl: string,
        gameMd5: string,
        gameExeName: string,
        progress?: (progress: number) => void,
        finish?: () => void
    }) {
        this.registerDownloadProgress();
        this.localLaunchDownloadUrl = req.gameUrl;
        this.localLaunchDownloadMd5 = req.gameMd5;
        this.localLaunchExeName = req.gameExeName;
        this.progressCallback = req.progress;
        this.finishCallback = req.finish;
        this.cleanFs();
        this.downloadLocalLaunch(this.localLaunchDownloadUrl, this.localLaunchDownloadMd5, this.localLaunchExeName);
    }

    private registerDownloadProgress() {
        LogInfo(TAG, "registerDownloadProgress");
        //res = 1,表示在下载中
        //res = 0, 表示下载完成,msg就是路径(如果从断点续传下载的话), 如果存在，The file already ;
        let firstDown = true;
        hyExt.context.on('downloadProgress', ({ res, msg, url, md5, bytesLoaded, bytesTotal, path }) => {
            LogInfo(TAG, "res=" + res + ",msg=" + msg + ",url=" + url +
                ",bytesLoaded=" + bytesLoaded + ",bytesTotal=" + bytesTotal + ",path=" + path);
            if (md5 == this.localLaunchDownloadMd5) {
                if (res == 1) {
                    if (bytesTotal != 0) {
                        var progress = Math.round(bytesLoaded / bytesTotal * 100);
                        this.progressCallback && this.progressCallback(progress);
                        LogInfo(TAG, "downloadLocalLaunch url=" + this.localLaunchDownloadUrl + ",md5=" + this.localLaunchDownloadMd5 + ",progress=" + progress);
                        if (firstDown) {
                            try {
                               LogInfo(TAG, {
                                    code: 1120,
                                    msg: "game包开始下载",
                                    extra: {
                                        progress: progress,
                                        gameId: AppManager.gameId,
                                        url: this.localLaunchDownloadUrl
                                    }
                                }, true);
                            } catch (e) { }
                            firstDown = false;
                        }
                    }
                }
                if (res == 0) {
                    LogInfo(TAG, "downloadLocalLaunch url=" + this.localLaunchDownloadUrl + ",md5=" + this.localLaunchDownloadMd5 + " finish");
                    const localLaunchConfig = {
                        "url": this.localLaunchDownloadUrl,
                        "md5": this.localLaunchDownloadMd5,
                        "exeName": this.localLaunchExeName
                    };
                    storeData(localLaunchStoreKey, JSON.stringify(localLaunchConfig));
                    AppManager.localLaunchMd5 = this.localLaunchDownloadMd5;
                    AppManager.localLaunchExeName = this.localLaunchExeName;
                    this.progressCallback && this.progressCallback(100);
                    this.finishCallback && this.finishCallback();
                   LogInfo(TAG, {
                        code: 1121,
                        msg: "game包下载完成",
                        extra: {
                            time: Date.now() - this.gameStartDownTime,
                            gameId: AppManager.gameId,
                            url: this.localLaunchDownloadUrl
                        }
                    }, true);
                }
                if (res == -1) {
                    //下载失败啦，要重新下载
                    this.downloadLocalLaunch(this.localLaunchDownloadUrl, this.localLaunchDownloadMd5, this.localLaunchExeName)
                   LogInfo(TAG, {
                        code: -1120,
                        msg: "game包下载失败",
                        extra: {
                            res: res,
                            msg: msg,
                            gameId: AppManager.gameId,
                            url: this.localLaunchDownloadUrl
                        }
                    }, true);
                }
            }
        })
    }

    private downloadLocalLaunch(url: string, md5: string, exeName: string) {
        this.gameStartDownTime = Date.now();
        hyExt.fs.downloadBatchRes([{
            url: url, md5: md5, unzip: true, offline: false
        }]).then(() => {
            /** 调用成功 */
            LogInfo(TAG, "downloadLocalLaunch url=" + url + ",md5=" + md5)
        }).catch(err => {
            /** 调用失败 */
            const { msg } = err
            LogError(TAG,"downloadLocalLaunch url=" + url + ",md5=" + md5 + ",msg=" + msg)
        })
    }

    private async cleanFs() {
        var value = await getData(localLaunchStoreKey)
        if (value !== null || value !== undefined) {
            try {
                var localLaunchConfig = JSON.parse(value as string);
                const { url, md5, exeName } = localLaunchConfig;
                var reserveMD5List = [md5];
                LogInfo(TAG, "cleanRes, reserveMD5List=" + JSON.stringify(reserveMD5List))
                var res = await hyExt.fs.cleanRes({ reserveMD5List: reserveMD5List });
                LogInfo(TAG, "hyExt.fs.cleanRes调用成功", res)
            } catch (e) {
                LogError(TAG, "hyExt.fs.cleanRes调用失败", e)
            }
        }
    }
}

export default new LaunchDownloader();