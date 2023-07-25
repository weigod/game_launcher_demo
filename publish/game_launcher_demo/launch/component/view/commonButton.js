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
const { Button } = UI
export default class CommonButton extends Component {
    constructor(props) {
        super(props)
        this.state = {

        }
        if (this.props.normalStyle) {
            this.state.style = this.props.normalStyle
        }
        if (this.props.normalTextStyle) {
            this.state.textStyle = this.props.normalTextStyle
        }
    }

    onMouseEnter = () => {
        this.state.style = this.props.hoverStyle;
        this.state.textStyle = this.props.hoverTextStyle;
        this.setState(this.state);
    }

    onMouseLeave = () => {
        this.state.style = this.props.normalStyle;
        this.state.textStyle = this.props.normalTextStyle;
        this.setState(this.state);
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
        const { normalStyle, hoverStyle, pressStyle, disableStyle } = this.props
        const { normalTextStyle, hoverTextStyle, pressTextStyle, disableTextStyle } = this.props
        const { width, height } = this.props
        const { text } = this.props
        var disable = false;
        if(this.props.enable != undefined){
            disable = !this.props.enable;
        }
        return (
            <div onMouseEnter={this.onMouseEnter}
                onMouseLeave={this.onMouseLeave} style={this.props.style}>
                <Button style={[this.state.style ? this.state.style : {}, { width: width, height: height }]}
                    disabled={disable}
                    onPress={this.onPress}
                    size='sm'
                    textStyle={[this.state.textStyle ? this.state.textStyle : {}, {}]}
                >
                    {text}

                </Button>
            </div>

        )
    }
}