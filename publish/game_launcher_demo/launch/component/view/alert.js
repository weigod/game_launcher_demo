/*
 * @Author: your name
 * @Date: 2022-03-29 19:58:48
 * @LastEditTime: 2022-04-14 12:24:10
 * @LastEditors: Please set LastEditors
 * @Description: Alert对话框
 * @FilePath: \xiugou\streamer\dialog\queryStreamPush.js
 */
import React, { Component } from 'react'
import { UI } from '@hyext/hy-ui'
import CommonButton from './commonButton'
import { ScrollView, StyleSheet, Dimensions, TouchableWithoutFeedback, } from 'react-native'
const { Dialog, View, Text, Image, Modal } = UI
export default class Alert extends Component {
    constructor(props) {
        super(props)
        this.state = {
            title: '',
            message: '',
            cancelable:false

        }
    }
    open = () => {
        this._dialog.open();
    }
    static sAlertInstance;
    static show(title, message, sureCallbck) {
        if (sAlertInstance) {
            sAlertInstance.show(title, message, sureCallbck);
        }
    }

    static show2(title, message, cancelable, sureCallbck) {
        if (sAlertInstance) {
            sAlertInstance.show(title, message, cancelable, sureCallbck);
        }
    }

    setInstance(instance) {
        sAlertInstance = instance;
    }
    show(title, message, cancelable,sureCallbck) {
        console.info('title=' + title + ",message=" + message + ",cancel=" + cancelable);
        this.state.title = title;
        this.state.message = message;
        this.state.sureCallbck = sureCallbck;
        this.state.cancelable = cancelable;
        this.setState({...this.state}, () => {
            this._dialog.open();
        })
    }

    show(title, message, sureCallbck) {
        console.info('title=' + title + ",message=" + message + ", cancle=false");
        this.state.title = title;
        this.state.message = message;
        this.state.sureCallbck = sureCallbck;
        this.state.cancelable = false;
        this.setState({...this.state}, () => {
            this._dialog.open();
        })
    }

    render() {
        const header = (
            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginLeft: 16,
                    marginRight: 7
                }}>
                <Text
                    style={{
                        fontSize: '14px',
                        fontWeight: '400',
                        color: '#777777'
                    }}
                >提示</Text>

                <View style={{
                    width: '30px',
                    height: '30px',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: 'pointer'
                }} onClick={() => {
                    this._dialog.close()
                }}>
                    <Image style={{
                        width: '12px',
                        height: '12px'
                    }} src={require('./assets/close_bg.png')} mode="contain"></Image>
                </View>

            </View>
        )

        const body = (
            <View style={{
                marginTop: 18
            }}>
                <Text style={{
                    flex: 1,
                    textAlign: 'center',
                    color: '#222222',

                    // ...mixins.adjustFont(14, 1.2)
                    fontSize: 14,
                    fontWeight: '400',
                    textAlignVertical: 'center'
                }}>{this.state.title}</Text>

                <Text style={{
                    flex: 1,
                    textAlign: 'center',
                    color: '#666666',
                    marginTop: 6,
                    // ...mixins.adjustFont(14, 1.2)
                    fontSize: 12,
                    fontWeight: '400',
                    textAlignVertical: 'center'
                }}>{this.state.message}</Text>
            </View>
        )

        const footer = (
            <View style={{
                marginTop: 40,
                flexDirection: 'row',
                justifyContent: 'center'
            }}>

                <CommonButton width='80px' height='30px'
                    normalStyle={{
                        backgroundColor: '#FF9600',
                        borderRadius: 4,
                        borderWidth: 0
                    }} hoverStyle={{
                        backgroundColor: '#FFA11A',
                        borderRadius: 4,
                        borderWidth: 0
                    }} pressStyle={{
                        backgroundColor: '#E17F01',
                        borderRadius: 4,
                        borderWidth: 0
                    }} normalTextStyle={{
                        fontSize: '12px',
                        fontWeight: '400',
                        color: 'white',
                        paddingHorizontal: 0,
                        paddingVertical: 0
                    }} hoverTextStyle={{
                        fontSize: '12px',
                        fontWeight: '400',
                        color: 'white',
                        paddingHorizontal: 0,
                        paddingVertical: 0
                    }}
                    pressTextStyle={{
                        fontSize: '12px',
                        fontWeight: '400',
                        color: 'white'
                    }} text='确认' onPress={() => {
                        if (this.state.sureCallbck) {
                            this.state.sureCallbck()
                        }
                        this._dialog.close();
                    }}></CommonButton>

                <div style={{ marginLeft: 14 }}>

                </div>
                <CommonButton width='80px' height='30px'
                    normalStyle={{
                        backgroundColor: '#F4F5F8',
                        borderRadius: 4,
                        borderWidth: 0,
                        paddingHorizontal: 7,
                    }} hoverStyle={{
                        backgroundColor: '#EFF0F3',
                        borderRadius: 4,
                        borderWidth: 0,
                        paddingHorizontal: 7,
                    }} pressStyle={{
                        backgroundColor: '#ECEDF0',
                        borderRadius: 4,
                        borderWidth: 0,
                        paddingHorizontal: 7,
                    }} normalTextStyle={{
                        fontSize: '12px',
                        fontWeight: '400',
                        color: '#555555',
                        paddingHorizontal: 0,
                        paddingVertical: 0
                    }} hoverTextStyle={{
                        fontSize: '12px',
                        fontWeight: '400',
                        color: '#555555',
                        paddingHorizontal: 0,
                        paddingVertical: 0
                    }}
                    pressTextStyle={{
                        fontSize: '12px',
                        fontWeight: '400',
                        color: '#555555',
                        paddingHorizontal: 0,
                        paddingVertical: 0
                    }} text='取消' onPress={() => {
                        if (this.props.cancel) {
                            this.props.cancel()
                        }
                        this._dialog.close();
                    }}></CommonButton>

            </View>
        )
        return (
            <Modal style={{ width: '330px', height: '190px', borderRadius: 6, backgroundColor: 'white' }}
                ref={c => {
                    this._dialog = c
                }}
                cancelable={this.state.cancelable}
                backdropColor='rgba(0,0,0,0)'
            >
                {header}
                {body}
                {footer}

            </Modal>
        )
    }
}