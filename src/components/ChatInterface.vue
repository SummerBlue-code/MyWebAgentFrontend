<template>
  <div class="chat-interface">
    <!-- 背景 -->
    <div class="background" :style="{ filter: `blur(${settingsStore.blurIntensity}px)` }"></div>

    <!-- 遮罩层 -->
    <div class="overlay" :class="{ active: settingsStore.isSettingsPanelActive }" @click="closePanel"></div>

    <!-- 设置面板 -->
    <SettingsPanel 
      :is-active="settingsStore.isSettingsPanelActive"
      @close="closePanel"
      @server-added="handleServerAdded"
    />

    <!-- 搜索栏 -->
    <SearchBar 
      :is-chat-active="chatStore.isChatActive"
      :execute-selected-tools="executeSelectedTools"
      @search="handleSearch"
      @blur="blurBackground"
      @unblur="unblurBackground"
    />

    <!-- 历史聊天记录面板 -->
    <ChatHistory 
      :position="historyPanelPosition"
      :chat-history-list="chatStore.chatHistoryList"
      :is-fixed="isHistoryPanelFixed"
      :is-new-chat-enabled="chatStore.isNewChatEnabled"
      @panel-leave="handleHistoryPanelLeave"
      @undo-chat="undoChat"
      @toggle-mode="changeHistoryPanelMode"
      @select-chat="selectChat"
    />

    <!-- 设置按钮 -->
    <button id="settings-button" @click="openSettingsPanel">
      <IconSetting class="settings-icon" />
      <span>设置</span>
    </button>

    <!-- Toast消息 -->
    <ToastMessage
      v-if="toastStore.show"
      :message="toastStore.text"
      :type="toastStore.type"
      :duration="3000"
      @close="toastStore.hideToast"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import SettingsPanel from './settings/SettingsPanel.vue';
import SearchBar from './chat/SearchBar.vue';
import ChatHistory from './history/ChatHistory.vue';
import ChatMessage from './chat/ChatMessage.vue';
import IconSetting from './icons/IconSetting.vue';
import ToastMessage from './ToastMessage.vue';

import { useChatStore } from '../stores/chat';
import { useSettingsStore } from '../stores/settings';
import { useToastStore } from '../stores/toast';
import { useWebSocketStore } from '../stores/websocket';

const chatStore = useChatStore();
const settingsStore = useSettingsStore();
const toastStore = useToastStore();
const websocketStore = useWebSocketStore();

const historyPanelPosition = ref(-100);
const isHistoryPanelFixed = ref(false);
const socket = ref(null);
const isLoading = ref(false);

// 错误处理函数
const handleError = (message, type = 'error') => {
  toastStore.showToast(message, type);
  isLoading.value = false;
};

// 检查 WebSocket 连接
const checkWebSocketConnection = () => {
  if (!websocketStore.isConnected) {
    handleError('WebSocket 连接未建立');
    return false;
  }
  return true;
};

// 方法
const blurBackground = () => {
  settingsStore.blurBackground();
};

const unblurBackground = () => {
  settingsStore.unblurBackground();
};

const openSettingsPanel = () => {
  settingsStore.toggleSettingsPanel();
};

const closePanel = () => {
  settingsStore.isSettingsPanelActive = false;
};

const handleServerAdded = (server) => {
  settingsStore.addServer(server);
};

const addChat = (chatName) => {
  chatStore.addChatHistory({
    title: chatName
  });
};

const initChatPanel = () => {
  chatStore.setChatActive(true);
  if (chatStore.isChatActive) {
    translateHistoryPanel(0);
    fixedHistoryPanel();
  }
};

const undoChat = () => {
  chatStore.undoChat();
  if (chatStore.isChatActive) {
    translateHistoryPanel(0);
    unfixedHistoryPanel();
  }
};

const fixedHistoryPanel = () => {
  isHistoryPanelFixed.value = true;
};

const unfixedHistoryPanel = () => {
  isHistoryPanelFixed.value = false;
};

const changeHistoryPanelMode = () => {
  if (isHistoryPanelFixed.value) {
    unfixedHistoryPanel();
  } else {
    fixedHistoryPanel();
  }
};

const translateHistoryPanel = (percent) => {
  historyPanelPosition.value = percent;
};

const handleHistoryPanelLeave = () => {
  if (!isHistoryPanelFixed.value) {
    translateHistoryPanel(-100);
  }
};

const handleSearch = (question) => {
  if (!question.trim()) {
    toastStore.showToast('请输入搜索内容', 'error');
    return;
  }

  if (!chatStore.isChatActive) {
    addChat(question);
  }
  chatStore.setNewChatEnabled(true);
  initChatPanel();
  requestQuestion(question);
};

const selectChat = (index) => {
  chatStore.setCurrentChatIndex(index);
  chatStore.setChatActive(true);
  initChatPanel();
};

const requestQuestion = async (question) => {
  if (!checkWebSocketConnection()) return;

  isLoading.value = true;

  try {
    // 添加用户消息到聊天历史
    chatStore.addChatUserMessage({
      role: 'user',
      content: question
    });

    // 通过 WebSocket 发送问题
    websocketStore.sendMessage({
      type: 'user_question',
      question: question,
      mcp_servers: settingsStore.serverList
    });
  } catch (err) {
    handleError(err.message);
  }
};

// WebSocket 消息处理
const handleWebSocketMessage = (data) => {
  console.log(data);
  if(data.type === 'heartbeat') {
    // 发送心跳响应
    const heartbeatAck = {
      type: 'heartbeat_ack',
      data: {
        status: 'ok',
        timestamp: Date.now()
      }
    };
    websocketStore.sendMessage(heartbeatAck);
  }else if (data.type === 'server_answer' && data.answer !== "") {
    chatStore.addChatAssistantMessage({
      role: 'assistant',
      content: data.answer
    });
    isLoading.value = false;
  } else if (data.type === 'server_select_function') {
    // 如果服务器返回'server_select_function'则在chatStore添加AssistantTool调用消息
    chatStore.addChatAssistantToolMessage({
      role: 'assistant_tool',
      content: '请选择要执行的工具：',
      select_functions: data.select_functions
    });
  }else if (data.type === 'error') {
    handleError(data.message);
  }
};

const executeSelectedTools = (selectedTools) => {
  if (!checkWebSocketConnection()) return;

  const message = {
    type: 'execute_tools',
    select_functions: selectedTools,
    mcp_servers: settingsStore.serverList,
    question: chatStore.getCurrentQuestion()
  };
  
  console.log(message);
  websocketStore.sendMessage(message);
};

// 初始化 WebSocket 连接
onMounted(() => {
  const wsUrl = 'ws://localhost:8765';
  websocketStore.connect(wsUrl);
  websocketStore.setMessageHandler(handleWebSocketMessage);
});

// 清理 WebSocket 连接
onUnmounted(() => {
  websocketStore.disconnect();
});
</script>

<style scoped>
.chat-interface {
  position: relative;
  height: 100vh;
  width: 100vw;
}

.background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url('../assets/background-image.jpg') center/cover no-repeat;
  transition: filter 0.3s ease;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
  z-index: 100;
}

.overlay.active {
  opacity: 1;
  pointer-events: auto;
}

#settings-button {
  display: flex;
  align-items: center;
  gap: 8px;
  position: fixed;
  padding: 8px 16px;
  background: var(--theme-primary-light);
  color: var(--theme-text-primary);
  border-radius: 8px;
  cursor: pointer;
  z-index: 200;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow:
      0 4px 8px rgba(0, 0, 0, 0.2),
      0 2px 4px rgba(0, 0, 0, 0.15),
      inset 0 1px 1px rgba(255, 255, 255, 0.3);
  border: 1px solid var(--color-border-hover);
  font-size: var(--font-size-small);
}

#settings-button {
  right: 20px;
  top: 20px;
}

#settings-button:hover {
  background: var(--color-background-soft);
  transform: translateY(-3px);
  box-shadow:
      0 8px 16px rgba(0, 0, 0, 0.25),
      0 4px 8px rgba(0, 0, 0, 0.2),
      inset 0 1px 1px rgba(255, 255, 255, 0.4);
  border-color: var(--color-border-hover);
}

#settings-button:active {
  transform: translateY(1px);
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.15),
    0 1px 2px rgba(0, 0, 0, 0.1),
    inset 0 1px 1px rgba(0, 0, 0, 0.2);
}

.settings-icon {
  width: var(--icon-size-medium);
  height: var(--icon-size-medium);
  fill: currentColor;
}
</style> 