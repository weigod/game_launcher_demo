import React, { Component } from 'react'
import { View } from 'react-native';
import { UI } from '@hyext/hy-ui'
import Launch, {ErrorType } from './Launch';
import AlertDialog from "./component/dialog/AlertDialog"
import TipDialog from './component/dialog/TipDialog'
import { controlPanelVisible } from '../streamer/utils/controlPanelVisible';
import { SendMessageToExe } from './stream';

const { Progress } = UI
const { Text, Image, Button, Input} = UI

interface state {
    progress: number,
    progressDisplay: string,
    progressTip: string,
    inputText: string,
    receiveMsg: string
}
export default class LaunchLoadView extends React.Component<any, state>{

    constructor(props: any) {
        super(props);
        this.state = {
            progress: 0,
            progressDisplay: 'flex',
            progressTip: '正在加载...',
            inputText: '',
            receiveMsg: ''
        }
    }

    componentDidMount() {
        Launch.addCallback({
            progress: (progress: number) => {
                this.setState({ progress: progress })
            },
            error: async (type: ErrorType, res: number, msg: string) => {
                // 检测到exe程序主动退出, 直接销毁小程序
                if (type === ErrorType.Run && res === 1601) {
                    hyExt.panel.disposal();
                    return;
                }

                var extInfo = await hyExt.env.getExtInfo();
                let extname = extInfo.extName;
                if (type == ErrorType.Download) {
                    TipDialog.show(msg)
                } else {
                    controlPanelVisible();
                    AlertDialog.show(`${extname}直播间异常，是否需要重启`, "确定", "取消", () => {
                        Launch.restart();
                    })
                }
            },
            message: (info: {name: string, message: any}) => {
                this.setState({receiveMsg: JSON.stringify(info)})     
            },
            finish: () => {
                // this.setState({ progressDisplay: 'none' })
                this.setState({ progressTip: '启动成功 ' })
            }
        })
    }

    onInputChange = (e:any) => {
        this.setState({inputText: e})
    }

    render() {
        return <View style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#292C44',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            {
                this.state.progressDisplay == 'flex' &&
                <View
                    style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#292C44',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                    <Text
                        style={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontSize: 14,
                            fontWeight: '400',
                            fontFamily: 'Microsoft YaHei'
                        }}>{this.state.progressTip}{this.state.progress}%</Text>
                    <Progress
                        style={{
                            width: '360px',
                            height: '6px',
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            top: '19px'
                        }}
                        easing={true}
                        percent={this.state.progress}
                        barStyle={{ height: 6, backgroundColor: '#FFA900' }}
                    />
                </View>
            }
            <View style={{justifyContent: 'center', width: '100%', position: 'absolute', bottom: 100}}>
                <View style={{flexDirection: 'row', width: '100%', justifyContent: 'center'}}>
                    <Input
                        style={{width: '60%', paddingLeft: 10}} 
                        onChange={this.onInputChange}
                        placeholder={"请输入消息内容"}
                        placeholderTextColor="#AAAAAA"
                        autoFocus={false}
                        maxLength={30}
                        editable={true}
                        inputStyle={{fontSize: 12}}
                        value={this.state.inputText}
                        />
                        <Button size='md' onPress={() => {
                            SendMessageToExe(this.state.inputText)
                        }}>
                            <Text>发送</Text>
                        </Button>
                </View>
                <Text style={{color: '#FFFFFF', paddingLeft: 20, paddingTop: 20}}>{`收到小程序传来的消息, 内容为: ${this.state.receiveMsg}`}</Text>
            </View>
        </View>
    }
}