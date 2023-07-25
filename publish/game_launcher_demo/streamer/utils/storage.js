/**
 * 此处存放项目中的kv
 */
import Environment from './environment';
import {LogInfo,LogError} from "../Log";

const TAG = 'storage';

const BaseStorage = {
  async get(key) {
    try {
      return JSON.parse(await hyExt.storage.getItem(key));
    } catch (err) {
      return null
    }
  },
  set(key, value) {
    return hyExt.storage.setItem(key, JSON.stringify(value)).catch(err => {
      LogError('set storage error:', JSON.stringify(err));
    });
  }
}

export const SettingStorage = {
  key: 'SettingStorage',
  get() {
    return BaseStorage.get(this.key).then(res => {
      return res;
    });
  },
  set(value) {
    return BaseStorage.set(this.key, value);
  }
}

export const LocalSettingStorage = {
  async set(key, value, bindUid) {
    let isPC = await Environment.isPcPlatform();
    let { extUuid } = await Environment.getExtInfo();
    let setKey = isPC ? key : key + `_${extUuid}`;
    return hyExt.advance.setLocalItem({ key: setKey, value: value, bindUid: bindUid })
      .then(() => {
        LogInfo(TAG, `hyExt.advance.setLocalItem, key:${setKey} successe, param:${value}`);
      })
      .catch((err) => {
        LogError(TAG, `hyExt.advance.setLocalItem error, key:${setKey} param:${value}, error:${err}`);
      });
  },
  async get(key, bindUid) {
    let isPC = await Environment.isPcPlatform();
    let { extUuid } = await Environment.getExtInfo();
    let setKey = isPC ? key : key + `_${extUuid}`;

    return hyExt.advance.getLocalItem({ key: setKey, bindUid: bindUid }).then((res) => {
      LogInfo(TAG, `hyExt.advance.getLocalItem successe, key:${setKey} param:${JSON.stringify(res)}`);
      return res.value;
    })
      .catch((err) => {
        LogInfo(TAG, `hyExt.advance.getLocalItem key:${setKey} error:${err}`);
        return null
      })
  }
}
