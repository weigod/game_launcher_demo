declare const utils: {
    /**
     * Text align
     */
    textCenter: {
        textAlign: "center";
    };
    textLeft: {
        textAlign: "left";
    };
    textRight: {
        textAlign: "right";
    };
    /**
     * Text color
     */
    textPrimary: {
        color: any;
    };
    textPrimaryDark: {
        color: any;
    };
    textSuccess: {
        color: any;
    };
    textInfo: {
        color: any;
    };
    textDanger: {
        color: any;
    };
    textWarning: {
        color: any;
    };
    /**
     * Text weight
     */
    textNormal: {
        fontWeight: "normal";
    };
    textBold: {
        fontWeight: "bold";
    };
    /**
     * hidden
     */
    hidden: {
        position: "absolute";
        width: number;
        height: number;
    };
};
export default utils;
