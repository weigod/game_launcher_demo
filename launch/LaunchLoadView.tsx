import React from 'react';
import { View } from 'react-native';
import { UI } from '@hyext/hy-ui';
import { useLaunch, useMsg, useReceiveMsg} from './useLaunch';

const {
    BackgroundImage,
    Text,
    Image,
    Button,
    Input,
    Progress,
} = UI;

const TAG = 'LaunchLoadView';
interface Props {
};
const LaunchLoadView: React.FC<Props> = ({
}: Props) => {
    const [
        status,
        statusMsg,
        progress,
        envProgress,
        doLocalStart,
        doCloudStart,
        doShutdown,
    ] = useLaunch();
    const [msg, setMsg, sendMsg] = useMsg(status);
    const [receiveMsg] = useReceiveMsg();

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
                    progress > 0 ?
                    <View
                        style={{
                            display: 'flex',
                            flex: 1,
                            marginTop: 180,
                            alignItems: 'center',
                        }}
                    >
                        <Text
                            style={{
                                color: '#FF9600',
                                fontSize: 14,
                                fontWeight: '400',
                                fontFamily: 'Microsoft YaHei',
                            }}
                        >
                            {progress.toFixed(2) * 100}%
                        </Text>
                        <Progress
                            style={{
                                width: '330px',
                                height: '4px',
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                top: '19px',
                            }}
                            easing={true}
                            percent={100}
                            barStyle={{
                                height: 4,
                                backgroundColor: '#FF9600',
                            }}
                        />
                    </View> : null
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
                            style={{ width: '75%', paddingLeft: 10 }}
                            onChange={setMsg}
                            placeholder={'请输入消息内容'}
                            placeholderTextColor='#AAAAAA'
                            autoFocus={false}
                            maxLength={30}
                            editable={true}
                            inputStyle={{ fontSize: 12 }}
                            value={msg}
                        />
                        <Button
                            style={{
                                borderColor: '#FF9600',
                                backgroundColor: '#FF9600',
                            }}
                            size='sm'
                            onPress={sendMsg}
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
                            {`收到消息: ${receiveMsg}`}
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
                        onPress={doLocalStart}
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
                        onPress={doCloudStart}
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
};

export default LaunchLoadView;
