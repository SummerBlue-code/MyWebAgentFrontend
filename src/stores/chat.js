import { defineStore } from 'pinia'

export const useChatStore = defineStore('chat', {
  state: () => ({
    isChatActive: false,
    isNewChatEnabled: false,
    chatMessages: [],
    currentChatIndex: -1
  }),
  
  actions: {
    setChatActive(isActive) {
      this.isChatActive = isActive
    },
    
    setNewChatEnabled(isEnabled) {
      this.isNewChatEnabled = isEnabled
    },
    
    addChatUserMessage(message) {
      this.chatMessages.push(message)
    },
    
    initChatMessages(messages) {
      this.chatMessages = messages
    },

    addChatAssistantMessage(message) {
      if(this.chatMessages[this.chatMessages.length - 1].role === 'user') {
        this.chatMessages.push(message)
      }else if(this.chatMessages[this.chatMessages.length - 1].role === 'assistant_tool'){
        this.chatMessages.pop()
        this.chatMessages.push(message)
      }else if(this.chatMessages[this.chatMessages.length - 1].role === 'assistant'){
        this.chatMessages[this.chatMessages.length - 1].content += message.content
      }
    },

    clearChatMessages() {
      this.chatMessages = []
    },
    
    setCurrentChatIndex(index) {
      this.currentChatIndex = index
    },
    
    undoChat() {
      this.isChatActive = false
      this.isNewChatEnabled = false
      this.clearChatMessages()
    },
    
    addChatAssistantToolMessage(message) {
      this.chatMessages.push(message);
    },

    getCurrentQuestion() {
      for(let i = this.chatMessages.length - 1; i >= 0; i--) {
        if(this.chatMessages[i].role === 'user') {
          return this.chatMessages[i].content
        }
      }
      return ''
    }
  }
}) 