export default {
  _tid: null,
  _pid: null,
  _channel: null,
  _roomId: null,
  _jwt: null,
  _streamerInfo: null,

  /**
   * 获取凭证信息
   */
  async getTid() {
    if (!this._tid) {
      const tidInfo = await hyExt.advance.getTid();
      const { tId, tid } = tidInfo || {}; // 凭证信息
      this._tid = tId || tid;
    }
    return this._tid || {};
  },

  async getUid() {
    if (!this._tid) {
      const tidInfo = await hyExt.advance.getTid();
      const { tId, tid } = tidInfo || {}; // 凭证信息
      this._tid = tId || tid;
    }
    return this._tid.lUid;
  },

  /**
   * 获取渠道信息
   */
  async getChannelInfo() {
    if (!this._channel) {
      const resp = await hyExt.advance.currentChannelInfo();
      // const { currentChannelInfo } = resp || {}; // 渠道信息
      this._channel = resp;
      this._pid = resp.presenterId;
    }
    return this._channel || {};
  },

  /**
   * 获取渠道信息
   */
  async getPid() {
    if (!this._pid) {
      const resp = await hyExt.advance.currentChannelInfo();
      // const { currentChannelInfo } = resp || {}; // 渠道信息
      this._channel = resp;
      this._pid = resp.presenterId;
    }
    return this._pid || {};
  },

  async getRoomId(){
    if (!this._roomId) {
      const resp = await hyExt.context.getStreamerInfo();
      // const { currentChannelInfo } = resp || {}; // 渠道信息
      this._streamerInfo = resp;
      const { streamerNick, streamerAvatarUrl, streamerSex, streamerRoomId, streamerLevel, streamerUnionId } = resp;
      this._roomId = streamerRoomId;
    }
    return this._roomId;
  },

  async getJWT() {

  },

  async getGameId() {
    const resp = await hyExt.advance.currentChannelInfo();
    const { presenterId: pid, gameId } = resp;
    return Number(gameId);
  },

  async isLiving() {
    var liveInfo = await hyExt.context.getLiveInfo();
    const { gameName, liveCount, roomTitle, startTime, isOn } = liveInfo
    return isOn == 'true';
  },

  async getExtVersionType() {
    var extInfo = await hyExt.env.getExtInfo();
    const { extUuid, extName, extVersion, extVersionType, extType } = extInfo
    return Number(extVersionType);
  },

  async getExtUuid() {
    var extInfo = await hyExt.env.getExtInfo();
    const { extUuid, extName, extVersion, extVersionType, extType } = extInfo
    return extUuid;
  },

  async getHostVersion(){
    var extInfo = await hyExt.env.getHostInfo();
    const { name, platform, version, baseVersion } = extInfo
    return version;
  },
  async getHuyaUA(){
    const tId = await this.getTid();
    return tId.sHuYaUA;
  }
}