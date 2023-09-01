import React, { Component } from 'react';
import { View } from 'react-native';
import { UI } from '@hyext/hy-ui';
import Launch, { ErrorType } from './Launch';
import AlertDialog from './component/dialog/AlertDialog';
import TipDialog from './component/dialog/TipDialog';
import { controlPanelVisible, controlPanelInVisible } from '../streamer/utils/controlPanelVisible';
import { SendMessageToExe } from './stream';
import { LogInfo, LogError } from '../launch/util/Log';
import AppConfig from '../config';
import { offGameMessage } from '../launch/stream';

const {
    BackgroundImage,
    Text,
    Image,
    Button,
    Input,
    Progress,
} = UI;

interface Props {
}

interface State {
    progress: number,
    progressDisplay: string,
    progressTip: string,
    inputText: string,
    receiveMsg: string,
}

const TAG = 'LaunchLoadView';

export default class LaunchLoadView extends Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            progressTip: '正在加载...',
            progressDisplay: 'flex',
            progress: 0,
            inputText: '',
            receiveMsg: '',
        };
    }

    componentDidMount() {
        Launch.addCallback({
            progress: (progress: number) => {
                this.setState({ progress: progress });
            },
            finish: () => {
                this.setState({ progressTip: '启动成功' });
            },
            message: (info: { name: string, message: any }) => {
                LogInfo('LaunchLoadView', 'message', info);

                this.setState({ receiveMsg: JSON.stringify(info) });
            },
            error: async (type: ErrorType, res: number, msg: string) => {
                // 检测到exe程序主动退出, 直接销毁小程序
                if (type === ErrorType.Run && res === 1601) {
                    return hyExt.panel.disposal();
                }

                const extInfo = await hyExt.env.getExtInfo();
                const extname = extInfo.extName;
                if (type == ErrorType.Download) {
                    TipDialog.show(msg);
                } else {
                    controlPanelVisible();
                    AlertDialog.show(
                        `${extname}直播间异常，是否需要重启`, '确定', '取消',
                        () => {
                            Launch.restart();
                        }
                    );
                }
            },
        });
    }

    onInputChange = (e: any) => {
        this.setState({ inputText: e });
    }

    render() {
        return (
            <View
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    overflow: 'hidden',
                    backgroundColor: '#292C44',
                }}
            >
                <BackgroundImage
                    style={{
                        position: 'absolute',
                        width: 375,
                        height: 600,
                        zIndex: 1,
                    }}
                    resizeMode={'cover'}
                    src={require('../image/bg.jpeg')}
                />
                <View
                    style={{
                        position: 'absolute',
                        width: 375,
                        height: 600,
                        zIndex: 2,
                    }}
                >
                    {
                        this.state.progressDisplay == 'flex' && this.state.progress > 0 &&
                        <View
                            style={{
                                display: 'flex',
                                flex: 1,
                                // justifyContent: 'center',
                                marginTop: 180,
                                alignItems: 'center',
                            }}>
                            <Text
                                style={{
                                    color: '#FF9600',
                                    fontSize: 14,
                                    fontWeight: '400',
                                    fontFamily: 'Microsoft YaHei',
                                }}
                            >
                                {this.state.progressTip}{this.state.progress}%
                            </Text>
                            <Progress
                                style={{
                                    width: '330px',
                                    height: '4px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                    top: '19px',
                                }}
                                easing={true}
                                percent={this.state.progress}
                                barStyle={{
                                    height: 4,
                                    backgroundColor: '#FF9600',
                                }}
                            />
                        </View>
                    }
                    <View
                        style={{
                            position: 'absolute',
                            bottom: 120,
                            width: '100%',
                            justifyContent: 'center',
                        }}
                    >
                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'center',
                                width: '100%',
                                borderRadius: 25,
                                overflow: 'hidden',
                            }}
                        >
                            <Input
                                style={{width: '75%', paddingLeft: 10}} 
                                onChange={this.onInputChange}
                                placeholder={'请输入消息内容'}
                                placeholderTextColor='#AAAAAA'
                                autoFocus={false}
                                maxLength={30}
                                editable={true}
                                inputStyle={{fontSize: 12}}
                                value={this.state.inputText}
                            />
                            <Button
                                style={{
                                    borderColor: '#FF9600',
                                    backgroundColor: '#FF9600',
                                }}
                                size='sm'
                                onPress={() => {
                                    SendMessageToExe(this.state.inputText)
                                }}
                            >
                                <Text
                                    style={{
                                        color: '#FFFFFF',
                                    }}
                                >发送</Text>
                            </Button>
                        </View>
                        <View
                            style={{
                                marginLeft: 16,
                                marginRight: 16,
                                marginTop: 5,
                                marginBottom: 5,
                                minHeight: 100,
                                backgroundColor: '#FFFFFF',
                            }}
                        >
                            <Text
                                style={{
                                    color: '#292C44',
                                }}
                            >
                                {`收到消息: ${this.state.receiveMsg}`}
                            </Text>
                        </View>
                    </View>
                    <View
                        style={{
                            position: 'absolute',
                            bottom: 60,
                            width: '100%',
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'flex-end',
                        }}
                    >
                        <Button
                            style={{
                                marginRight: 10,
                                borderRadius: 25,
                                borderColor: '#FF9600',
                                backgroundColor: '#FF9600',
                            }}
                            size='md'
                            onPress={async () => {
                                await Launch.init({
                                    gameBusizName: AppConfig.game_name,
                                    gameConfigApi: () => {
                                        return new Promise((resolve) => {
                                            resolve({
                                                gameUrl: AppConfig.game_url,
                                                gameMd5: AppConfig.game_md5,
                                                gameExeName: AppConfig.game_exe_name,
                                            });
                                        });
                                    },
                                    exit: () => {
                                        offGameMessage();
                                        hyExt.panel.disposal();
                                    },
                                    finish: () => {
                                        controlPanelInVisible();
                                    },
                                });
                                Launch.start({});
                            }}
                        >
                            <Text
                                style={{
                                    color: 'white',
                                }}
                            >本地运行</Text>
                        </Button>
                        <Button
                            style={{
                                marginLeft: 10,
                                borderRadius: 25,
                                borderColor: '#FFFFFF',
                            }}
                            size='md'
                            onPress={async () => {
                                hyExt.exe.onGameMessage(({name, message}) => {
                                    LogInfo(TAG, 'name:', name, 'message:' + message);
                        
                                    const eventName = name;
                                    const eventMessage = message;
                        
                                    if (eventName === 'ExceptionEvent') {
                                    }
                        
                                    if (eventName === 'GameMsg') {
                                        const { message } = JSON.parse(eventMessage);
                                        if (message === 'GameExit') {
                                            hyExt.panel.disposal();
                                        }
                                    }
                        
                                    if (eventName === 'GameEnvEvent') {
                                        const { msg, progress, res } = JSON.parse(eventMessage);
                                        if (res === 0 && progress === 100) {
                                            hyExt.exe
                                                .launchGame({
                                                    processMode: 'cloud',
                                                    md5: '',
                                                    exeName: 'GameDemo.exe',
                                                    exeParams: '',
                                                    optParams: JSON.stringify({
                                                        "audioCaptureMode": 0,
                                                        "cameraFilter": false,
                                                        "playOutputAudio": false,
                                                        "inputStream": [{
                                                            "bitrate": 3000,
                                                            "height": 1080,
                                                            "width": 1920
                                                        }],
                                                        "outputStream": [{
                                                            "bitrate": 3000,
                                                            "height": 1080,
                                                            "width": 1920
                                                        }]
                                                    }),
                                                })
                                                .then(() => {
                                                    LogInfo('hyExt.exe.launchGame调用成功');
                                                })
                                                .catch((e) => {
                                                    LogError('hyExt.exe.launchGame调用失败', JSON.stringify(e));
                                                });
                                            this.setState({progress: progress, progressTip: '启动成功', progressDisplay: 'flex'});
                                            controlPanelInVisible();
                                        } else if (res === 1) {
                                            this.setState({progress: progress, progressTip: '正在加载...', progressDisplay: 'flex'});
                                        }
                                    }
                                });
                                
                                hyExt.exe
                                    .initGameEnv().then(() => {
                                        LogInfo('hyExt.exe.initGameEnv调用成功');
                                    }).catch((e) => {
                                        LogError('hyExt.exe.initGameEnv调用失败', JSON.stringify(e));
                                    });
                            }}
                        >
                            <Text
                                style={{
                                    color: '#FF9600',
                                }}
                            >云端运行</Text>
                        </Button>
                    </View>
                </View>
            </View>
        );
    }
}
