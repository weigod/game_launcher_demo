import React, { Component } from 'react'
import { View } from 'react-native';
import { UI } from '@hyext/hy-ui'
import Launch, {ErrorType } from './Launch';
import AlertDialog from "./component/dialog/AlertDialog"
import TipDialog from './component/dialog/TipDialog'
import { controlPanelVisible } from '../streamer/utils/controlPanelVisible';

const { Progress } = UI
const { Text, Image } = UI

interface state {
    progress: number,
    progressDisplay: string,
    progressTip: string
}
export default class LaunchLoadView extends React.Component<any, state>{

    constructor(props: any) {
        super(props);
        this.state = {
            progress: 0,
            progressDisplay: 'flex',
            progressTip: '正在加载...'
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
            finish: () => {
                // this.setState({ progressDisplay: 'none' })
                this.setState({ progressTip: '启动成功 ' })
            }
        })
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
        </View>
    }
}