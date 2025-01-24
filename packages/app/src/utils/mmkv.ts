import { Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { StateStorage } from 'zustand/middleware'

let storage: StateStorage

if (Platform.OS === 'web') {
  storage = {
    getItem: async (key) => {
      return AsyncStorage.getItem(key)
    },
    setItem: async (key, value) => {
      await AsyncStorage.setItem(key, value)
    },
    removeItem: async (key) => {
      await AsyncStorage.removeItem(key)
    }
  }
} else {
  const { MMKV } = require('react-native-mmkv')
  const mmkvInstance = new MMKV()
  
  storage = {
    getItem: async (key) => {
      return mmkvInstance.getString(key) || null
    },
    setItem: async (key, value) => {
      mmkvInstance.set(key, value)
    },
    removeItem: async (key) => {
      mmkvInstance.delete(key)
    }
  }
}

export const mmkv = storage 