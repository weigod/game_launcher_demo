import React from 'react';
import { UI } from '@hyext/hy-ui';
import { EventEmitter } from 'events';
import config from '../config';
import { LogInfo } from '../launch/util/Log';
import { controlPanelInVisible } from '../streamer/utils/controlPanelVisible';

const { Tip } = UI;

const Status = {
    INIT: '未启动',
    DOWNLOADING: '下载中',
    DOWNLOAD_SUCCESS: '下载成功',
    DOWNLOAD_FAIL: '下载失败',
    ENVING: '初始化中',
    ENV_SUCCESS: '初始化成功',
    ENV_FAIL: '初始化失败',
    LAUNCHING: '启动中',
    LAUNCH_SUCCESS: '启动成功',
    LAUNCH_FAIL: '启动失败',
};

const GAME_MESSAGE = 'gameMessage';

const bus = new EventEmitter();

export const useLaunch = () => {
    const [progress, setProgress] = React.useState<number>(0);
    const [status, setStatus] = React.useState<string>(Status.INIT);
    const [statusMsg, setStatusMsg] = React.useState<string>('');
    const [envProgress, setEnvProgress] = React.useState<number>(0);

    // 监听EXE消息
    React.useEffect(() => {
        hyExt.exe.onGameMessage({
            callback: notice => {
                bus.emit(GAME_MESSAGE, notice);
            },
        });
        return () => {
            hyExt.exe.offGameMessage();
        };
    }, []);

    const doDownload = React.useCallback(() => new Promise((resolve, reject) => {
        // 设置状态
        setStatus(Status.DOWNLOADING);
        setProgress(0);
        // 调用下载接口下载EXE
        hyExt.fs.downloadBatchRes([{
            url: config.game_url,
            md5: config.game_md5,
            unzip: true,
            offline: false,
        }]).then(() => {
            // 下载进度变化的处理函数
            const handler = ({ res, msg, url, md5, bytesLoaded, bytesTotal, path }) => {
                if (md5 === config.game_md5) {
                    if (res === 0) {
                        // 下载完成
                        hyExt.context.off('downloadProgress', handler);
                        setProgress(1);
                        setStatus(Status.DOWNLOAD_SUCCESS);
                        resolve(1);
                    } else if (res === 1) {
                        // 下载中
                        setProgress(bytesLoaded / bytesTotal);
                    } else {
                        // 下载失败
                        hyExt.context.off('downloadProgress', handler);
                        setStatus(Status.DOWNLOAD_FAIL);
                        reject(new Error(msg || '下载失败'));
                    }
                }
            };
            // 监听下载进度变化
            hyExt.context.on('downloadProgress', handler);
        }, err => {
            setStatusMsg(err.message);
            setStatus(Status.DOWNLOAD_FAIL);
            reject(err);
        });
    }), []);

    const doInitGameEnv = React.useCallback(() => new Promise((resolve, reject) => {
        setStatus(Status.ENVING);
        setEnvProgress(0);
        // 初始化EXE环境，触发metashell下载过程
        hyExt.exe.initGameEnv();
        // 监听进度
        const handler = notice => {
            const { name, message } = notice;
            if (name === 'GameEnvEvent') {
                const { res, progress } = JSON.parse(message);
                if (Number(res) === 1) {
                    // 准备中
                    setEnvProgress(progress);
                } else if (Number(res) === 0) {
                    // 准备完毕
                    bus.removeListener(GAME_MESSAGE, handler);
                    setEnvProgress(1);
                    setStatus(Status.ENV_SUCCESS);
                    resolve(1);
                } else if (Number(res) === 2) {
                    // 相关功能已被其他小程序占用
                    bus.removeListener(GAME_MESSAGE, handler);
                    setStatus(Status.ENV_FAIL);
                    reject(new Error('相关功能已被其他小程序占用'));
                } else if (Number(res) === 3) {
                    // 解压失败
                    bus.removeListener(GAME_MESSAGE, handler);
                    setStatus(Status.ENV_FAIL);
                    reject(new Error('解压失败'));
                } else {
                    // 其它异常
                    bus.removeListener(GAME_MESSAGE, handler);
                    setStatus(Status.ENV_FAIL);
                    reject(new Error(`其它异常[${res}]`));
                }
            }
        };
        bus.addListener(GAME_MESSAGE, handler);
    }), []);

    const doLocalLaunchGame = React.useCallback(async () => {
        // 设置状态
        setStatus(Status.LAUNCHING);
        try {
            // 调用接口启动
            await hyExt.exe.launchGame({
                processMode: 'local',
                md5: config.game_md5,
                exeName: config.game_exe_name,
            });
            setStatus(Status.LAUNCH_SUCCESS);
        } catch (err) {
            setStatus(Status.LAUNCH_FAIL);
            setStatusMsg(err.message);
        }
    }, []);

    const doLocalStart = React.useCallback(async () => {
        try {
            // 下载
            await doDownload();
            // 初始化环境
            await doInitGameEnv();
            // 启动
            await doLocalLaunchGame();
        } catch (err) {
            setStatusMsg(err.message);
        }
    }, [doDownload, doInitGameEnv, doLocalLaunchGame]);

    const doCloudLaunchGame = React.useCallback(async () => {
        // 设置状态
        setStatus(Status.LAUNCHING);
        try {
            // 调用接口启动
            await hyExt.exe.launchGame({
                processMode: 'cloud',
                md5: '',
                exeName: 'GameDemo.exe',
                exeParams: '',
                optParams: JSON.stringify({
                    audioCaptureMode: 0,
                    cameraFilter: false,
                    playOutputAudio: false,
                    inputStream: [{
                        bitrate: 3000,
                        height: 1080,
                        width: 1920,
                    }],
                    outputStream: [{
                        bitrate: 3000,
                        height: 1080,
                        width: 1920,
                    }],
                }),
            });
            setStatus(Status.LAUNCH_SUCCESS);
        } catch (err) {
            setStatus(Status.LAUNCH_FAIL);
            setStatusMsg(err.message);
        }
    }, []);

    const doCloudStart = React.useCallback(async () => {
        try {
            // 初始化环境
            await doInitGameEnv();
            // 启动
            await doCloudLaunchGame();
        } catch (err) {
            setStatusMsg(err.message);
        }
    }, [doInitGameEnv, doCloudLaunchGame]);

    const doShutdown = React.useCallback(() => {
        hyExt.exe.shutdownGame().then(() => {
            Tip.show('关闭成功');
        }, err => {
            Tip.show(err.message || '关闭失败');
        });
    }, []);

    return [status, statusMsg, progress, envProgress, doLocalStart, doCloudStart, doShutdown];
};

export const useMsg = (status) => {
    const [msg, setMsg] = React.useState('');

    const sendMsg = React.useCallback(() => {
        if (status !== Status.LAUNCH_SUCCESS) {
            Tip.show('请先启动EXE');
        } else {
            // 调用接口发送数据
            hyExt.exe.sendToGame({
                message: msg,
            }).then(() => {
                Tip.show(`发送[${msg}]成功`);
            }, err => {
                Tip.show(err.message || '发送失败');
            });
        }
    }, [msg, status]);

    return [msg, setMsg, sendMsg];
};

export const useReceiveMsg = () => {
    const [receiveMsg, setReceiveMsg] = React.useState('');

    // 监听数据
    React.useEffect(() => {
        const handler = notice => {
            LogInfo('notice:', notice);
            setReceiveMsg(JSON.stringify(notice));
            const { name, message } = notice;
            if (name === 'GameEnvEvent') {
                const messageJson = JSON.parse(message);
                if (messageJson['res'] === 0 && messageJson['progress'] === 100) {
                    // 隐藏小程序窗口
                    controlPanelInVisible();
                }
            }
            if (name === 'GameMsg') {
                try {
                    const messageJson = JSON.parse(message);
                    if (messageJson['message'] === 'GameExit') { //messageJson['message'] may be json string
                        hyExt.panel.disposal();
                    } 
                } catch(e) {
                    console.log(e);
                }
            }
            if (name === 'ExceptionEvent') {
            }
            
        }
        bus.addListener(GAME_MESSAGE, handler);
        return () => {
            bus.removeListener(GAME_MESSAGE, handler);
        };
    }, []);

    return [receiveMsg];
};
