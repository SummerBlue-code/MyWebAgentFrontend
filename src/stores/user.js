import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    isLoggedIn: false,
    userInfo: null,
  }),

  actions: {
    setLoggedIn(status) {
      this.isLoggedIn = status
    },

    setUserInfo(info) {
      this.userInfo = info
    },

    logout() {
      this.isLoggedIn = false
      this.qrCodeExpired = false
    }
  }
}) 