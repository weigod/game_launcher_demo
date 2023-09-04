import { satisfies } from "compare-versions";
import { LogInfo, LogError } from './log';

export function isUndef(v: any) {
  return v === undefined || v === null;
}

export function isDef(v: any) {
  return v !== undefined && v !== null;
}


/**
 * 环境（小程序、宿主）工具
 */
class Environment {
  private static TAG = "Environment"
  private _extInfo: hyExt.GetExtInfoRsp | null = null;
  private _params: object | null = null;
  private _hostInfo: hyExt.GetHostInfoRsp | null = null;
  private _userInfo: hyExt.MainUserInfo | null = null;
  private _tidInfo: hyExt.TidInfo;
  private _channelInfo: hyExt.RespChannelInfo;
  private _ctxUserInfo: hyExt.UserInfo;

  public huya_web: string = "huya_web"; // 虎牙直播WEB主站
  public huya_app_ios: string = "huya_app_ios"; // 虎牙直播APP(iOS)
  public huya_app_adr: string = "huya_app_adr"; // 虎牙直播APP(安卓)
  public huya_pc_viewer: string = "huya_pc_viewer"; // 虎牙直播PC观众端
  public huya_pc_anchor: string = "huya_pc_anchor"; // 虎牙直播PC主播端
  public huya_zs_ios: string = "huya_zs_ios"; // 虎牙直播助手(iOS)
  public huya_zs_adr: string = "huya_zs_adr"; // 虎牙直播助手(安卓)
  public huya_zs_ios_sdk: string = "huya_zs_ios_sdk"; // 助手开播sdk(iOS)
  public huya_zs_adr_sdk: string = "huya_zs_adr_sdk"; // 助手开播sdk(安卓)

  public platform_web: string = "web"; // 浏览器
  public platform_ios: string = "ios"; // IOS
  public platform_adr: string = "adr"; // 安卓
  public platform_pc: string = "pc"; // PC客户端

  /** 环境类型 */
  public EnvType = {
    release: "production", // 生产环境，对应线上小程序环境（https://ext.huya.com/）
    test: "test", // 测试环境，对应测试小程序环境（http://ext-webtest.huya.com/）
    dev: "dev", // 本地开发环境
  };

  /** 是否生产环境，对应线上环境创建的小程序（https://ext.huya.com/） */
  public isProductionEnv(): boolean {
    return process.env.HYEXT_BUILD_ENV == this.EnvType.release;
  }

  /** 是否测试环境，对应测试环境创建的小程序（http://ext-webtest.huya.com/） */
  public isTestEnv(): boolean {
    return process.env.HYEXT_BUILD_ENV == this.EnvType.test;
  }

  /** 是否本地开发环境（不区分线上还是测试环境创建） */
  public isDevEnv(): boolean {
    return process.env.HYEXT_BUILD_ENV == this.EnvType.dev;
  }

  /** 是否虎牙直播助手 */
  public async isZs(): Promise<boolean> {
    const hostInfo = await this.getHostInfo();
    if (hostInfo != null) {
      return (
        hostInfo.name === this.huya_zs_ios ||
        hostInfo.name === this.huya_zs_adr ||
        hostInfo.name === this.huya_zs_ios_sdk ||
        hostInfo.name === this.huya_zs_adr_sdk
      );
    } else {
      throw new Error(`${Environment.TAG} _hostInfo is null`);
    }
  }

  /** 是否PC主播端 */
  public async isPcAnchor(): Promise<boolean> {
    const hostInfo = await this.getHostInfo();
    if (hostInfo != null) {
      return hostInfo.name === this.huya_pc_anchor;
    } else {
      throw new Error(`${Environment.TAG} _hostInfo is null`);
    }
  }

  /** 是否kiwi */
  public async isKiwi(): Promise<boolean> {
    const hostInfo = await this.getHostInfo();
    if (hostInfo != null) {
      return (
        hostInfo.name === this.huya_app_ios ||
        hostInfo.name === this.huya_app_adr
      );
    } else {
      throw new Error(`${Environment.TAG} _hostInfo is null`);
    }
  }

  /** 是否PC观众端 */
  public async isPcViewer(): Promise<boolean> {
    const hostInfo = await this.getHostInfo();
    if (hostInfo != null) {
      return hostInfo.name === this.huya_pc_viewer;
    } else {
      throw new Error(`${Environment.TAG} _hostInfo is null`);
    }
  }

  /** 是否虎牙直播WEB主站 */
  public async isHuyaWeb(): Promise<boolean> {
    const hostInfo = await this.getHostInfo();
    if (hostInfo != null) {
      return hostInfo.name === this.huya_web;
    } else {
      throw new Error(`${Environment.TAG} _hostInfo is null`);
    }
  }

  /** 是否Web浏览器 */
  public async isWebPlatform(): Promise<boolean> {
    const hostInfo = await this.getHostInfo();
    if (hostInfo != null) {
      return hostInfo.platform === this.platform_web;
    } else {
      throw new Error(`${Environment.TAG} _hostInfo is null`);
    }
  }

  /** 是否iOS系统 */
  public async isIOSPlatform(): Promise<boolean> {
    const hostInfo = await this.getHostInfo();
    if (hostInfo != null) {
      return hostInfo.platform === this.platform_ios;
    } else {
      throw new Error(`${Environment.TAG} _hostInfo is null`);
    }
  }

  /** 是否Android系统 */
  public async isAndroidPlatform(): Promise<boolean> {
    const hostInfo = await this.getHostInfo();
    if (hostInfo != null) {
      return hostInfo.platform === this.platform_adr;
    } else {
      throw new Error(`${Environment.TAG} _hostInfo is null`);
    }
  }

  /** 是否PC客户端 */
  public async isPcPlatform(): Promise<boolean> {
    const hostInfo = await this.getHostInfo();
    if (hostInfo != null) {
      return hostInfo.platform === this.platform_pc;
    } else {
      throw new Error(`${Environment.TAG} _hostInfo is null`);
    }
  }

  /**
   * 获取宿主版本号
   * @returns 宿主版本号，如5.9.20
   */
  public async getHostVersion(): Promise<string> {
    const tid = await this.getTidInfo();
    if (tid != null) {
      LogInfo(Environment.TAG, `getHostVersion tid:${JSON.stringify(tid)}`);
      return tid.sHuYaUA.split("&")[1];
    } else {
      throw new Error(`${Environment.TAG} _tidInfo is null`);
    }
  }

  /**
   * 判断宿主版本号
   * @param versionRange Range pattern for version
   * @returns `true` if the version number is within the range, `false` otherwise.
   *
   * @example
   * ```
   * // 假设当前宿主版本号是5.9.20
   * compareHostVersion('=5.9.20'); // return true
   * compareHostVersion('<5.9.21'); // return true
   * compareHostVersion('>5.9.20'); // return false
   * compareHostVersion('>=5.9.20'); // return true
   * ```
   */
  public async compareHostVersion(versionRange: string): Promise<boolean> {
    return satisfies(await this.getHostVersion(), versionRange);
  }

  /** 获取小程序信息 http://testhd.huya.info/hyext-sdk-internal-docs/#/./hyExt.env.getExtInfo */
  public async getExtInfo(): Promise<hyExt.GetExtInfoRsp | null> {
    if (!this._extInfo) {
      this._extInfo = await hyExt.env.getExtInfo();
      LogInfo(Environment.TAG,
        `getExtInfo _extInfo:${JSON.stringify(
          this._extInfo
        )}`
      );
    }
    return this._extInfo;
  }

  /** 获取初始化参数 http://testhd.huya.info/hyext-sdk-internal-docs/#/./hyExt.env.getInitialParam */
  public async getInitParams(): Promise<object | null> {
    if (!this._params) {
      this._params = await hyExt.env.getInitialParam();
      // 循环引用，Logger 在初始化时会调这个 getInitParams 方法
      // LogInfo(Environment.TAG,
      //   `getInitParams _params:${JSON.stringify(
      //     this._params
      //   )}`
      // );
    }
    return this._params;
  }

  /** 获取宿主信息 http://testhd.huya.info/hyext-sdk-internal-docs/#/./hyExt.env.getHostInfo */
  public async getHostInfo(): Promise<hyExt.GetHostInfoRsp | null> {
    if (!this._hostInfo) {
      return new Promise<hyExt.GetHostInfoRsp | null>((resolve, rejcet) => {
        hyExt.env
          .getHostInfo()
          .then((res) => {
            if (res != null) {
              this._hostInfo = res;
              LogInfo(Environment.TAG,
                `getHostInfo _hostInfo:${JSON.stringify(
                  this._hostInfo
                )}`
              );
              resolve(this._hostInfo);
            } else {
              LogError(Environment.TAG, 'getHostInfo _hostInfo: return null');
              // rejcet(`${Environment.TAG} getTid return null`);
              // 调用者没有处理reject会导致运行中断，所以这里都用resolve
              resolve(null);
            }
          })
          .catch((err) => {
            LogError(Environment.TAG, 'getHostInfo err:', err);
            // rejcet(err);
            // 调用者没有处理reject会导致运行中断，所以这里都用resolve
            resolve(null);
          });
      });
    }
    return this._hostInfo;
  }

  /** 当前登陆用户相关信息 http://testhd.huya.info/hyext-sdk-internal-docs/#/./hyExt.advance.getCurrentUserInfo
   * 如果用户未登录，则为null，业务自行处理
   */
  public async getCurrentUserInfo(): Promise<hyExt.MainUserInfo | null> {
    if (!this._userInfo) {
      return new Promise<hyExt.MainUserInfo | null>((resolve, rejcet) => {
        hyExt.advance
          .getCurrentUserInfo()
          .then((res) => {
            if (res != null) {
              this._userInfo = res;
              LogInfo(Environment.TAG,
                `getCurrentUserInfo _userInfo:${JSON.stringify(
                  this._userInfo
                )}`
              );
              resolve(this._userInfo);
            } else {
              LogError(Environment.TAG, 'getCurrentUserInfo _userInfo: return null');
              // rejcet(`${Environment.TAG} getTid return null`); 
              // 调用者没有处理reject会导致运行中断，所以这里都用resolve
              resolve(null);
            }
          })
          .catch((err) => {
            LogError(Environment.TAG, 'getCurrentUserInfo err:', err);
            // rejcet(err); 
            // 调用者没有处理reject会导致运行中断，所以这里都用resolve
            resolve(null);
          });
      });
    }
    return this._userInfo;
  }

  /**
   * 获取凭证信息
   * @returns {hyExt.TidResp} 用户凭证，没登录也会返回
   */
  public async getTidInfo(): Promise<hyExt.TidInfo | null> {
    if (this._tidInfo == null) {
      return new Promise<hyExt.TidInfo | null>((resolve, rejcet) => {
        hyExt.advance
          .getTid()
          .then((res) => {
            if (res != null && res.tId != null) {
              this._tidInfo = res.tId;
              LogInfo(Environment.TAG,
                `getTidInfo _tidInfo:${JSON.stringify(
                  this._tidInfo
                )}`
              );
              resolve(this._tidInfo);
            } else {
              LogError(Environment.TAG, 'getTidInfo _tidInfo: return null');
              // rejcet(`${Environment.TAG} getTid return null`);
              // 调用者没有处理reject会导致运行中断，所以这里都用resolve
              resolve(null);
            }
          })
          .catch((err) => {
            LogError(Environment.TAG, 'getTidInfo err:', err);
            // rejcet(err);
            // 调用者没有处理reject会导致运行中断，所以这里都用resolve
            resolve(null);
          });
      });
    }
    return this._tidInfo;
  }

  /**
   * 获取用户上下文信息,里面包含用户的 unionId
   * @returns 用户上下文信息
   * 会弹出授权弹框，如果用户拒绝则会reject，请业务自行处理。
   */
  public async getCtxUserInfo(): Promise<hyExt.UserInfo | null> {
    if (isUndef(this._ctxUserInfo)) {
      return new Promise<hyExt.UserInfo | null>((resolve, reject) => {
        hyExt.context.getUserInfo().then(ctxUser => {
          if (isDef(ctxUser)) {
            this._ctxUserInfo = ctxUser;
            LogInfo(Environment.TAG,
              `getCtxUserInfo() _ctxUserInfo:${JSON.stringify(
                this._ctxUserInfo
              )}`
            );
            resolve(this._ctxUserInfo);
          } else {
            LogError(Environment.TAG, 'getCtxUserInfo _ctxUserInfo: return null');
            // reject("getCtxUserInfo return null ");
            // 调用者没有处理reject会导致运行中断，所以这里都用resolve
            resolve(null);
          }
        }).catch(err => {
          LogError(Environment.TAG, 'getCtxUserInfo err:', err);
          // reject(err);
          // 调用者没有处理reject会导致运行中断，所以这里都用resolve
          resolve(null);
        });
      });
    } else {
      return Promise.resolve(this._ctxUserInfo);
    }
  }

  /**
   * 获取渠道信息
   * @returns {hyExt.RespChannelInfo} 频道信息
   */
  public async getChannelInfo(): Promise<hyExt.RespChannelInfo | null> {
    if (this._channelInfo == null) {
      return new Promise<hyExt.RespChannelInfo | null>((resolve, reject) => {
        hyExt.advance.currentChannelInfo().then(res => {
          if (res != null) {
            this._channelInfo = res;
            LogInfo(Environment.TAG,
              `getChannelInfo _channelInfo:${JSON.stringify(
                this._channelInfo
              )}`
            );
            resolve(this._channelInfo);
          } else {
            LogError(Environment.TAG, 'currentChannelInfo _channelInfo: return null');
            // reject(`${Environment.TAG} currentChannelInfo return null`);
            // 调用者没有处理reject会导致运行中断，所以这里都用resolve
            resolve(null);
          }
        }).catch(err => {
          LogError(Environment.TAG, 'getChannelInfo err:', err);
          // reject(err);
          // 调用者没有处理reject会导致运行中断，所以这里都用resolve
          resolve(null);
        })
      });
    }
    return this._channelInfo;
  }

  /** 获取环境相关信息（实际上是信息的聚合） */
  public async getEnvInfo() {
    try {
      const initParams = await this.getInitParams();
      //@ts-ignore
      const { isFullScreen = false, trace } = initParams || {};
      let activatedType = 0;
      if (initParams) {
        //@ts-ignore
        activatedType = initParams["activatedType"] ?? 0;
      }

      const { extName, extUuid, extVersion, extVersionType, extType } =
        (await this.getExtInfo()) || {};
      const { name, version, platform, baseVersion } =
        (await this.getHostInfo()) || {};
      const { uid } = (await this.getCurrentUserInfo()) || {};
      return {
        isFullScreen,
        trace,
        extName,
        platform: platform,
        platformName: name,
        platformVersion: version,
        baseVersion: baseVersion,
        extUuid: extUuid,
        extVersion: extVersion,
        extVersionType: extVersionType,
        uid: uid,
        extType: extType,
        activatedType: Number(activatedType),
      };
    } catch (err) {
      return {
        isFullScreen: false,
        extName: "demo",
        platformName: "",
        platformVersion: "",
        platform: "",
        extVersion: "",
        extUuid: "",
        extVersionType: 3,
        uid: 0,
        baseVersion: "",
      };
    }
  }
}

export default new Environment();
