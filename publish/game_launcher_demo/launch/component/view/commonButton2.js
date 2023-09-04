/*
 * @Author: your name
 * @Date: 2022-03-29 16:59:54
 * @LastEditTime: 2022-04-09 15:44:06
 * @LastEditors: Please set LastEditors
 * @Description: 通用Button
 * @FilePath: \xiugou\streamer\view\commonButton.js
 */
import React, { Component } from 'react'
import { UI } from '@hyext/hy-ui'
const { Button, View, Text } = UI
export default class CommonButton2 extends Component {
    constructor(props) {
        super(props)
        this.state = {
            selected: false,
            isHover: false,
            press: false,
        }
        if (this.props.normalStyle) {
            this.state.style = this.props.normalStyle
        }
        if (this.props.normalTextStyle) {
            this.state.textStyle = this.props.normalTextStyle
        }
    }

    onMouseEnter = () => {
        this.state.isHover = true;
        this.setState({ ...this.state });
    }

    onMouseLeave = () => {
        this.state.isHover = false;
        this.state.press = false;
        this.setState({ ...this.state });
    }

    onMouseDown = () => {
        this.state.press = true;
        this.setState({ ...this.state });
    }

    onMouseUp = () => {
        this.state.press = false;
        this.setState({ ...this.state });
    }

    onClick = () => {
        if (this.props.onClick) {
            this.props.onClick();
        }
    }
    onPress = () => {
        const { onPress } = this.props;
        if (typeof onPress === "function") {
            onPress();
        }
        this.state.style = this.props.pressStyle;
        this.state.textStyle = this.props.pressTextStyle;
        this.setState(this.state);
    }
    render() {
        const { text } = this.props
        const { borderRadius, borderWidth, borderColor } = this.props;
        const { textSize, textFontWeight, textColor, normalTextColor, hoverTextColor, pressTextColor } = this.props;
        const { normalBackgroundColor, hoverBackgroundColor, pressBackgroundColor } = this.props;
        const { backgroundColor } = this.props.style;
        var disable = false;
        if (this.props.enable != undefined) {
            disable = !this.props.enable;
        }
        var _backgroundColor = backgroundColor;
        var _color = textColor;
        if (this.state.press) {
            if (pressBackgroundColor) {
                _backgroundColor = pressBackgroundColor;
            }
            if (pressTextColor) {
                _color = pressTextColor;
            }
        } else if (this.state.isHover) {
            if (hoverBackgroundColor) {
                _backgroundColor = hoverBackgroundColor;
            }
            if (hoverTextColor) {
                _color = hoverTextColor;
            }
        }

        return (
            <View onMouseEnter={this.onMouseEnter}
                onMouseLeave={this.onMouseLeave}
                onMouseDown={this.onMouseDown}
                onMouseUp={this.onMouseUp}
                onClick={this.onClick}
                style={[{ cursor: 'pointer', display: 'flex', alignContent: 'center', justifyContent: 'center', alignItems: 'center' }, this.props.style, { backgroundColor: _backgroundColor }]}>
                <Text style={{ fontSize: textSize, fontWeight: textFontWeight, color: _color, width: 'fit-content' }}>{this.props.text}</Text>

                {/* <div style={{ fontSize: textSize, fontWeight: textFontWeight, color: _color, width: 'fit-content'}}>{this.props.text}</div> */}
            </View>
        )
    }
}