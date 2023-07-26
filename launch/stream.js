
import { LogError, LogInfo } from './util/Log'
import user from './util/user';
var cloudReady = true;
operateMessageMap = new Map()
export var isLocalReady = false;
var localFunctionCallback2;
var localFunctionCallResp;
var localFunctionReadyInvoke = false;

async function InitGameEnvInner() {
    LogInfo("InitGameEnvInner");
    if (localFunctionReadyInvoke) {
        return;
    }
    localFunctionReadyInvoke = true;

    // 初始化游戏环境，触发metashell下载过程
    await hyExt.exe.initGameEnv().then(() => {
        isLocalReady = true;
        LogInfo('hyExt.exe.initGameEnv调用成功')
    }).catch((e) => {
        LogError("hyExt.exe.initGameEnv调用失败", e)

    });

};


function InitGameEnv(callback){
    localFunctionCallback2 = callback;
    if (localFunctionCallResp) {
        callback(localFunctionCallResp);
    }
}

var localFunctionCallback = []
var innerLocalFunctionCallbackVar
function innerLocalFunctionCallback(info) {
    LogInfo('监听到本地消息', info)
    const {name, message} = info;
    LogInfo('监听到本地消息:' + "," + JSON.stringify(name) + "," + JSON.stringify(message));
    const eventName = name;
    const eventMessage = message;
    
    if (eventName == 'GameEnvEvent') {
        // 将数据回传到metashell下载监听器
        if (localFunctionCallback2) {
            localFunctionCallback2(eventMessage)
        }
    }

    if (localFunctionCallback.length > 0) {
        localFunctionCallback.forEach((callback, i) => {
            callback({name, message})
        });
    }
}

async function onGameMessage(callback){
    LogInfo('添加本地消息监听')
    localFunctionCallback.push(callback)
    if (!innerLocalFunctionCallbackVar) {
        innerLocalFunctionCallbackVar = innerLocalFunctionCallback;
        LogInfo('注册本地消息监听')
        hyExt.exe.onGameMessage({
            callback: innerLocalFunctionCallbackVar
        }).then(() => {
            console.log("hyExt.exe.onGameMessage调用成功")
        }).catch((e) => {
            console.error("hyExt.exe.onGameMessage调用失败", e)
        })
    }
}

// 取消监听消息
async function offGameMessage(){
    hyExt.exe.offGameMessage()
    .then(() => {
        console.log("hyExt.exe.offGameMessage调用成功")
    })
    .catch((e) => {
        console.error("hyExt.exe.offGameMessage调用失败", e)
    })
}

function removeLocalFunctionMessage(callback){
    var index = localFunctionCallback.indexOf(callback);
    LogInfo('移除本地消息监听,' + index)
    if (index >= 0) {
        localFunctionCallback.splice(index, 1);
    }
}

async function  LaunchGame(req){
    console.info('LaunchGame,' + process.env.HYEXT_BUILD_ENV)
    env = ""
    if (process.env.HYEXT_BUILD_ENV == 'dev') {
        env = "test"
    } else if (process.env.HYEXT_BUILD_ENV == 'test') {
        env = "test"
    } else if (process.env.HYEXT_BUILD_ENV == 'production') {
        env = "production"
    }
    if(env == "production"){
        var extVersionType2 = await user.getExtVersionType();
        console.info('getExtVersionType,' + extVersionType2)
        if(extVersionType2 == 2){
            env = "test";
        }
    }
    req.optParams = JSON.stringify({env});
    const rspPromise = new Promise((resolve, reject) => {
        LogInfo('开启云加工:' + JSON.stringify(req))
        resolve()
        hyExt.exe.launchGame(req).then(resp => {
            resolve(resp)
        }).catch(err => {
            reject(err)
        })
    })
    return rspPromise;
}

function ShutdownGame(){
    return hyExt.exe.shutdownGame()
}

function SendMessageToExe(params){
    let req = {};
    if (typeof params == "string") { 
        req.message = params;
    } else {
        req.message = JSON.stringify(params);
    }
    LogInfo("req", JSON.stringify(req));
    return hyExt.exe.sendToGame(req)
}


export  {
    InitGameEnvInner,
    InitGameEnv,
    onGameMessage,
    offGameMessage,
    removeLocalFunctionMessage,
    LaunchGame,
    ShutdownGame,
    SendMessageToExe,
}