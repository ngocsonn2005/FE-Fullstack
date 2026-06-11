<template>
  <div class="settings-container">
    <!-- Header -->
    <div class="settings-header">
      <h1 class="settings-title">⚙️ Cài đặt hệ thống</h1>
      <p class="settings-subtitle">Quản lý thông tin cá nhân và tùy chỉnh giao diện</p>
    </div>

    <div class="settings-grid">
      <!-- Left Sidebar - Settings Navigation -->
      <div class="settings-sidebar">
        <div class="settings-nav">
          <button 
            v-for="tab in tabs" 
            :key="tab.key"
            :class="['nav-item', { active: activeTab === tab.key }]"
            @click="activeTab = tab.key"
          >
            <span class="nav-icon">{{ tab.icon }}</span>
            <span class="nav-text">{{ tab.label }}</span>
          </button>
        </div>
      </div>

      <!-- Right Content - Settings Panels -->
      <div class="settings-content">
        <!-- Profile Settings -->
        <div v-if="activeTab === 'profile'" class="settings-panel">
          <div class="panel-header">
            <h2>👤 Thông tin cá nhân</h2>
            <p>Cập nhật thông tin hồ sơ của bạn</p>
          </div>
          <div class="panel-body">
            <form @submit.prevent="updateProfile">
              <!-- Avatar -->
              <div class="form-group avatar-group">
                <label>Ảnh đại diện</label>
                <div class="avatar-upload">
                  <div class="avatar-preview">
                    <img :src="profileForm.avatar || defaultAvatar" alt="Avatar">
                    <button type="button" class="avatar-edit" @click="openAvatarModal">
                      ✏️
                    </button>
                  </div>
                  <p class="avatar-hint">Click vào icon bút để đổi ảnh đại diện</p>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Họ và tên</label>
                  <input type="text" v-model="profileForm.fullName" class="form-control" required>
                </div>
                <div class="form-group">
                  <label>Email</label>
                  <input type="email" v-model="profileForm.email" class="form-control" disabled>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Số điện thoại</label>
                  <input type="tel" v-model="profileForm.phone" class="form-control" placeholder="Nhập số điện thoại">
                </div>
                <div class="form-group">
                  <label>Vai trò</label>
                  <input type="text" :value="displayRole" class="form-control" disabled>
                </div>
              </div>

              <div class="form-group">
                <label>Ngày tham gia</label>
                <input type="text" :value="formatDate(profileForm.createdAt)" class="form-control" disabled>
              </div>

              <div class="alert alert-success" v-if="successMessage">
                ✅ {{ successMessage }}
              </div>
              <div class="alert alert-danger" v-if="errorMessage">
                ⚠️ {{ errorMessage }}
              </div>

              <div class="form-actions">
                <button type="button" class="btn-secondary" @click="resetProfile">Hủy</button>
                <button type="submit" class="btn-primary" :disabled="profileSaving">
                  {{ profileSaving ? 'Đang lưu...' : 'Lưu thay đổi' }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Appearance Settings -->
        <div v-if="activeTab === 'appearance'" class="settings-panel">
          <div class="panel-header">
            <h2>🎨 Giao diện</h2>
            <p>Tùy chỉnh giao diện hiển thị</p>
          </div>
          <div class="panel-body">
            <div class="setting-item">
              <div class="setting-info">
                <h4>Chế độ tối</h4>
                <p>Chuyển đổi giao diện sáng/tối</p>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="appearance.darkMode" @change="toggleDarkMode">
                <span class="toggle-slider"></span>
              </label>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <h4>Sidebar thu gọn</h4>
                <p>Thu gọn menu bên trái</p>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="appearance.sidebarCollapsed" @change="toggleSidebar">
                <span class="toggle-slider"></span>
              </label>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <h4>Hiệu ứng động</h4>
                <p>Bật/tắt hiệu ứng chuyển động</p>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="appearance.animations" @change="saveSettings">
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        <!-- Notifications Settings -->
        <div v-if="activeTab === 'notifications'" class="settings-panel">
          <div class="panel-header">
            <h2>🔔 Thông báo</h2>
            <p>Quản lý cách bạn nhận thông báo</p>
          </div>
          <div class="panel-body">
            <div class="setting-item">
              <div class="setting-info">
                <h4>Thông báo đơn hàng mới</h4>
                <p>Nhận thông báo khi có đơn hàng mới</p>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="notifications.newOrder" @change="saveSettings">
                <span class="toggle-slider"></span>
              </label>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <h4>Cảnh báo tồn kho thấp</h4>
                <p>Nhận cảnh báo khi sản phẩm sắp hết hàng</p>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="notifications.lowStock" @change="saveSettings">
                <span class="toggle-slider"></span>
              </label>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <h4>Thông báo qua Email</h4>
                <p>Nhận thông báo qua email</p>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="notifications.email" @change="saveSettings">
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal đổi ảnh đại diện -->
    <div v-if="showAvatarModal" class="modal-overlay" @click.self="showAvatarModal = false">
      <div class="modal-container">
        <div class="modal-header">
          <h3>🖼️ Đổi ảnh đại diện</h3>
          <button class="close-btn" @click="showAvatarModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="avatar-options">
            <div class="avatar-option" @click="selectAvatar(1)">
              <img src="https://ui-avatars.com/api/?background=6366f1&color=fff&bold=true&length=1&size=80" alt="Avatar 1">
            </div>
            <div class="avatar-option" @click="selectAvatar(2)">
              <img src="https://ui-avatars.com/api/?background=10b981&color=fff&bold=true&length=1&size=80" alt="Avatar 2">
            </div>
            <div class="avatar-option" @click="selectAvatar(3)">
              <img src="https://ui-avatars.com/api/?background=f59e0b&color=fff&bold=true&length=1&size=80" alt="Avatar 3">
            </div>
            <div class="avatar-option" @click="selectAvatar(4)">
              <img src="https://ui-avatars.com/api/?background=ef4444&color=fff&bold=true&length=1&size=80" alt="Avatar 4">
            </div>
            <div class="avatar-option" @click="selectAvatar(5)">
              <img src="https://ui-avatars.com/api/?background=8b5cf6&color=fff&bold=true&length=1&size=80" alt="Avatar 5">
            </div>
            <div class="avatar-option custom" @click="uploadCustomAvatar">
              <div class="custom-icon">📁</div>
              <span>Tải lên</span>
            </div>
          </div>
          <div class="avatar-url-input">
            <label>Hoặc nhập URL ảnh:</label>
            <input type="text" v-model="avatarUrl" placeholder="https://example.com/avatar.jpg">
            <button class="btn-primary btn-sm" @click="setCustomAvatar">Áp dụng</button>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showAvatarModal = false">Hủy</button>
          <button class="btn-primary" @click="saveAvatar">Lưu</button>
        </div>
      </div>
    </div>

    <!-- Toast message -->
    <div v-if="toast.show" :class="['toast-message', toast.type]">
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import api from '@/api/axios';

const authStore = useAuthStore();

// Tabs
const activeTab = ref('profile');
const tabs = [
  { key: 'profile', icon: '👤', label: 'Hồ sơ' },
  { key: 'appearance', icon: '🎨', label: 'Giao diện' },
  { key: 'notifications', icon: '🔔', label: 'Thông báo' }
];

// Profile form
const profileForm = reactive({
  fullName: '',
  email: '',
  phone: '',
  avatar: '',
  createdAt: ''
});

const profileSaving = ref(false);
const successMessage = ref('');
const errorMessage = ref('');
const defaultAvatar = 'https://ui-avatars.com/api/?background=6366f1&color=fff&bold=true&length=2';

// Appearance
const appearance = reactive({
  darkMode: localStorage.getItem('darkMode') === 'true',
  sidebarCollapsed: localStorage.getItem('sidebarCollapsed') === 'true',
  animations: localStorage.getItem('animations') !== 'false'
});

// Notifications
const notifications = reactive({
  newOrder: true,
  lowStock: true,
  email: false
});

// Modals
const showAvatarModal = ref(false);
const avatarUrl = ref('');

// Toast
const toast = ref({ show: false, message: '', type: 'success' });

// Display role
const displayRole = computed(() => {
  const role = authStore.role;
  const roles = { Admin: 'Quản trị viên', Sales: 'Nhân viên bán hàng', Warehouse: 'Thủ kho', User: 'Người dùng' };
  return roles[role] || role;
});

onMounted(() => {
  loadUserProfile();
  loadSettings();
});

function loadUserProfile() {
  // Lấy thông tin từ authStore và localStorage
  profileForm.fullName = authStore.fullName || localStorage.getItem('fullName') || '';
  profileForm.email = authStore.user?.email || '';
  profileForm.phone = authStore.user?.phone || '';
  profileForm.avatar = authStore.user?.avatar || localStorage.getItem('avatar') || '';
  profileForm.createdAt = authStore.user?.createdAt || new Date().toISOString();
}

function loadSettings() {
  const saved = localStorage.getItem('appSettings');
  if (saved) {
    try {
      const settings = JSON.parse(saved);
      if (settings.appearance) {
        appearance.darkMode = settings.appearance.darkMode ?? appearance.darkMode;
        appearance.sidebarCollapsed = settings.appearance.sidebarCollapsed ?? appearance.sidebarCollapsed;
        appearance.animations = settings.appearance.animations ?? appearance.animations;
      }
      if (settings.notifications) {
        notifications.newOrder = settings.notifications.newOrder ?? notifications.newOrder;
        notifications.lowStock = settings.notifications.lowStock ?? notifications.lowStock;
        notifications.email = settings.notifications.email ?? notifications.email;
      }
    } catch (e) {
      console.error('Error loading settings:', e);
    }
  }
  
  // Áp dụng dark mode nếu có
  if (appearance.darkMode) {
    document.body.classList.add('dark-mode');
  }
}

async function updateProfile() {
  successMessage.value = '';
  errorMessage.value = '';
  profileSaving.value = true;
  
  try {
    // Lấy userId từ localStorage hoặc authStore
    const userId = localStorage.getItem('userId');
    if (!userId) {
      errorMessage.value = 'Không tìm thấy thông tin người dùng!';
      return;
    }
    
    // Gọi API update user
    const updateData = {
      fullName: profileForm.fullName,
      phone: profileForm.phone,
      avatar: profileForm.avatar
    };
    
    const response = await api.put(`/users/${userId}`, updateData);
    
    // Cập nhật authStore và localStorage
    authStore.fullName = profileForm.fullName;
    localStorage.setItem('fullName', profileForm.fullName);
    if (profileForm.avatar) localStorage.setItem('avatar', profileForm.avatar);
    
    successMessage.value = 'Cập nhật thông tin thành công!';
    setTimeout(() => {
      successMessage.value = '';
    }, 3000);
  } catch (error) {
    console.error('Update error:', error);
    errorMessage.value = error.response?.data?.message || 'Cập nhật thất bại!';
    setTimeout(() => {
      errorMessage.value = '';
    }, 3000);
  } finally {
    profileSaving.value = false;
  }
}

function resetProfile() {
  loadUserProfile();
  showToast('Đã hủy thay đổi', 'info');
}

function toggleDarkMode() {
  if (appearance.darkMode) {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
  saveSettings();
  showToast(appearance.darkMode ? 'Đã bật chế độ tối' : 'Đã tắt chế độ tối', 'success');
}

function toggleSidebar() {
  window.dispatchEvent(new CustomEvent('toggle-sidebar', { detail: appearance.sidebarCollapsed }));
  saveSettings();
}

function saveSettings() {
  const settings = { appearance, notifications };
  localStorage.setItem('appSettings', JSON.stringify(settings));
  localStorage.setItem('darkMode', appearance.darkMode);
  localStorage.setItem('sidebarCollapsed', appearance.sidebarCollapsed);
  localStorage.setItem('animations', appearance.animations);
}

function openAvatarModal() {
  avatarUrl.value = profileForm.avatar;
  showAvatarModal.value = true;
}

function selectAvatar(index) {
  const colors = ['6366f1', '10b981', 'f59e0b', 'ef4444', '8b5cf6'];
  avatarUrl.value = `https://ui-avatars.com/api/?background=${colors[index - 1]}&color=fff&bold=true&length=2&size=80`;
}

function uploadCustomAvatar() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        avatarUrl.value = ev.target.result;
      };
      reader.readAsDataURL(file);
    }
  };
  input.click();
}

function setCustomAvatar() {
  profileForm.avatar = avatarUrl.value;
  showAvatarModal.value = false;
  showToast('Đã cập nhật ảnh đại diện!', 'success');
}

function saveAvatar() {
  profileForm.avatar = avatarUrl.value;
  showAvatarModal.value = false;
  showToast('Đã lưu ảnh đại diện!', 'success');
}

function showToast(message, type = 'success') {
  toast.value = { show: true, message, type };
  setTimeout(() => {
    toast.value.show = false;
  }, 3000);
}

function formatDate(dateString) {
  if (!dateString) return '--/--/----';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN');
}
</script>

<style scoped>
.settings-container {
  padding: 24px;
  background: #f0f2f5;
  min-height: 100vh;
}

.settings-header {
  margin-bottom: 24px;
}

.settings-title {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
}

.settings-subtitle {
  color: #64748b;
  font-size: 14px;
}

.settings-grid {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 24px;
}

/* Sidebar Navigation */
.settings-sidebar {
  background: white;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  height: fit-content;
}

.settings-nav {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: none;
  background: transparent;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  text-align: left;
}

.nav-item:hover {
  background: #f1f5f9;
  color: #6366f1;
}

.nav-item.active {
  background: #eef2ff;
  color: #6366f1;
}

.nav-icon {
  font-size: 20px;
}

/* Content Panel */
.settings-content {
  background: white;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.settings-panel {
  animation: fadeIn 0.3s ease;
}

.panel-header {
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
}

.panel-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 4px;
}

.panel-header p {
  font-size: 13px;
  color: #64748b;
  margin: 0;
}

.panel-body {
  padding: 24px;
}

/* Form Styles */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #334155;
}

.form-control {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-control:disabled {
  background: #f8fafc;
  cursor: not-allowed;
}

/* Avatar Upload */
.avatar-group {
  text-align: center;
}

.avatar-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-preview {
  position: relative;
  display: inline-block;
}

.avatar-preview img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #6366f1;
}

.avatar-edit {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 32px;
  height: 32px;
  background: #6366f1;
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.avatar-hint {
  font-size: 12px;
  color: #64748b;
  margin-top: 8px;
}

/* Setting Items */
.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #f1f5f9;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-info h4 {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 4px;
}

.setting-info p {
  font-size: 13px;
  color: #64748b;
  margin: 0;
}

/* Toggle Switch */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 26px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #cbd5e1;
  transition: 0.3s;
  border-radius: 34px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: #6366f1;
}

input:checked + .toggle-slider:before {
  transform: translateX(24px);
}

/* Buttons */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.btn-primary, .btn-secondary {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
}

.btn-secondary:hover {
  background: #e2e8f0;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

/* Alerts */
.alert {
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
}

.alert-success {
  background: #d1fae5;
  color: #065f46;
  border-left: 3px solid #10b981;
}

.alert-danger {
  background: #fee2e2;
  color: #b91c1c;
  border-left: 3px solid #ef4444;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  background: white;
  border-radius: 16px;
  width: 500px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #94a3b8;
}

.modal-body {
  padding: 24px;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* Avatar Options */
.avatar-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.avatar-option {
  cursor: pointer;
  text-align: center;
  padding: 8px;
  border-radius: 12px;
  transition: all 0.2s;
}

.avatar-option:hover {
  background: #f1f5f9;
}

.avatar-option img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-option.custom {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.custom-icon {
  width: 80px;
  height: 80px;
  background: #f1f5f9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
}

.avatar-url-input {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.avatar-url-input label {
  white-space: nowrap;
  font-size: 13px;
  color: #64748b;
}

.avatar-url-input input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

/* Toast */
.toast-message {
  position: fixed;
  bottom: 24px;
  right: 24px;
  padding: 12px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  z-index: 1100;
  animation: slideIn 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.toast-message.success {
  background: #10b981;
  color: white;
}

.toast-message.info {
  background: #6366f1;
  color: white;
}

.toast-message.error {
  background: #ef4444;
  color: white;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

/* Responsive */
@media (max-width: 768px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }
  
  .settings-sidebar {
    order: 2;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 0;
  }
  
  .avatar-options {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .avatar-url-input {
    flex-direction: column;
    align-items: stretch;
  }
  
  .toast-message {
    bottom: 16px;
    right: 16px;
    left: 16px;
    text-align: center;
  }
}
</style>