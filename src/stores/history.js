import { defineStore } from 'pinia';

export const useHistoryStore = defineStore('history', {
  state: () => ({
    historyList: [], // 存储历史记录列表
    currentHistoryId: null, // 当前选中的历史记录ID
  }),

  getters: {
    // 获取所有历史记录
    getAllHistory: (state) => state.historyList,
    
    // 获取当前选中的历史记录
    getCurrentHistory: (state) => {
      return state.historyList.find(history => history.id === state.currentHistoryId);
    },
  },

  actions: {
    // 初始化历史记录
    initHistory(historyData) {
      this.historyList = historyData.map(item => ({
        id: item.conversation_id,
        title: item.title,
      }));
    },

    // 添加新的历史记录
    addHistory(history) {
      this.historyList.unshift({
        id: history.conversation_id,
        title: history.title,
      });
    },

    // 设置当前历史记录
    setCurrentHistory(historyId) {
      this.currentHistoryId = historyId;
    },

    updateAppendHistory(historyId, title) {
      const index = this.historyList.findIndex(history => history.id === historyId);
      if (index !== -1) {
        this.historyList[index].title += title;
      }
    },

    // 清空所有历史记录
    clearHistory() {
      this.historyList = [];
      this.currentHistoryId = null;
    }
  }
}); 