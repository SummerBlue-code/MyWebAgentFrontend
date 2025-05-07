<template>
  <div class="search-container" :class="{ 'chat-active': props.isChatActive }">
    <div class="chat-container" v-show="props.isChatActive" ref="chatContainer">
      <div v-for="(message, index) in chatStore.chatMessages" :key="index" class="message-container">
        <ChatMessage 
          :text="message.content" 
          :type="message.role" 
          :select_functions="message.select_functions"
          :execute-selected-tools="props.executeSelectedTools"
        />
      </div>
    </div>
    <div class="input-group">
      <textarea 
        v-model="searchInput" 
        placeholder="输入您的问题..." 
        @focus="blurBackground" 
        @blur="unblurBackground"
        @keydown.enter.prevent="searchQuestion"
        rows="3"
      ></textarea>
      <div class="button-group">
        <div class="left-buttons">
          <button class="icon-button" title="上传文件">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/>
            </svg>
          </button>
          <button class="deep-search-button">
            <svg viewBox="0 0 24 24" width="16" height="16" style="margin-right: 4px">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" fill="currentColor"/>
            </svg>
            深度搜索
          </button>
        </div>
        <button class="icon-button search-button" @click="searchQuestion" title="搜索">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="currentColor"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import ChatMessage from './ChatMessage.vue';
import { useChatStore } from '../../stores/chat';
import { useSettingsStore } from '../../stores/settings';

const chatStore = useChatStore();
const settingsStore = useSettingsStore();

const props = defineProps({
  isChatActive: {
    type: Boolean,
    default: false
  },
  executeSelectedTools: {
    type: Function,
    required: true
  }
});

const emit = defineEmits(['search', 'blur', 'unblur']);

const searchInput = ref('');
const chatContainer = ref(null);

const blurBackground = () => {
  settingsStore.blurBackground();
  emit('blur');
};

const unblurBackground = () => {
  settingsStore.unblurBackground();
  emit('unblur');
};

const searchQuestion = () => {
  if (searchInput.value.trim()) {    
    emit('search', searchInput.value.trim());
    searchInput.value = '';
    
    setTimeout(() => {
      if (chatContainer.value) {
        chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
      }
    }, 100);
  }
};
</script>

<style scoped>
.search-container {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 1000px;
  z-index: 50;
}

.chat-container {
  height: 70vh;
  overflow-y: auto;
  background: var(--color-background);
  border-radius: 8px;
  margin-bottom: 20px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--color-border);
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0;
  background: var(--color-background-soft);
  border-radius: 12px;
  border: 1px solid var(--color-border);
  overflow: hidden;
}

textarea {
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 0;
  font-size: 16px;
  background: transparent;
  color: var(--color-text-primary);
  transition: all 0.3s ease;
  resize: none;
  min-height: 60px;
  max-height: 200px;
}

textarea:focus {
  outline: none;
  box-shadow: none;
}

textarea::placeholder {
  color: var(--color-text-tertiary);
}

.button-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background: var(--color-background-soft);
  border-top: 1px solid var(--color-border);
}

.left-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
}

.icon-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  background: transparent;
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 
    0 1px 2px rgba(0, 0, 0, 0.05),
    0 1px 1px rgba(0, 0, 0, 0.1);
}

.icon-button:hover {
  background: var(--color-background);
}

.deep-search-button {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: transparent;
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  box-shadow: 
    0 1px 2px rgba(0, 0, 0, 0.05),
    0 1px 1px rgba(0, 0, 0, 0.1);
}

.deep-search-button:hover {
  background: var(--color-background);
}

.search-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  background: var(--btn-primary);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.1),
    0 2px 2px rgba(0, 0, 0, 0.15);
}

.search-button:hover {
  background: var(--btn-primary-hover);
  transform: scale(1.05);
  box-shadow: 
    0 3px 6px rgba(0, 0, 0, 0.15),
    0 3px 3px rgba(0, 0, 0, 0.2);
}

.search-button:active {
  background: var(--btn-primary-active);
  transform: scale(0.95);
  box-shadow: 
    0 1px 2px rgba(0, 0, 0, 0.1),
    0 1px 1px rgba(0, 0, 0, 0.15);
}

.message-container {
  margin-bottom: 20px;
}
</style> 