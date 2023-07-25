import { Component } from 'react';
import { LayoutChangeEvent, ViewStyle } from 'react-native';
export interface ProgressProps {
    style?: ViewStyle;
    barStyle?: ViewStyle;
    percent?: number;
    easing?: boolean;
    duration?: number;
}
export declare class Progress extends Component<ProgressProps, any> {
    static defaultProps: {
        style: {};
        barStyle: {};
        percent: number;
        easing: boolean;
        duration: number;
    };
    constructor(props: ProgressProps);
    componentDidMount(): void;
    componentWillReceiveProps(nextProps: ProgressProps): void;
    normalPercent(percent: number): number;
    getWidthByPercent(baseWidth: any, percent: any): number;
    onLayout: (e: LayoutChangeEvent) => void;
    toAnimate(target: any, fromValue: any, toValue: any, duration: any): void;
    render(): JSX.Element;
}
