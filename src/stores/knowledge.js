import { defineStore } from 'pinia'

export const useKnowledgeStore = defineStore('knowledge', {
  state: () => ({
    isKnowledgePanelActive: false,
    databaseList: [],
    currentDatabase: null,
    currentFiles: []
  }),
  
  actions: {
    toggleKnowledgePanel() {
      this.isKnowledgePanelActive = !this.isKnowledgePanelActive
    },
    
    addDatabase(database) {
      this.databaseList.push(database)
    },
    
    removeDatabase(databaseName) {
      this.databaseList = this.databaseList.filter(db => db.name !== databaseName)
      if (this.currentDatabase === databaseName) {
        this.currentDatabase = null
        this.currentFiles = []
      }
    },
    
    setCurrentDatabase(databaseName) {
      this.currentDatabase = databaseName
    },
    
    setCurrentFiles(files) {
      this.currentFiles = files
    },
    
    addFile(file) {
      this.currentFiles.push(file)
    },
    
    removeFile(fileName) {
      this.currentFiles = this.currentFiles.filter(file => file.name !== fileName)
    },
    
    clearKnowledge() {
      this.databaseList = []
      this.currentDatabase = null
      this.currentFiles = []
    }
  }
}) 