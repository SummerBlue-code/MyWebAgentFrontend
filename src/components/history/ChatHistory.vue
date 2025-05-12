<template>
  <div class="history-controls">
    <!-- 历史记录按钮 -->
    <div class="history-button" 
         @mouseenter="showHistoryPanel" 
         @mouseleave="hideHistoryPanel">
      <IconPanel class="history-icon" />
    </div>
    
    <!-- 新对话按钮 -->
    <div class="new-chat-button" 
         :class="{ 'disabled': !isNewChatEnabled }" 
         @click="undoChat">
      <IconAdd class="history-icon" />
      <span>新对话</span>
    </div>

    <!-- 历史记录面板 -->
    <div class="history-panel" 
         v-show="isPanelVisible" 
         @mouseenter="showHistoryPanel" 
         @mouseleave="hideHistoryPanel">
      <!-- 添加过渡区域 -->
      <div class="panel-transition-area"></div>
      <div class="panel-content">
        <!-- 新对话按钮 -->
        <div class="panel-button" @click="undoChat">
          <IconAdd class="panel-icon" />
          <span>新对话</span>
        </div>

        <!-- 最近对话按钮组 -->
        <div class="recent-chats">
          <div class="panel-button" @click="toggleRecentChats">
            <IconChatHistory class="panel-icon" />
            <span>最近对话</span>
            <IconDownArrow class="arrow-icon" :class="{ 'rotated': showRecentChats }" />
          </div>
          
          <!-- 最近对话列表 -->
          <div class="recent-chats-list" v-show="showRecentChats">
            <div v-for="chat in historyStore.getAllHistory" 
                 :key="chat.id" 
                 class="recent-chat-item">
              <div class="chat-item-content" @click="selectChat(chat.id)">
                <span>{{ chat.title }}</span>
              </div>
              <div class="delete-button-wrapper">
                <button class="delete-button" @click.stop="deleteChat(chat.id)">
                  <IconDelete class="delete-icon" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import IconPanel from '../icons/IconPanel.vue';
import IconAdd from '../icons/IconAdd.vue';
import IconDownArrow from '../icons/IconDownArrow.vue';
import IconChatHistory from '../icons/IconChatHistory.vue';
import IconDelete from '../icons/IconDelete.vue';
import { useHistoryStore } from '../../stores/history';

const historyStore = useHistoryStore();

const props = defineProps({
  isNewChatEnabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['undo-chat', 'select-chat', 'delete-chat']);

const isPanelVisible = ref(false);
const showRecentChats = ref(false);

const showHistoryPanel = () => {
  isPanelVisible.value = true;
};

const hideHistoryPanel = () => {
  isPanelVisible.value = false;
  showRecentChats.value = false;
};

const toggleRecentChats = () => {
  showRecentChats.value = !showRecentChats.value;
};

const undoChat = () => {
  emit('undo-chat');
  hideHistoryPanel();
};

const selectChat = (historyId) => {
  historyStore.setCurrentHistory(historyId);
  emit('select-chat', historyId);
  hideHistoryPanel();
};

const deleteChat = (historyId) => {
  emit('delete-chat', historyId);
};
</script>

<style scoped>
.history-controls {
  position: fixed;
  top: 20px;
  left: 20px;
  display: flex;
  gap: 10px;
  z-index: 1000;
}

.history-button,
.new-chat-button {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: 8px;
  background: var(--theme-primary-light);
  color: var(--theme-text-primary);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 4px 8px rgba(0, 0, 0, 0.2),
    0 2px 4px rgba(0, 0, 0, 0.15),
    inset 0 1px 1px rgba(255, 255, 255, 0.3);
  border: 1px solid var(--color-border-hover);
  position: relative;
  font-size: var(--font-size-small);
}

.history-button:hover,
.new-chat-button:hover {
  background: var(--color-background-soft);
  transform: translateY(-3px);
  box-shadow: 
    0 8px 16px rgba(0, 0, 0, 0.25),
    0 4px 8px rgba(0, 0, 0, 0.2),
    inset 0 1px 1px rgba(255, 255, 255, 0.4);
  border-color: var(--color-border-hover);
}

.history-button:active,
.new-chat-button:active {
  transform: translateY(1px);
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.15),
    0 1px 2px rgba(0, 0, 0, 0.1),
    inset 0 1px 1px rgba(0, 0, 0, 0.2);
}

.new-chat-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.new-chat-button.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.history-panel {
  position: absolute;
  top: calc(100% + 5px);
  left: 0;
  width: 260px;
  background: var(--color-background);
  border-radius: 12px;
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.08),
    0 4px 12px rgba(0, 0, 0, 0.04);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: top left;
  border: 1px solid var(--color-border);
  overflow: visible;
}

.panel-transition-area {
  position: absolute;
  top: -15px;
  left: -15px;
  width: calc(100% + 30px);
  height: 15px;
  background: transparent;
  z-index: 1;
}

.panel-content {
  position: relative;
  z-index: 2;
  padding: 12px;
  background: var(--color-background);
  border-radius: 12px;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.05),
    0 2px 4px rgba(0, 0, 0, 0.02);
}

.panel-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: var(--color-text-primary);
  margin-bottom: 4px;
  font-size: 14px;
  font-weight: 500;
  width: 100%;
}

.panel-button:hover {
  background: var(--color-background-soft);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.panel-button i:last-child {
  margin-left: auto;
  font-size: 0.9em;
  color: var(--color-text-tertiary);
}

.recent-chats {
  margin-top: 12px;
}

.recent-chats-list {
  margin: 8px 0 0 0;
  padding: 4px 0;
  border-left: 2px solid var(--color-border);
  padding-left: 12px;
  max-height: 300px;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: var(--color-border) transparent;
}

.recent-chats-list::-webkit-scrollbar {
  width: 4px;
}

.recent-chats-list::-webkit-scrollbar-track {
  background: transparent;
}

.recent-chats-list::-webkit-scrollbar-thumb {
  background-color: var(--color-border);
  border-radius: 4px;
}

.recent-chat-item {
  position: relative;
  padding: 10px 12px;
  margin: 6px 0;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: var(--color-text-secondary);
  background: var(--color-background);
  border: 1px solid var(--color-border);
  width: calc(100% - 4px);
}

.recent-chat-item:hover {
  background: var(--color-background-soft);
  border-color: var(--color-border-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.chat-item-content {
  cursor: pointer;
  font-size: 13px;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-right: 24px;
  color: var(--color-text-secondary);
  transition: color 0.2s ease;
  width: 100%;
}

.chat-item-content:hover {
  color: var(--color-text-primary);
}

.delete-button-wrapper {
  position: absolute;
  top: -6px;
  right: -6px;
  z-index: 3;
}

.delete-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  padding: 0;
  border: none;
  background: var(--color-background);
  color: var(--color-text-tertiary);
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0;
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.1),
    0 1px 2px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--color-border);
}

.recent-chat-item:hover .delete-button {
  opacity: 1;
}

.delete-button:hover {
  background: var(--color-danger);
  color: white;
  transform: scale(1.1) translateY(-1px);
  box-shadow: 
    0 4px 8px rgba(0, 0, 0, 0.15),
    0 2px 4px rgba(0, 0, 0, 0.1);
  border-color: var(--color-danger);
}

.delete-button:active {
  transform: scale(0.95) translateY(0);
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.1),
    0 1px 2px rgba(0, 0, 0, 0.05);
}

.delete-icon {
  width: 12px;
  height: 12px;
  fill: currentColor;
}

.arrow-icon {
  margin-left: auto;
  width: 14px;
  height: 14px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  fill: var(--color-text-tertiary);
  opacity: 0.7;
}

.rotated {
  transform: rotate(180deg);
}

.history-icon {
  width: var(--icon-size-medium);
  height: var(--icon-size-medium);
  fill: currentColor;
}

.panel-icon {
  width: 16px;
  height: 16px;
  fill: currentColor;
  opacity: 0.8;
}

.chat-icon {
  width: var(--icon-size-small);
  height: var(--icon-size-small);
  fill: currentColor;
}

.history-button::after {
  content: '';
  position: absolute;
  bottom: -15px;
  left: -15px;
  width: calc(100% + 30px);
  height: 15px;
  background: transparent;
  z-index: 1;
}
</style> 