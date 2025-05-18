<template>
  <div class="user-login">
    <!-- 用户头像按钮 -->
    <div class="user-avatar" @click="toggleLoginModal">
      <img v-if="userStore.userInfo?.avatar" :src="userStore.userInfo.avatar" alt="用户头像" />
      <div v-else class="default-avatar">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/>
        </svg>
      </div>
    </div>

    <!-- 登录弹窗 -->
    <div v-if="showLoginModal" class="login-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ userStore.isLoggedIn ? '个人中心' : (isRegister ? '注册' : '登录') }}</h3>
          <button class="close-button" @click="toggleLoginModal">×</button>
        </div>
        <div class="modal-body">
          <div v-if="!userStore.isLoggedIn" class="login-form">
            <div class="form-group">
              <label for="username">用户名</label>
              <input type="text" id="username" v-model="formData.username" placeholder="请输入用户名"/>
            </div>
            <div class="form-group">
              <label for="password">密码</label>
              <input type="password" id="password" v-model="formData.password" placeholder="请输入密码"/>
            </div>
            <div v-if="isRegister" class="form-group">
              <label for="confirmPassword">确认密码</label>
              <input type="password" id="confirmPassword" v-model="formData.confirmPassword" placeholder="请再次输入密码"/>
            </div>
            <div class="form-actions">
              <button class="submit-button" @click="handleSubmit">{{ isRegister ? '注册' : '登录' }}</button>
              <button class="switch-mode-button" @click="toggleMode">{{ isRegister ? '已有账号？去登录' : '没有账号？去注册' }}
              </button>
            </div>
          </div>
          <div v-else class="user-info">
            <div class="user-profile">
              <img v-if="userStore.userInfo?.avatar" :src="userStore.userInfo.avatar" alt="用户头像" class="profile-avatar" />
              <div v-else class="profile-avatar default-avatar">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/>
                </svg>
              </div>
              <div class="profile-info">
                <h4>{{ userStore.userInfo?.username || '未设置用户名' }}</h4>
              </div>
            </div>
            <button class="logout-button" @click="handleLogout">
              退出登录
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user.js'
import { useWebSocketStore } from '@/stores/websocket.js'
import { useToastStore } from '@/stores/toast.js'
import axios from 'axios'

const userStore = useUserStore()
const websocketStore = useWebSocketStore()
const toastStore = useToastStore()
const showLoginModal = ref(false)
const isRegister = ref(false)
const formData = ref({
  username: '',
  password: '',
  confirmPassword: ''
})

const emit = defineEmits(['login', 'logout'])

const toggleLoginModal = () => {
  showLoginModal.value = !showLoginModal.value
  if (!showLoginModal.value) {
    resetForm()
  }
}

const toggleMode = () => {
  isRegister.value = !isRegister.value
  resetForm()
}

const resetForm = () => {
  formData.value = {
    username: '',
    password: '',
    confirmPassword: ''
  }
}

const validateForm = () => {
  if (!formData.value.username || !formData.value.password) {
    toastStore.showToast('请填写完整信息', 'error')
    return false
  }
  if (isRegister.value && formData.value.password !== formData.value.confirmPassword) {
    toastStore.showToast('两次输入的密码不一致', 'error')
    return false
  }
  return true
}

const handleSubmit = async () => {
  if (!validateForm()) return

  try {
    if (isRegister.value) {
      // 注册使用 HTTP 请求
      const response = await axios.post('http://localhost:8080/api/register', {
        username: formData.value.username,
        password: formData.value.password
      })
      
      console.log(response)
      if (response.data.type === 'register_success') {
        toastStore.showToast('注册成功，请登录', 'success')
        isRegister.value = false
        resetForm()
      } else {
        toastStore.showToast(response.data.detail.message || '注册失败', 'error')
      }
    } else {
      // 发送登录事件到父组件
      emit('login', {
        username: formData.value.username,
        password: formData.value.password
      })
    }
  } catch (error) {
    toastStore.showToast(error.response?.data?.detail?.message || '操作失败，请稍后重试', 'error')
  }
}

const handleLogout = () => {
  emit('logout')
  userStore.logout()
  toggleLoginModal()
}

onMounted(() => {
})
</script>

<style scoped>
.user-login {
  position: relative;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  overflow: hidden;
  background: var(--color-background-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.user-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-avatar {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-tertiary);
}

.default-avatar svg {
  width: 24px;
  height: 24px;
}

.login-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--color-background);
  border-radius: 12px;
  width: 360px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: modalSlideIn 0.3s ease;
}

.modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: var(--color-text-primary);
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  color: var(--color-text-tertiary);
  cursor: pointer;
  padding: 0;
  line-height: 1;
  transition: color 0.2s ease;
}

.close-button:hover {
  color: var(--color-text-primary);
}

.modal-body {
  padding: 20px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  color: var(--color-text-secondary);
  font-size: 14px;
}

.form-group input {
  padding: 10px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-background-soft);
  color: var(--color-text-primary);
  transition: all 0.2s ease;
}

.form-group input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px var(--color-primary-light);
}

.form-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
}

.submit-button {
  padding: 12px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.submit-button:hover {
  transform: translateY(-1px);
}

.switch-mode-button {
  padding: 8px;
  background: none;
  border: none;
  color: var(--color-primary);
  cursor: pointer;
  font-size: 14px;
  transition: color 0.2s ease;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 16px;
}

.profile-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  overflow: hidden;
  background: var(--color-background-soft);
}

.profile-info h4 {
  margin: 0;
  color: var(--color-text-primary);
}

.logout-button {
  padding: 10px;
  background: var(--color-background-soft);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.logout-button:hover {
  background: var(--color-background);
  border-color: var(--color-text-tertiary);
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style> 