<template>
  <div class="settings-panel" :class="{ active: isActive }">
    <div class="close-handler">
      <button class="close-button" @click="closePanel">
        <svg class="close-icon" viewBox="0 0 24 24">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
    </div>
    <div class="panel-content">
      <h2 id="global-settings">全局设置</h2>
      <div class="setting-container">
        <div class="MCP-setting" id="MCP-setting">
          <div class="MCP-setting-head" id="MCP-setting-head">
            <h3>MCP 服务器管理</h3>
            <p style="color: var(--color-text-tertiary); font-size: 0.9em">MCP (Method Call Protocol) 服务器类似RPC服务，提供远程函数调用接口</p>
          </div>
          
          <!-- 添加服务器区域 -->
          <div class="server-input-section">
            <h4 class="section-title">添加新服务器</h4>
            <input type="text" @keyup.enter="addServer" v-model="serverUrl" placeholder="输入服务器地址 (例：https://example.com)" class="server-input">
            <button @click="addServer" class="add-server-btn">添加服务器</button>
          </div>

          <!-- 已添加服务器列表区域 -->
          <div class="server-list-section">
            <h4 class="section-title">已添加的服务器</h4>
            <div v-if="settingsStore.serverList.length === 0" class="empty-server-list">
              <p>暂无已添加的服务器</p>
            </div>
            <div v-else class="server-display-section">
              <div v-for="(server, index) in settingsStore.serverList" :key="index" class="server-info-card" @click="showMethods(index)">
                <div class="server-info-header">
                  <div class="server-info-left">
                    <h4 class="server-name">{{ server.server_name }}</h4>
                    <p class="server-address">{{ server.server_address }}</p>
                  </div>
                  <div class="server-info-right">
                    <span class="method-count">{{ server.server_functions.length }} 个方法</span>
                  </div>
                </div>
                <div class="server-methods" :class="{ 'expanded': server.showMethods }">
                  <div v-if="server.server_functions.length" v-for="(m, mIndex) in server.server_functions" :key="mIndex" class="method-item">
                    <span class="method-name">{{ m.function.name }}</span>
                    <span class="method-params">({{ Object.keys(m.function.parameters.properties).join(', ') }})</span>
                  </div>
                  <div v-else class="no-methods">暂未获取方法列表</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <ToastMessage
    v-if="toastStore.show"
    :message="toastStore.text"
    :type="toastStore.type"
    :duration="3000"
    @close="toastStore.hideToast"
  />
</template>

<script setup>
import { ref } from 'vue';
import ToastMessage from '../ToastMessage.vue';
import { useSettingsStore } from '../../stores/settings';
import { useToastStore } from '../../stores/toast';
import { useWebSocketStore } from '../../stores/websocket';
const settingsStore = useSettingsStore();
const toastStore = useToastStore();
const websocketStore = useWebSocketStore();

const props = defineProps({
  isActive: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'server-added']);

const serverUrl = ref('');

const closePanel = () => {
  emit('close');
};

const showMethods = (index) => {
  settingsStore.serverList[index].showMethods = !settingsStore.serverList[index].showMethods;
};

const isValidHttpUrl = (str) => {
  if (typeof str !== 'string') return false;
  const protocolPattern = /^https?:\/\//i;
  if (!protocolPattern.test(str)) return false;
  try {
    const url = new URL(str);
    return ['http:', 'https:'].includes(url.protocol);
  } catch (_) {
    return false;
  }
};

const GETServerFunction = async (server_url) => {
  try {
    const response = await fetch(server_url+"/tools", {
      method: 'GET',
      headers: {'Content-Type': 'application/json'}
    });
    return await response.json();
  } catch (error) {
    console.error(error);
  }
};

const addServer = async () => {
  if (!serverUrl.value.trim()) {
    toastStore.showToast('请输入服务器地址', 'error');
    return;
  }

  if (!isValidHttpUrl(serverUrl.value)) {
    toastStore.showToast('请输入有效的服务器地址', 'error');
    return;
  }

  try {
    const serverFunctions = await GETServerFunction(serverUrl.value);
    if (!serverFunctions || !serverFunctions.available_functions) {
      toastStore.showToast('无法获取服务器方法列表，请检查服务器地址是否正确', 'error');
      return;
    }

    const newServer = {
      server_name: serverFunctions.server_name,
      server_address: serverUrl.value,
      server_functions: serverFunctions.available_functions,
      showMethods: false
    };

    serverUrl.value = '';
    toastStore.showToast('服务器添加成功', 'success');
    emit('server-added', newServer);
  } catch (error) {
    toastStore.showToast(`添加服务器失败：${error.message}`, 'error');
  }
};
</script>

<style scoped>
.settings-panel {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0);
  width: 600px;
  max-height: 80vh;
  background: var(--color-background);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  transition: transform 0.3s ease;
  z-index: 1000;
  opacity: 0;
  border: 1px solid var(--color-border);
}

.settings-panel.active {
  transform: translate(-50%, -50%) scale(1);
  opacity: 1;
}

.close-handler {
  position: absolute;
  top: 10px;
  right: 10px;
}

.close-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
}

.close-icon {
  width: 24px;
  height: 24px;
  stroke: var(--color-text-tertiary);
  stroke-width: 2;
}

.panel-content {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
  max-height: calc(80vh - 40px);
}

.MCP-setting {
  margin-top: 20px;
}

.MCP-control {
  margin: 10px 0;
  padding: 12px 16px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--color-background-soft);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.MCP-control:hover {
  border-color: var(--color-primary);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.MCP-control:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.server-input {
  width: 100%;
  padding: 8px 12px;
  margin-bottom: 12px;
  box-sizing: border-box;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-background);
  color: var(--color-text);
  font-size: 14px;
  transition: all 0.2s ease;
}

.server-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), 0.1);
}

.add-server-btn {
  width: 100%;
  background: var(--btn-primary);
  color: white;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-server-btn:hover {
  background: var(--btn-primary-hover);
  transform: translateY(-1px);
}

.add-server-btn:active {
  background: var(--btn-primary-active);
  transform: translateY(0);
}

.server-input-section {
  margin: 20px 0;
  padding: 20px;
  background: var(--color-background-soft);
  border-radius: 8px;
  border: 1px solid var(--color-border);
}

.server-list-section {
  margin: 20px 0;
  padding: 20px;
  background: var(--color-background-soft);
  border-radius: 8px;
  border: 1px solid var(--color-border);
}

.empty-server-list {
  text-align: center;
  padding: 20px;
  color: var(--color-text-tertiary);
  font-style: italic;
}

.server-display-section {
  margin-top: 20px;
}

.server-info-card {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  margin-bottom: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.server-info-card:hover {
  border-color: var(--color-primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.server-info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  cursor: pointer;
}

.server-info-left {
  flex: 1;
}

.server-name {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text);
}

.server-address {
  margin: 4px 0 0;
  font-size: 14px;
  color: var(--color-text-tertiary);
}

.server-info-right {
  display: flex;
  align-items: center;
}

.method-count {
  background: var(--color-primary);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.server-methods {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
  background: var(--color-background);
}

.server-methods.expanded {
  max-height: 500px;
}

.method-item {
  padding: 8px 16px;
  border-top: 1px solid var(--color-border);
  font-size: 14px;
  color: var(--color-text-tertiary);
}

.method-name {
  font-weight: 500;
  color: var(--color-text);
}

.method-params {
  color: var(--color-text-tertiary);
}

.no-methods {
  padding: 16px;
  text-align: center;
  color: var(--color-text-tertiary);
  font-style: italic;
}

.section-title {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text);
}
</style> 