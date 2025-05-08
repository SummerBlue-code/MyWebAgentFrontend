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
                 class="recent-chat-item"
                 @click="selectChat(chat.id)">
              <i class="fas fa-comment"></i>
              <span>{{ chat.title }}</span>
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
import { useHistoryStore } from '../../stores/history';

const historyStore = useHistoryStore();

const props = defineProps({
  isNewChatEnabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['undo-chat', 'select-chat']);

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
  width: 250px;
  background: var(--color-background);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
  transform-origin: top left;
  border: 1px solid var(--color-border);
}

.panel-transition-area {
  position: absolute;
  top: -10px;
  left: 0;
  width: 100%;
  height: 10px;
  background: transparent;
}

.panel-content {
  padding: 8px;
  position: relative;
  z-index: 1;
}

.panel-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  cursor: pointer;
  border-radius: 6px;
  transition: background-color 0.2s ease;
  color: var(--color-text-primary);
}

.panel-button:hover {
  background: var(--color-background-soft);
}

.panel-button i:last-child {
  margin-left: auto;
  font-size: 0.9em;
  color: var(--color-text-tertiary);
}

.recent-chats-list {
  margin-left: 16px;
  border-left: 2px solid var(--color-border);
  padding-left: 8px;
}

.recent-chat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  cursor: pointer;
  border-radius: 6px;
  transition: background-color 0.2s ease;
  color: var(--color-text-secondary);
}

.recent-chat-item:hover {
  background: var(--color-background-soft);
}

.recent-chat-item i {
  color: var(--color-text-tertiary);
}

.arrow-icon {
  margin-left: auto;
  width: var(--icon-size-xlarge);
  height: var(--icon-size-xlarge);
  transition: transform 0.3s ease;
  fill: var(--color-text-tertiary);
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
  width: var(--icon-size-medium);
  height: var(--icon-size-medium);
  fill: currentColor;
}
</style> 