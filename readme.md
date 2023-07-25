# 小程序拉起外部游戏演示Demo


## 1 Demo相关配置及发布

### 1.1 根目录config.json中添加关键配置

|     字段      |          描述          |                             示例                             |
| :-----------: | :--------------------: | :----------------------------------------------------------: |
|   game_name   |        游戏名称        |                           GameDemo                           |
|   game_url    |   zip资源压缩包链接    | http://cbe3ea588d3c03e4-c5q25ybd.test.hyext.com/extResource/GameDemo.zip |
|   game_md5    |     zip资源包的md5     |               0c89b8b711fb35e269f2801f2664c291               |
| game_exe_name | 资源包内可执行程序名称 |                         GameDemo.exe                         |

### 1.2 初始化配置及启动加载器

- 调用`Launch.init` 进行传递配置参数和一些回调监听函数，具体传参见对应lauch目录下的Launch启动器关键类；

- 调用`Launch.start`

具体参考代码见stream目录下的`app.js`入口文件, 

### 1.3 发布部署

- 执行`npm run release` 命令，在项目publish目录中会生成打包后的 `game_launcher_demo.zip`

- 虎牙小程序开发者中心`程序配置`中进行上传



## 2 关键EXE加工接口及调用流程

### 2.1 核心接口

|                      接口                      |     功能说明     |
| :--------------------------------------------: | :--------------: |
|             hyExt.exe.initGameEnv              |  初始化Game环境  |
|              hyExt.exe.launchGame              |     启动Game     |
|             hyExt.exe.shutdownGame             |     停止Game     |
|              hyExt.exe.sendToGame              |  发送消息至Game  |
|            hyExt.exe.onGameMessage             |   监听消息信息   |
|            hyExt.exe.offGameMessage            | 取消监听消息信息 |
|           hyExt.fs.downloadBatchRes            |  小程序下载接口  |
| hyExt.context.on('downloadProgress'，callback) |   监听下载进度   |

具体传参和使用示例见虎牙小程序SDK文档。

### 2.2 前端接口主要的调用顺序和交互逻辑

- 调用hyExt.exe.onGameMessage 以监听主播端或game的相关事件
- 调用hyExt.exe.initGameEnv 初始化游戏环境
-  监听onGameMessage中name为GameEnvEvent的事件，message结构示例如下：

```js
{"message":"{"msg":"success","progress":100,"res":0}","name":"GameEnvEvent"} 
```

其中message的结构为：

| 字段     | 类型   | 说明                                 |
| -------- | ------ | ------------------------------------ |
| msg      | string | success/downloading/fail  三种返回值 |
| progress | number | 进度数值，0~100                      |
| res      | number | 0表示正常                            |

当 res=0,msg=success,progress=100时表示主播端准备就绪



- 当监听到GameEnvEvent的事件准备就绪时，就可调用hyExt.exe.startGame可启动游戏exe

- 启动游戏后，可根据业务需要调用hyExt.exe.sendToGame或监听到onGameMessage的其他事件信息相应处理即可



### 2.3 通信消息说明

onGameMessage 会接收一些框架内部消息和自定义通信消息，具体如下：

| name           | message 结构体                                 | 说明                                                         | 示例                                                         |
| -------------- | ---------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| GameEnvEvent   | {msg: string , progress: number, res : number} | 环境初始化相关消息                                           | 见2.2示例                                                    |
| ExceptionEvent | {hostCode: number, hostMessage: string}        | hostCode: 异常状态码  hostMessage: 异常消息， 表示环境准备异常或者游戏中途出现异常crash等 | {"hostCode":20013,"hostMessage":"game has been killed"}', name: 'ExceptionEvent'} |
| GameMsg        | 定义格式和内容                                 | 由业务侧小程序与game exe间自定义的通信消息                   | {"message":"     {\"message\":\"GameExit\"}","name":"GameMsg"} |



其中，`ExceptionEvent` 消息中 hostCode、hostMessage取值：

| 消息内容                            | hostCode | hostMessage                                                  |
| ----------------------------------- | -------- | ------------------------------------------------------------ |
| Game进程中途Crash异常退出通知      | 20002    | {"msg":"process exit unexpected"}                            |
| 启动gameEnv进程失败通知           | 20007    | {"msg":"startup gameEnv failed"}                           |
| gameEnv发来的异常通知             | 20008    | {"msg":"errcode: 100, errmsg: start game error"}            |
| gameEnv进程中途Crash退出异常通知  | 20010    | {"msg":"gameEnv exit unexpected"}                          |
| gameEnv进程中途被杀死退出异常通知 | 20011    | {"msg":"gameEnv has been killed"}                          |
| 连接gameEnv进程IPC服务失败通知    | 20012    | {"msg":"connect gameEnv failed"}                           |
| Game进程中途被杀死退出异常通知     | 20013    | {"msg":"game has been killed"}                              |
| gameEnv进程启动后资源准备异常通知 | 20014    | {"msg":"gameEnv exit resource lack"}                       |