import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    isSettingsPanelActive: false,
    serverList: [],
    blurIntensity: 0
  }),
  
  actions: {

    toggleSettingsPanel() {
      this.isSettingsPanelActive = !this.isSettingsPanelActive
    },
    
    addServer(server) {
      this.serverList.push(server)
      console.log(this.serverList)
    },
    
    setBlurIntensity(intensity) {
      this.blurIntensity = intensity
    },
    
    blurBackground() {
      this.blurIntensity = 5
    },
    
    unblurBackground() {
      this.blurIntensity = 0
    },
    initServerList(serverList) {
      this.serverList = serverList
    },
    clearServerList() {
      this.serverList = []
    }
  }
}) 