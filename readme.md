# 小程序拉起外部游戏演示Demo
> 这个Demo不能用于生产环境开发！！！仅用于展示接口说明！！！  
> 这个Demo不能用于生产环境开发！！！仅用于展示接口说明！！！  
> 这个Demo不能用于生产环境开发！！！仅用于展示接口说明！！！  
[官方推荐小程序Demo在这里](https://github.com/huya-ext/hyext-examples/tree/master/examples/exe)  

## 1 Demo相关配置及发布
### Demo展示
![示例图片](image/demo.jpg)
### 小程序版本配置勾选"自动发布OBS"即支持OBS环境
![示例图片](image/obs.jpg)
### [示例小程序添加体验](https://appstore.huya.com/#/app/59ku7pqm)

### 1.1 根目录config.json中添加关键配置

|     字段      |          描述          |                             示例                             |
| :-----------: | :--------------------: | :----------------------------------------------------------: |
|   game_name   |        游戏名称        |                           GameDemo                           |
|   game_url    |   zip资源压缩包链接    | https://g1c972e2182629c7-59ku7pqm.hyext.com/extResource/GameDemo.zip |
|   game_md5    |     zip资源包的md5     |               1b0d590cb980a84ffbcf2cae123c7391               |
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

* hyExt.exe.launchGame 接口部分参数补充说明
  - processMode：加工模式，目前暂仅支持cloud云端模式/local本地模式
  - md5：仅对本地模式有效,运行本地的某个版本game，md5的值由小程序平台上传game包时生成
  - exeName：启动game的exe名称，如abc.exe
  - exeParams：本地或云端模式下进程启动时的命令行参数，格式和内容由业务侧自定
  - optParams：可选参数，值为json字符串，目前支持的字段(各字段本身也是可选的)，如下：
    - manualCastScreen： bool类型，是否手动投屏到主播端预览区图层(默认值为自动投屏到主播端，手动则需要提示主播捕获相应的窗口或进程)
    - fixedWindowSize：number类型，取值0/1, 针对云模式下的host窗口，是否支持允许拖动大小(默认值为固定大小，由视频流实际大小显示)
    - exeVersion：字符串类型，针对云模式下的包版本，同样由小程序平台上传game包时生成，如v1121
    - titleName：字符串类型，标题名，针对云模式下的host窗口
    - layerMode：number类型，针对云模式，图层布局目前支持三种(取值0/1/2，即：默认大小图层、全屏预览图层、保持宽高比的全屏预览图层)，默认值为默认大小图层
    - outputStream： 数组类型，针对云端模式，一般情况下配置一个值即可，其他个数输出预留后期支持。比如配置加工后画质(默认4000)流码率为5K： "outputStream":[{"bitrate":5000}]

### 2.2 前端接口主要的调用顺序和交互逻辑

- 1.先调用hyExt.exe.onGameMessage 以监听主播端或game的相关事件
- 2.再调用hyExt.exe.initGameEnv 初始化游戏环境
- 3.监听onGameMessage中name为GameEnvEvent的事件，message结构示例如下：

```js
{"msg":"success","progress":100,"res":0} 
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
| GameRunRecommendEvent | {systemEnv: string, recommendMode: string, forceMode: boolean}        | systemEnv: 系统环境配置  recommendMode: 推荐启动加工模式 forceMode: 是否为强制模式 | {"systemEnv":"cpu:Intel(R) Core(TM) i7-8700 CPU @ 3.20GHz\|gpu:Intel(R) UHD Graphics 630 \|NVIDIA GeForce RTX 2060\|","recommendMode":"local","forceMode":false} |
| GameEnvEvent   | {msg: string , progress: number, res : number} | 环境初始化相关消息                                           | 见2.2示例                                                    |
| ExceptionEvent | {hostCode: number, hostMessage: string}        | hostCode: 异常状态码  hostMessage: 异常消息， 表示环境准备异常或者游戏中途出现异常crash等 | {"hostCode":20013,"hostMessage":"game has been killed"} |
| GameMsg        | 定义格式和内容                                 | 由业务侧小程序与game exe间自定义的通信消息                   |     {\"message\":\"GameExit\"}或"some flat message" |
| OperateLayerEvent | {type: number, name: string}        | type: 操作类型  name: 图层名称，主播端操作图层时的事件通知 | {"type":1,"name":"游戏图层名"} |
| AnchorStatusEvent | {typeName: string, state: string}        | typeName: 主播端状态类型名  state: 主播端typeName对应所处状态 | {"typeName":"Live","state":"true"} |

具体各消息事件说明：
* `GameRunRecommendEvent` 为game运行推荐模式事件，可在接收到该事件后，根据应答结果调用hyExt.exe.launchGame接口(对应processMode值)，消息中 recommendMode、forceMode取值：

| 运行环境推荐事件                            | recommendMode | forceMode                                                  |
| ----------------------------------- | -------- | ------------------------------------------------------------ |
| 仅支持云模式启动加工，若采用本地模式启动加工会失败      | cloud    | true                        |
| 推荐用云模式启动加工，但不强制，也可以采用本地模式启动加工           | cloud    | false                          |
| 仅支持本地模式启动加工，若采用云端模式启动加工会失败             | local    | true                                |
| 推荐用本地模式启动加工，但不强制，也可以采用云端模式启动加工             | local    | false                                |
| 未知模式，业务侧可根据业务情况启动某种加工模式             | unknown    |     false                            |

* `ExceptionEvent` 消息中 hostCode、hostMessage取值：

| 消息内容                            | hostCode | hostMessage                                                  |
| ----------------------------------- | -------- | ------------------------------------------------------------ |
| Game进程中途Crash异常退出通知      | 20002    | "process exit unexpected"                        |
| 启动gameEnv进程失败通知           | 20007    | "startup gameEnv failed"                          |
| gameEnv发来的异常通知             | 20008    | "-1/-2/-3/3/8"                                |
| gameEnv进程中途Crash退出异常通知  | 20010    | "gameEnv exit unexpected"                          |
| gameEnv进程中途被杀死退出异常通知 | 20011    | "gameEnv has been killed"                           |
| 连接gameEnv进程IPC服务失败通知    | 20012    | "connect gameEnv failed"                           |
| Game进程中途被杀死退出异常通知     | 20013    | "game has been killed"                             |
| gameEnv进程启动后资源准备异常通知 | 20014    | "gameEnv exit resource lack"                        |
| gameEnv进程环境异常通知 | 20015    | "game env exception"                        |
| gameEnv进程云游戏环境Alive通知 | 20016    | "keep alive cloud job failed"                        |
| 云端game进程异常通知 | 20017    | "cloud game process exception"                        |
| 本地Game进程窗口捕获失败异常通知 | 20018    | "local game capture failed"                        |
| gameEnv用户环境异常通知 | 20030    | "user env unexpected"                        |

特别说明：
hostCode为20008时，hostMessage不同值说明如下：
- -1：启动本地game进程所在路径不存在(确定包完整性以及是否前端小程序触发下载该包到本地)
- -2：启动本地game进程失败(检查game进程是否缺少依赖文件或其他资源)
- -3：启动game进程后尝试信令连接握手超时
- 3：启动云模式参数错误(检查小程序上传包版本与小程序版本是否匹配)
- 8：云模式资源不足(可再尝试本地模式)

* `OperateLayerEvent` 消息中 type 取值：

| type | 类型描述 |
| - | - |
| 0 | 添加 |
| 1 | 删除 |
| 2 | 显示 |
| 3 | 隐藏 |
| 4 | 锁定 |
| 5 | 解锁 |
| 6 | 被选 |
| 7 | 失选 |
| 8 | 编辑 |

* `AnchorStatusEvent` 消息中 typeName 取值：

| key | 说明 |
| - | - |
| LinkMic | 是否连麦 |
| PK | 是否PK |
| Live | 是否开播 |
| PrivacyMode | 是否隐私模式 |

state 表示对应typeName的状态结果(默认为true/false，部分typeName可能为其他值) |

## 3 其他参考
* [本示例关联的游戏接入流程](https://github.com/weigod/game_sdk_demo)
* [弹幕玩法云启动全流程介绍](https://dev.huya.com/docs/miniapp/danmugame/intro/)
* [C++ Demo示例及开发流程说明](https://github.com/weigod/game_sdk_demo)
* [Unity C# Demo示例](https://github.com/weigod/game_unity_demo)

