import { defineStore } from 'pinia'

export const useWebSocketStore = defineStore('websocket', {
  state: () => ({
    socket: null,
    isConnected: false,
    reconnectAttempts: 0,
    maxReconnectAttempts: 5,
    reconnectDelay: 3000,
    allowReconnect: true
  }),

  actions: {
    connect(url, username, password) {
      if (this.socket) {
        this.disconnect()
      }

      this.allowReconnect = true
      this.socket = new WebSocket(url)

      this.socket.onopen = () => {
        console.log('WebSocket connected')
        this.isConnected = true
        this.reconnectAttempts = 0
        
        // 如果有用户名和密码，则发送登录请求
        if (username && password) {
          this.sendMessage({
            type: 'login',
            username: username,
            password: password
          })
        }
      }

      this.socket.onclose = () => {
        console.log('WebSocket disconnected')
        this.isConnected = false
        if (this.allowReconnect) {
          this.handleReconnect()
        }
      }

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error)
        this.isConnected = false
      }
    },

    disconnect() {
      this.allowReconnect = false
      if (this.socket) {
        this.socket.close()
        this.socket = null
        this.isConnected = false
      }
    },

    handleReconnect() {
      if (this.reconnectAttempts < this.maxReconnectAttempts && this.allowReconnect) {
        this.reconnectAttempts++
        setTimeout(() => {
          if (this.socket && this.socket.url) {
            this.connect(this.socket.url)
          }
        }, this.reconnectDelay)
      }
    },

    sendMessage(message) {
      if (this.isConnected && this.socket) {
        this.socket.send(JSON.stringify(message))
      } else {
        console.error('WebSocket is not connected')
        throw new Error('WebSocket is not connected')
      }
    },

    setMessageHandler(handler) {
      if (this.socket) {
        this.socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            handler(data)
          } catch (error) {
            console.error('Error parsing WebSocket message:', error)
          }
        }
      }
    }
  }
}) 