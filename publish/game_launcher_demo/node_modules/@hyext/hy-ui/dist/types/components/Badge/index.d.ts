import React from 'react';
import { ViewStyle, TextStyle } from 'react-native';
export interface BadgeProps {
    style?: ViewStyle;
    label?: string | number;
    labelStyle?: TextStyle;
}
export declare class Badge extends React.PureComponent<BadgeProps> {
    static defaultProps: {};
    constructor(props: any);
    render(): JSX.Element;
}
