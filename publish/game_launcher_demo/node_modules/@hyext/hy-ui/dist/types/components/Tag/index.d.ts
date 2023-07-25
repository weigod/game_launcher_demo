import React from 'react';
import { TextStyle, ViewStyle } from 'react-native';
import tagStyles from './styles';
export { tagStyles };
export interface TagProps {
    style?: ViewStyle;
    textStyle?: TextStyle;
    type?: 'default' | 'primary' | 'danger' | 'info' | 'success' | 'warning';
    textColorInverse?: boolean;
}
export declare class Tag extends React.Component<TagProps, {}> {
    static defaultProps: {
        type: string;
        style: {};
        textColorInverse: boolean;
        textStyle: {};
    };
    render(): JSX.Element;
}
