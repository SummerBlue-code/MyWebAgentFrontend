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
      :chat-history-list="historyStore.historyList"
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

    <!-- 用户登录按钮 -->
    <UserLogin 
      @login="handleLogin"
      @logout="handleLogout"
    />

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
import UserLogin from './user/UserLogin.vue';

import { useChatStore } from '../stores/chat';
import { useSettingsStore } from '../stores/settings';
import { useToastStore } from '../stores/toast';
import { useWebSocketStore } from '../stores/websocket';
import { useHistoryStore } from '../stores/history';
import { useUserStore } from '../stores/user';

const chatStore = useChatStore();
const settingsStore = useSettingsStore();
const toastStore = useToastStore();
const websocketStore = useWebSocketStore();
const historyStore = useHistoryStore();
const userStore = useUserStore();

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

const handleLogin = (credentials) => {
  const wsUrl = 'ws://localhost:8765';
  // 保存登录凭据到临时变量
  window._tempLoginCredentials = credentials;
  websocketStore.connect(wsUrl, credentials.username, credentials.password);
  websocketStore.setMessageHandler(handleWebSocketMessage);
};

const handleLogout = () => {
  if (!checkWebSocketConnection()) return;
  
  websocketStore.sendMessage({
    type: 'logout'
  });
};

const openSettingsPanel = () => {
  settingsStore.toggleSettingsPanel();
};

const closePanel = () => {
  settingsStore.isSettingsPanelActive = false;
};

const handleServerAdded = (server) => {
  settingsStore.addServer(server);
  websocketStore.sendMessage({
      type: 'settings_add_server',
      server: settingsStore.serverList
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

  chatStore.setNewChatEnabled(true);
  initChatPanel();
  requestQuestion(question);
};

const selectChat = (conversationId) => {
  websocketStore.sendMessage({
    type: 'conversation_message',
    conversation_id: conversationId
  });

  chatStore.setNewChatEnabled(true)
  initChatPanel();
};

const requestQuestion = async (question) => {
  if (!checkWebSocketConnection()) return;

  isLoading.value = true;

  try {
    // 通过 WebSocket 发送问题
    if (chatStore.chatMessages.length > 0) {
      websocketStore.sendMessage({
        type: 'user_question',
        question: question,
        conversation_id: historyStore.getCurrentHistory.id,
        mcp_servers: settingsStore.serverList
      });
    }else{
      websocketStore.sendMessage({
        type: 'conversation_question',
        question: question,
        mcp_servers: settingsStore.serverList
      })
    }
    // 添加用户消息到聊天历史
    chatStore.addChatUserMessage({
      role: 'user',
      content: question
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
  } else if (data.type === 'logout_success') {
      userStore.logout()
      historyStore.clearHistory()
      chatStore.clearChatMessages()
      settingsStore.clearServerList()
      isLoading.value = false
      chatStore.setChatActive(false)
      chatStore.setNewChatEnabled(false)
      undoChat()
      websocketStore.disconnect()
      // 清除 cookie 和临时凭据
      document.cookie = 'username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'password=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      window._tempLoginCredentials = null;
      toastStore.showToast('已退出登录', 'success')
  } else if(data.type === 'user_settings'){
    settingsStore.initServerList(data.user_settings);
  } else if (data.type === 'auth_success') {
    userStore.setLoggedIn(true);
    userStore.setUserInfo({
      username: data.username,
      user_id: data.user_id,
    });
    // 存储登录信息到 cookie
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 7); // 7天后过期
    document.cookie = `username=${encodeURIComponent(data.username)}; expires=${expirationDate.toUTCString()}; path=/;`;
    // 使用临时保存的密码
    if (window._tempLoginCredentials) {
      document.cookie = `password=${encodeURIComponent(window._tempLoginCredentials.password)}; expires=${expirationDate.toUTCString()}; path=/;`;
      // 清除临时凭据
      window._tempLoginCredentials = null;
    }
    toastStore.showToast('登录成功', 'success');
  } else if (data.type === 'login_error') {
    toastStore.showToast(data.message || '登录失败', 'error');
    // 清除临时凭据
    window._tempLoginCredentials = null;
  } else if (data.type === 'conversation_title') {
    if(historyStore.getAllHistory.find(history => history.id === data.conversation_id)) {
      historyStore.updateAppendHistory(data.conversation_id, data.title);
    }else{
      historyStore.addHistory(data);
      historyStore.setCurrentHistory(data.conversation_id);
    }
  } else if (data.type === 'conversation_list') {
    // 处理历史记录数据
    historyStore.initHistory(data.conversations);
  } else if (data.type === 'conversation_message') {
    chatStore.initChatMessages(data.messages);
    console.log(chatStore.chatMessages);
  }else if (data.type === 'server_answer' && data.answer !== "") {
    chatStore.addChatAssistantMessage({
      role: 'assistant',
      content: data.answer
    });
    isLoading.value = false;
  } else if (data.type === 'server_select_function') {
    chatStore.addChatAssistantToolMessage({
      role: 'assistant_tool',
      content: '请选择要执行的工具：',
      select_functions: data.select_functions
    });
  } else if (data.type === 'error') {
    handleError(data.message);
  }
};

const executeSelectedTools = (selectedTools) => {
  if (!checkWebSocketConnection()) return;

  const message = {
    type: 'execute_tools',
    select_functions: selectedTools,
    conversation_id: historyStore.getCurrentHistory.id,
    mcp_servers: settingsStore.serverList,
    question: chatStore.getCurrentQuestion()
  };
  
  console.log(message);
  websocketStore.sendMessage(message);
};

// 从 cookie 中获取登录信息
const getLoginInfoFromCookie = () => {
  const cookies = document.cookie.split(';');
  const loginInfo = {
    username: '',
    password: ''
  };
  
  console.log('All cookies:', document.cookie);
  
  cookies.forEach(cookie => {
    const [name, value] = cookie.trim().split('=');
    console.log('Processing cookie:', name, value);
    if (name === 'username') {
      loginInfo.username = decodeURIComponent(value);
      console.log('Decoded username:', loginInfo.username);
    } else if (name === 'password') {
      loginInfo.password = decodeURIComponent(value);
      console.log('Decoded password:', loginInfo.password);
    }
  });
  
  console.log('Final login info:', loginInfo);
  return loginInfo;
};

// 初始化 WebSocket 连接
onMounted(() => {
  // 检查是否有保存的登录信息
  const loginInfo = getLoginInfoFromCookie();
  if (loginInfo.username && loginInfo.password) {
    // 自动登录
    const wsUrl = 'ws://localhost:8765';
    websocketStore.connect(wsUrl, loginInfo.username, loginInfo.password);
    websocketStore.setMessageHandler(handleWebSocketMessage);
  }
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
  right: 80px;
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

.user-login {
  position: fixed;
  right: 20px;
  top: 16px;
  z-index: 200;
}
</style> 