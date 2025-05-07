<template>
  <div v-if="toastStore.show" class="toast-message" :class="toastStore.type" @click="handleClick">
    {{ toastStore.text }}
  </div>
</template>

<script setup>
import { useToastStore } from '../stores/toast';

const toastStore = useToastStore();

const handleClick = () => {
  toastStore.hideToast();
};
</script>

<style scoped>
.toast-message {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 12px 24px;
  border-radius: 4px;
  color: white;
  font-size: 14px;
  z-index: 9999;
  animation: slideIn 0.3s ease-out forwards;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  transition: opacity 0.3s ease-out;
  pointer-events: auto;
}

.toast-message:hover {
  opacity: 0.9;
}

.toast-message.info {
  background-color: #2196F3;
}

.toast-message.success {
  background-color: #4CAF50;
}

.toast-message.warning {
  background-color: #FFC107;
}

.toast-message.error {
  background-color: #F44336;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style> 