export const  controlPanelInVisible = function() {
    hyExt.action
        .localControlPanelVisible({ extType: "pc_anchor_panel", visible: false, param: {} })
        .then((res) => {
            console.log("hyExt.action.localControlPanelVisible调用成功", res)
        })
        .catch((e) => {
            console.error("hyExt.action.localControlPanelVisible调用失败", e)
        })
};

export const  controlPanelVisible = function() {
    hyExt.action
        .localControlPanelVisible({ extType: "pc_anchor_panel", visible: true, param: {} })
        .then((res) => {
            console.log("hyExt.action.localControlPanelVisible调用成功", res)
        })
        .catch((e) => {
            console.error("hyExt.action.localControlPanelVisible调用失败", e)
        })
}
