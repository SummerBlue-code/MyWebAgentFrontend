<template>
  <div class="knowledge-panel" :class="{ active: isActive }">
    <div class="close-handler">
      <button class="close-button" @click="closePanel">
        <svg class="close-icon" viewBox="0 0 24 24">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
    </div>
    <div class="panel-content">
      <h2 id="knowledge-base">知识库管理</h2>
      <div class="knowledge-container">
        <!-- 左侧数据库列表 -->
        <div class="database-list">
          <h3>数据库列表</h3>
          <div class="database-input-section">
            <input 
              type="text" 
              v-model="newDatabaseName" 
              placeholder="输入新数据库名称" 
              class="database-input"
              @keyup.enter="handleAddDatabase"
            >
            <button @click="handleAddDatabase" class="add-database-btn">添加数据库</button>
          </div>
          <div class="database-items">
            <div 
              v-for="(db, index) in databaseList" 
              :key="index"
              class="database-item"
              :class="{ active: selectedDatabase === db.kb_id }"
              @click="handleSelectDatabase(db)"
            >
              <span class="database-name">{{ db.name }}</span>
              <span class="database-time">{{ formatTime(db.created_time) }}</span>
            </div>
          </div>
          <div class="confirm-section">
            <button 
              class="confirm-btn"
              :class="{ disabled: !selectedDatabase }"
              :disabled="!selectedDatabase"
              @click="handleConfirmDatabase"
            >
              使用此知识库
            </button>
            <button 
              class="delete-database-btn"
              :class="{ disabled: !selectedDatabase }"
              :disabled="!selectedDatabase"
              @click="handleDeleteDatabase"
            >
              删除此知识库
            </button>
          </div>
        </div>

        <!-- 右侧文件列表 -->
        <div class="file-list">
          <h3>文件列表</h3>
          <div class="file-upload-section">
            <input 
              type="file" 
              @change="handleFileUpload" 
              class="file-input"
              ref="fileInput"
              :disabled="!selectedDatabase"
            >
            <button 
              @click="triggerFileInput" 
              class="upload-btn"
              :class="{ disabled: !selectedDatabase }"
              :disabled="!selectedDatabase"
            >上传文件</button>
          </div>
          <div class="file-items">
            <div v-if="!selectedDatabase" class="no-database-selected">
              请先选择一个数据库
            </div>
            <div v-else-if="currentFiles.length === 0" class="no-files">
              该数据库暂无文件
            </div>
            <div v-else v-for="(file, index) in currentFiles" :key="index" class="file-row">
              <button class="file-btn" @mouseenter="handleSelectFile(file)" @mouseleave="handleSelectFile(null)">
                <span class="file-name">{{ file.name }}</span>
                <span class="file-time">{{ formatTime(file.created_time) }}</span>
              </button>
              <button @click="handleDeleteFile(file)" class="delete-btn">删除</button>
            </div>
          </div>
        </div>

        <!-- 文件详情面板 -->
        <div v-if="selectedFile" class="file-detail-panel">
          <h3>文件详情</h3>
          <div class="file-detail-content">
            <div class="detail-item">
              <span class="detail-label">文件名：</span>
              <span class="detail-value">{{ selectedFile.name }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">创建时间：</span>
              <span class="detail-value">{{ formatTime(selectedFile.created_time) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">文件摘要：</span>
              <span class="detail-value">{{ selectedFile.summary || '暂无摘要' }}</span>
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
import { useToastStore } from '../../stores/toast';

const props = defineProps({
  isActive: {
    type: Boolean,
    default: false
  },
  databaseList: {
    type: Array,
    default: () => []
  },
  selectedDatabase: {
    type: [String, Number],
    default: null
  },
  currentFiles: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits([
  'close',
  'add-database',
  'select-database',
  'upload-files',
  'delete-file',
  'confirm-database',
  'delete-database'
]);

const toastStore = useToastStore();
const newDatabaseName = ref('');
const fileInput = ref(null);
const selectedFile = ref(null);

const closePanel = () => {
  emit('close');
};

const handleAddDatabase = () => {
  if (!newDatabaseName.value.trim()) {
    toastStore.showToast('请输入数据库名称', 'error');
    return;
  }
  emit('add-database', newDatabaseName.value);
  newDatabaseName.value = '';
};

const handleSelectDatabase = (db) => {
  emit('select-database', db);
};

const triggerFileInput = () => {
  fileInput.value.click();
};

const handleFileUpload = (event) => {
  const files = event.target.files;
  if (!files.length) return;

  if (!props.selectedDatabase) {
    toastStore.showToast('请先选择一个数据库', 'error');
    return;
  }

  emit('upload-files', Array.from(files));
};

const handleDeleteFile = (file) => {
  emit('delete-file', file);
};

const handleConfirmDatabase = () => {
  if (!props.selectedDatabase) {
    toastStore.showToast('请先选择一个知识库', 'error');
    return;
  }
  const selectedDb = props.databaseList.find(db => db.kb_id === props.selectedDatabase);
  emit('confirm-database', selectedDb);
  emit('close');
};

const handleSelectFile = (file) => {
  selectedFile.value = file;
};

const handleDeleteDatabase = () => {
  if (!props.selectedDatabase) {
    toastStore.showToast('请先选择一个知识库', 'error');
    return;
  }
  const selectedDb = props.databaseList.find(db => db.kb_id === props.selectedDatabase);
  emit('delete-database', selectedDb);
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};
</script>

<style scoped>
.knowledge-panel {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0);
  width: 800px;
  max-height: 80vh;
  background: var(--color-background);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  transition: transform 0.3s ease;
  z-index: 1000;
  opacity: 0;
  border: 1px solid var(--color-border);
}

.knowledge-panel.active {
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

.knowledge-container {
  display: flex;
  gap: 20px;
  margin-top: 20px;
}

.database-list, .file-list {
  flex: 1;
  background: var(--color-background-soft);
  border-radius: 8px;
  border: 1px solid var(--color-border);
  padding: 20px;
}

.database-input-section, .file-upload-section {
  margin-bottom: 20px;
}

.database-input, .file-input {
  width: 100%;
  padding: 8px 12px;
  margin-bottom: 12px;
  box-sizing: border-box;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-background);
  color: var(--color-text);
  font-size: 14px;
}

.add-database-btn, .upload-btn {
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

.add-database-btn:hover, .upload-btn:hover {
  background: var(--btn-primary-hover);
  transform: translateY(-1px);
}

.upload-btn.disabled {
  background: var(--color-background-soft);
  color: var(--color-text-tertiary);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.upload-btn.disabled:hover {
  background: var(--color-background-soft);
  transform: none;
  box-shadow: none;
}

.database-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  margin-bottom: 8px;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.database-item:hover {
  border-color: var(--color-primary);
  transform: translateY(-1px);
}

.database-item.active {
  background: var(--color-primary);
  color: white;
}

.database-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.database-name {
  flex: 1;
  margin-right: 12px;
}

.database-time {
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.database-item.active .database-time {
  color: rgba(255, 255, 255, 0.8);
}

.file-row {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.file-btn {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
}

.file-btn:hover {
  background: var(--color-background-soft);
}

.file-name {
  font-size: 14px;
  font-weight: 500;
}

.file-time {
  color: var(--color-text-tertiary);
  font-size: 13px;
}

.delete-btn {
  padding: 8px 16px;
  background: var(--color-danger);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s ease;
  align-self: center;
}

.delete-btn:hover {
  background: var(--color-danger-hover);
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.delete-btn:active {
  transform: translateY(0);
  box-shadow: none;
}

.no-database-selected, .no-files {
  text-align: center;
  padding: 20px;
  color: var(--color-text-tertiary);
  font-style: italic;
}

.file-input {
  display: none;
}

.confirm-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.confirm-btn {
  width: 100%;
  background: var(--color-primary);
  color: white;
  padding: 12px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.confirm-btn:hover:not(.disabled) {
  background: var(--color-primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.confirm-btn:active:not(.disabled) {
  transform: translateY(0);
  box-shadow: none;
}

.confirm-btn.disabled {
  background: var(--color-background-soft);
  color: var(--color-text-tertiary);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.confirm-btn.disabled:hover {
  background: var(--color-background-soft);
  transform: none;
  box-shadow: none;
}

.delete-database-btn {
  width: 100%;
  background: var(--color-danger);
  color: white;
  padding: 12px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.delete-database-btn:hover:not(.disabled) {
  background: var(--color-danger-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.delete-database-btn:active:not(.disabled) {
  transform: translateY(0);
  box-shadow: none;
}

.delete-database-btn.disabled {
  background: var(--color-background-soft);
  color: var(--color-text-tertiary);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.delete-database-btn.disabled:hover {
  background: var(--color-background-soft);
  transform: none;
  box-shadow: none;
}

.file-detail-panel {
  position: absolute;
  right: -300px;
  top: 0;
  width: 280px;
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.file-detail-content {
  margin-top: 16px;
}

.detail-item {
  margin-bottom: 16px;
}

.detail-label {
  display: block;
  color: var(--color-text-tertiary);
  font-size: 12px;
  margin-bottom: 4px;
}

.detail-value {
  display: block;
  color: var(--color-text);
  font-size: 14px;
  word-break: break-all;
}

.file-list {
  position: relative;
}
</style> 