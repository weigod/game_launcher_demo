/*
 * @Author: your name
 * @Date: 2022-03-29 19:58:48
 * @LastEditTime: 2022-05-26 11:24:18
 * @LastEditors: zhoujingxue zhoujingxue@huya.com
 * @Description: 没有摄像头，点击推送按钮的提示框
 * @FilePath: \xiugou\streamer\dialog\queryStreamPush.js
 */
import React, { Component } from 'react'
import { UI } from '@hyext/hy-ui'
import CommonButton from '../view/commonButton'
import { ScrollView, StyleSheet, Dimensions, TouchableWithoutFeedback, } from 'react-native'
import CommonButton2 from '../view/commonButton2'
const { Dialog, View, Text, Image, Modal } = UI

class TipDialogContent extends Component {
    constructor(props) {
        super(props)
    }
    render() {
        return (
            <View style={{ flexDirection: 'column', alignItems: 'center', width: '330px', height: '190px',backgroundColor:'white'}}>
                <Text style={{ position: 'absolute', left: 16, top: 16, fontSize: '14px', fontWeight: '400' }}>提示</Text>
                <View style={{
                    position: 'absolute', right: 17, top: 10, width: '30px', height: '30px', cursor: 'pointer',
                    flexDirection: 'row', alignItems: 'center', justifyContent: 'center'
                }}
                    onClick={() => {
                        this.props.dialog.close();
                    }}>
                    <Image style={{ width: '12px', height: '12px' }} src={require('./assets/close_bg.png')}
                        mode="contain"
                    ></Image>
                </View>

                <Text style={{ color: '#222222', fontSize: '12px', fontWeight: '400', marginTop: 72 }}>{this.props.msg}</Text>
                <CommonButton2 style={{ width: '80px', height: '30px', backgroundColor: '#FF9600', borderRadius: 4, marginTop: 50 }}
                    text={"好的"}
                    hoverBackgroundColor='#FFA11A'
                    pressBackgroundColor='#E17F01'
                    textSize='12px'
                    textColor='white'
                    hoverTextColor='white'
                    pressTextColor='rgba(255, 255, 255, 1)'
                    textFontWeight='400'
                    onClick={() => {
                        this.props.dialog.close();
                    }}
                ></CommonButton2>
            </View>
        )
    }
}
export default class TipDialog extends Modal {
    constructor(props) {
        props.cancelable = false;
        props.backdropColor = 'rgba(0, 0, 0, 0)';
        props.style = {
            boxShadow: '0px 2px 15px rgba(0, 0, 0, 0.1)',
        }
        var defaultProps = {
            ...Modal.defaultProps,
            ...props
        }
        super(defaultProps)
        this.state = {
            ...this.state,
            msg: ''
        }
    }

    static sTipDialogInstance;
    static show(msg) {
        var dialog = new TipDialog({ msg: msg });
        dialog.open();
    }

    init(props, syncTag) {
        Modal.prototype.init.call(this, props, syncTag)
    }

    getContent(c) {
        const inner = <TipDialogContent msg={this.props.msg} dialog={this}></TipDialogContent>
        return Modal.prototype.getContent.call(this, inner)
    }

    setInstance(instance) {
        sTipDialogInstance = instance;
    }
    render() {
        return null;
    }
}