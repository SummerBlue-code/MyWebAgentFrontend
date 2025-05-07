<template>
  <div class="message" :class="type + '-message'">
    <div class="content">
      <div v-if="type === 'assistant_tool'" class="tool-selection">
        <div class="message-text" v-html="formattedMessage"></div>
        <div class="tool-options">
          <div v-for="tool in select_functions" :key="tool.id" 
               class="tool-option" 
               :class="{ selected: isToolSelected(tool) }"
               @click="toggleTool(tool)">
            <div class="tool-header">
              <div class="tool-name">{{ tool.name }}</div>
              <div class="tool-server">{{ getServerName(tool.server_address) }}</div>
            </div>
            <div class="tool-parameters">
              <div class="parameters-label">参数：</div>
              <pre class="parameters-content">{{ formatParameters(tool.parameters) }}</pre>
            </div>
          </div>
        </div>
        <button class="execute-button" @click="executeSelectedTools" :disabled="selectedTools.length === 0">
          执行选中工具
        </button>
      </div>
      <div v-else class="message-text" v-html="formattedMessage"></div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useChatStore } from '../../stores/chat';
import { useWebSocketStore } from '../../stores/websocket';
import { useSettingsStore } from '../../stores/settings';

const chatStore = useChatStore();
const websocketStore = useWebSocketStore();
const settingsStore = useSettingsStore();

const props = defineProps({
  text: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'user'
  },
  select_functions: {
    type: Array,
    default: () => []
  },
  executeSelectedTools: {
    type: Function,
    required: true
  }
});

const selectedTools = ref([]);

const formattedMessage = computed(() => {
  // 这里可以添加消息格式化逻辑，比如将URL转换为链接等
  return props.text;
});

const formatParameters = (parameters) => {
  try {
    const parsed = JSON.parse(parameters);
    if (Object.keys(parsed).length === 0) {
      return '无参数';
    }
    return JSON.stringify(parsed, null, 2);
  } catch (e) {
    return parameters;
  }
};

const isToolSelected = (tool) => {
  return selectedTools.value.some(t => t.id === tool.id);
};

const toggleTool = (tool) => {
  const index = selectedTools.value.findIndex(t => t.id === tool.id);
  if (index === -1) {
    selectedTools.value.push(tool);
  } else {
    selectedTools.value.splice(index, 1);
  }
};

const executeSelectedTools = () => {
  if (selectedTools.value.length > 0) {
    props.executeSelectedTools(selectedTools.value);
  }
};

const getServerName = (serverAddress) => {
  const server = settingsStore.serverList.find(server => server["server_address"] === serverAddress);
  return server ? server["server_name"] : serverAddress;
};
</script>

<style scoped>
.message {
  margin: 10px 0;
  max-width: 80%;
}

.user-message {
  margin-left: auto;
}

.assistant-message {
  margin-right: auto;
}

.content {
  padding: 12px 16px;
  border-radius: 8px;
  background: var(--color-background-soft);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.user-message .content {
  background: var(--color-primary);
  color: white;
}

.assistant-message .content {
  background: var(--color-background-soft);
  color: var(--color-text-primary);
  border-left: 3px solid var(--color-primary);
}

.message-text {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.6;
  font-size: 15px;
}

.tool-selection {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tool-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tool-option {
  padding: 16px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.tool-option:hover {
  background: var(--color-background-soft);
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.tool-option.selected {
  background: var(--color-primary-light);
  border-color: var(--color-primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(var(--color-primary-rgb), 0.2);
}

.tool-option.selected::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: var(--color-primary);
}

.tool-option.selected .tool-name {
  color: var(--color-primary);
}

.tool-option.selected .tool-server {
  background: var(--color-primary);
  color: white;
}

.tool-option.selected .parameters-label {
  color: var(--color-primary);
}

.tool-option.selected .parameters-content {
  background: rgba(var(--color-primary-rgb), 0.05);
  border: 1px solid rgba(var(--color-primary-rgb), 0.1);
  color: var(--color-text-primary);
}

.tool-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.tool-name {
  font-weight: 600;
  font-size: 16px;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.tool-server {
  font-size: 12px;
  color: var(--color-text-secondary);
  background: var(--color-background-soft);
  padding: 2px 8px;
  border-radius: 4px;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.tool-parameters {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--color-border);
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.parameters-label {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: 4px;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.parameters-content {
  font-family: monospace;
  font-size: 13px;
  background: var(--color-background-soft);
  padding: 8px;
  border-radius: 4px;
  white-space: pre-wrap;
  word-break: break-all;
  color: var(--color-text-secondary);
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.execute-button {
  align-self: flex-end;
  padding: 8px 16px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
}

.execute-button:disabled {
  background: var(--color-background-soft);
  color: var(--color-text-secondary);
  cursor: not-allowed;
}

.execute-button:not(:disabled):hover {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
}

.execute-button:not(:disabled):active {
  transform: translateY(1px);
}
</style> 