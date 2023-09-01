
import React, { Component } from 'react'
import { UI } from '@hyext/hy-ui'
import CommonButton from '../view/commonButton'
import { ScrollView, StyleSheet, Dimensions, TouchableWithoutFeedback, } from 'react-native'
import CommonButton2 from '../view/commonButton2'
const { Dialog, View, Text, Image, Modal } = UI
export default class AlertDialog extends Modal {
    constructor(props) {
        console.info("AlertDialog construct:" + JSON.stringify(props))
        props.cancelable = false;
        // props.position = 'center';
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
            message: '',
            positiveButtonText: '',
            negativeButtonText: ''
        }
        this.showTimeout = null;
        this.state.message = props.message;
        this.state.positiveButtonText = props.positiveButtonText;
        this.state.negativeButtonText = props.negativeButtonText;
        this.positiveClick = props.positiveClick;
        this.negativeClick = props.negativeClick;
    }

    static isExistDialog = false;

    init(props, syncTag) {
        Modal.prototype.init.call(this, props, syncTag)
    }


    getContent(c) {
        const  inner = 
        <View style={{ width: '330px', height: '190px', borderRadius: 6, backgroundColor: 'white', flexDirection: 'column', alignItems: 'center' }}>
            <Text style={{ position: 'absolute', left: 16, top: 16, fontSize: '14px', fontWeight: '400' }}>提示</Text>
            <View style={{
                position: 'absolute', right: 17, top: 10, width: '30px', height: '30px', cursor: 'pointer',
                flexDirection: 'row', alignItems: 'center', justifyContent: 'center'
            }}
                onClick={() => {
                    this.close();
                    this.isExistDialog = false;
                }}>
                <Image style={{ width: '12px', height: '12px' }} src={require('./assets/close_bg.png')}
                    mode="contain"
                ></Image>
            </View>

            <Text style={{ color: '#222222', fontSize: '12px', fontWeight: '400', marginTop: 72 }}>{this.state.message}</Text>
            <View style={{ marginTop: 50,flexDirection:'row'}}>
                <CommonButton2 style={{ width: '80px', height: '30px', backgroundColor: '#FF9600', borderRadius: 4 }}
                    text={this.state.positiveButtonText}
                    hoverBackgroundColor='#FFA11A'
                    pressBackgroundColor='#E17F01'
                    textSize='12px'
                    textColor='white'
                    hoverTextColor='white'
                    pressTextColor='rgba(255, 255, 255, 1)'
                    textFontWeight='400'
                    onClick={() => {
                        if (this.positiveClick) {
                            this.positiveClick();
                        }
                        this.close();
                        AlertDialog.isExistDialog = false;
                    }}
                ></CommonButton2>

                <CommonButton2 style={{ width: '80px', height: '30px', backgroundColor: '#F4F5F8', borderRadius: 4, marginLeft: 14 }}
                    text={this.state.negativeButtonText}
                    hoverBackgroundColor='#EFF0F3'
                    pressBackgroundColor='#ECEDF0'
                    textSize='12px'
                    textColor='#555555'
                    hoverTextColor='#555555'
                    pressTextColor='#555555'
                    textFontWeight='400'
                    onClick={() => {
                        if (this.negativeClick) {
                            this.negativeClick();
                        }
                        this.close();
                        AlertDialog.isExistDialog = false;
                    }}
                ></CommonButton2>
            </View>
        </View>
        return Modal.prototype.getContent.call(this, inner)
    }
    static show(msg, positiveButtonText, negativeButtonText, positiveClick, negativeClick) {
        if (this.isExistDialog) {
            return;
        }

        var props = {
            "message": msg,
            "positiveButtonText": positiveButtonText,
            "negativeButtonText": negativeButtonText,
            "positiveClick": positiveClick,
            "negativeClick": negativeClick
        }
        var instance = new AlertDialog(props);
        instance.open();
        this.isExistDialog = true;
    }

    render() {
        return null
    }
}