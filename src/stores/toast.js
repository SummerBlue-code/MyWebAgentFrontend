import { defineStore } from 'pinia'

export const useToastStore = defineStore('toast', {
  state: () => ({
    show: false,
    text: '',
    type: 'error'
  }),
  
  actions: {
    showToast(text, type = 'error') {
      this.text = text
      this.type = type
      this.show = true
      
      // 3秒后自动关闭
      setTimeout(() => {
        this.hideToast()
      }, 3000)
    },
    
    hideToast() {
      this.show = false
    }
  }
}) 