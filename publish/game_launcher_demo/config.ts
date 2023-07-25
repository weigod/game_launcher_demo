var gameDownloadStrategy = ["huya-inner","http"]
var config = {
    //必须要填写，并且是业务唯一的,业务后台会根据这个来获取game的下载配置信息
    "game_name":"游戏Demo",
	
    //可以不填，会请求业务后台获取连接，如果填啦，则使用这个url
    "game_url":"http://o890da772ba60ed0-y7reva9x.test.hyext.com/extResource/GameDemo.zip",
	
    //如果填写了url,这个md5必须填写,这个是game包的md5
    "game_md5":"bafd85f027ec6cfb07cf537e3791ca8f",
	
    //game的可执行程序名称，填写了url,这个也要填
    "game_exe_name":"GameDemo.exe"
}
export default config