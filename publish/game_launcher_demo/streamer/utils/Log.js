Date.prototype.format = function(fmt) { 
    var o = { 
       "M+" : this.getMonth()+1,                 //月份 
       "d+" : this.getDate(),                    //日 
       "h+" : this.getHours(),                   //小时 
       "m+" : this.getMinutes(),                 //分 
       "s+" : this.getSeconds(),                 //秒 
       "q+" : Math.floor((this.getMonth()+3)/3), //季度 
       "S+"  : this.getMilliseconds()             //毫秒 
   }; 
   if(/(y+)/.test(fmt)) {
           fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length)); 
   }
    for(var k in o) {
       if(new RegExp("("+ k +")").test(fmt)){
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
        }
    }
   return fmt; 
}   
const argsToMsg = args => args ? args.map(item => typeof item !== 'string' ? JSON.stringify(item) : item).join(' ') : ''

export var LogInfo = (...msg) => {
    try {
        var time = new Date().format("yyyy-MM-dd hh:mm:ss:SS");
        msg.unshift(time + "");
        console.info(...msg);
        hyExt.logger.info(...msg)
    } catch(e) {

    }
}

export var LogDebug = (...msg) => {
    var time = new Date().format("yyyy-MM-dd hh:mm:ss:SS");
    msg.unshift(time + "");
    console.debug(...msg);
    // hyExt.logger.debug(...msg)
}

export var LogWarn= (...msg) => {
    var time = new Date().format("yyyy-MM-dd hh:mm:ss:SS");
    msg.unshift(time + "");
    console.warn(...msg);
    hyExt.logger.warn(...msg)
}

export var LogError= (...msg) => {
    var time = new Date().format("yyyy-MM-dd hh:mm:ss:SS");
    msg.unshift(time + "");
    console.error(...msg);
    hyExt.logger.error(...msg)
}