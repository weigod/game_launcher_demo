import { LogInfo } from "./Log"
import { AsyncStorage } from 'react-native'

export const  localLaunchStoreKey = "localLaunchConfig";
export async function storeData(key, value) {
    try {
        await AsyncStorage.setItem(key, value)
        LogInfo("store key=" + key + ",value=" + value)
    } catch (e) {
        LogInfo("store key=" + key + ",error=" + e)
    }
};

export async function getData (key) {
    try {
        const value = await AsyncStorage.getItem(key)
        LogInfo("getData key=" + key + ",value=" + value)
        return value;
    } catch (e) {
        LogInfo("getData key=" + key + ",error=" + e)
        return;
    }
}