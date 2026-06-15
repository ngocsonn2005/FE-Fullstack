<template>
  <div class="settings-container">
    <!-- Header -->
    <div class="settings-header">
      <div class="header-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      </div>
      <div class="header-text">
        <h1 class="settings-title">Cài đặt hệ thống</h1>
        <p class="settings-subtitle">Quản lý thông tin cá nhân và tùy chỉnh giao diện</p>
      </div>
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
            <span class="nav-icon" v-html="tab.icon"></span>
            <span class="nav-text">{{ tab.label }}</span>
          </button>
        </div>
      </div>

      <!-- Right Content - Settings Panels -->
      <div class="settings-content">
        <!-- Profile Settings -->
        <div v-if="activeTab === 'profile'" class="settings-panel">
          <div class="panel-header">
            <h2>Thông tin cá nhân</h2>
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
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                      </svg>
                    </button>
                  </div>
                  <p class="avatar-hint">Nhấp vào biểu tượng bút để thay đổi ảnh đại diện</p>
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
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                {{ successMessage }}
              </div>
              <div class="alert alert-danger" v-if="errorMessage">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {{ errorMessage }}
              </div>

              <div class="form-actions">
                <button type="button" class="btn-secondary" @click="resetProfile">Hủy bỏ</button>
                <button type="submit" class="btn-primary" :disabled="profileSaving">
                  {{ profileSaving ? 'Đang lưu...' : 'Lưu thay đổi' }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Change Password Settings -->
        <div v-if="activeTab === 'password'" class="settings-panel">
          <div class="panel-header">
            <h2>Đổi mật khẩu</h2>
            <p>Cập nhật mật khẩu để bảo vệ tài khoản của bạn</p>
          </div>
          <div class="panel-body">
            <form @submit.prevent="handleChangePassword">
              <!-- Mật khẩu cũ -->
              <div class="form-group">
                <label>Mật khẩu hiện tại <span class="text-danger">*</span></label>
                <div class="input-group-custom">
                  <span class="input-group-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </span>
                  <input 
                    :type="showOldPassword ? 'text' : 'password'" 
                    v-model="passwordForm.oldPassword"
                    class="form-control"
                    placeholder="Nhập mật khẩu hiện tại"
                    required
                  >
                  <button type="button" class="input-group-btn" @click="showOldPassword = !showOldPassword">
                    <svg v-if="!showOldPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Mật khẩu mới -->
              <div class="form-group">
                <label>Mật khẩu mới <span class="text-danger">*</span></label>
                <div class="input-group-custom">
                  <span class="input-group-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </span>
                  <input 
                    :type="showNewPassword ? 'text' : 'password'" 
                    v-model="passwordForm.newPassword"
                    class="form-control"
                    placeholder="Nhập mật khẩu mới"
                    required
                    @input="checkPasswordStrength"
                  >
                  <button type="button" class="input-group-btn" @click="showNewPassword = !showNewPassword">
                    <svg v-if="!showNewPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  </button>
                </div>
                
                <!-- Password Strength -->
                <div v-if="passwordForm.newPassword" class="password-strength mt-2">
                  <div class="strength-bar">
                    <div class="strength-level" :class="passwordStrength.class" :style="{ width: passwordStrength.percent + '%' }"></div>
                  </div>
                  <span class="strength-text" :class="passwordStrength.class">{{ passwordStrength.text }}</span>
                </div>
                
                <!-- Password Requirements -->
                <div class="password-requirements mt-2">
                  <div class="requirement-item" :class="{ met: passwordForm.newPassword.length >= 6 }">
                    <span class="req-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </span>
                    <span class="req-text">Ít nhất 6 ký tự</span>
                  </div>
                  <div class="requirement-item" :class="{ met: hasSpecialChar }">
                    <span class="req-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </span>
                    <span class="req-text">Ít nhất 1 ký tự đặc biệt</span>
                  </div>
                  <div class="requirement-item" :class="{ met: hasUpperCase }">
                    <span class="req-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </span>
                    <span class="req-text">Ít nhất 1 chữ hoa</span>
                  </div>
                  <div class="requirement-item" :class="{ met: hasNumber }">
                    <span class="req-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </span>
                    <span class="req-text">Ít nhất 1 số</span>
                  </div>
                </div>
              </div>

              <!-- Xác nhận mật khẩu mới -->
              <div class="form-group">
                <label>Xác nhận mật khẩu mới <span class="text-danger">*</span></label>
                <div class="input-group-custom">
                  <span class="input-group-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </span>
                  <input 
                    :type="showConfirmPassword ? 'text' : 'password'" 
                    v-model="passwordForm.confirmNewPassword"
                    class="form-control"
                    placeholder="Xác nhận mật khẩu mới"
                    required
                  >
                  <button type="button" class="input-group-btn" @click="showConfirmPassword = !showConfirmPassword">
                    <svg v-if="!showConfirmPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  </button>
                </div>
                <div v-if="passwordForm.confirmNewPassword && passwordForm.newPassword !== passwordForm.confirmNewPassword" class="error-hint">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  Mật khẩu xác nhận không khớp
                </div>
              </div>

              <!-- Thông báo -->
              <div v-if="passwordErrorMessage" class="alert alert-danger">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {{ passwordErrorMessage }}
              </div>
              <div v-if="passwordSuccessMessage" class="alert alert-success">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                {{ passwordSuccessMessage }}
              </div>

              <div class="form-actions">
                <button type="button" class="btn-secondary" @click="resetPasswordForm">Hủy bỏ</button>
                <button type="submit" class="btn-primary" :disabled="passwordSaving">
                  {{ passwordSaving ? 'Đang xử lý...' : 'Đổi mật khẩu' }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Appearance Settings -->
        <div v-if="activeTab === 'appearance'" class="settings-panel">
          <div class="panel-header">
            <h2>Giao diện</h2>
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
            <h2>Thông báo</h2>
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
          <h3>Đổi ảnh đại diện</h3>
          <button class="close-btn" @click="showAvatarModal = false">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="avatar-options">
            <div v-for="i in 5" :key="i" class="avatar-option" @click="selectAvatar(i)">
              <img :src="`https://ui-avatars.com/api/?background=${colors[i-1]}&color=fff&bold=true&length=2&size=80`" :alt="`Avatar ${i}`">
            </div>
            <div class="avatar-option custom" @click="uploadCustomAvatar">
              <div class="custom-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
              </div>
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
          <button class="btn-secondary" @click="showAvatarModal = false">Hủy bỏ</button>
          <button class="btn-primary" @click="saveAvatar">Lưu</button>
        </div>
      </div>
    </div>

    <!-- Toast message -->
    <div v-if="toast.show" :class="['toast-message', toast.type]">
      <svg v-if="toast.type === 'success'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
      <svg v-else-if="toast.type === 'error'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import api from '@/api/axios';

const authStore = useAuthStore();

// Tabs
const activeTab = ref('profile');
const tabs = [
  { key: 'profile', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>', label: 'Hồ sơ' },
  { key: 'password', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>', label: 'Mật khẩu' },
  { key: 'appearance', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>', label: 'Giao diện' },
  { key: 'notifications', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>', label: 'Thông báo' }
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

// Password form
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmNewPassword: ''
});

const passwordSaving = ref(false);
const passwordErrorMessage = ref('');
const passwordSuccessMessage = ref('');

// Show/hide password
const showOldPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

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
const colors = ['6366f1', '10b981', 'f59e0b', 'ef4444', '8b5cf6'];

// Toast
const toast = ref({ show: false, message: '', type: 'success' });

// Display role
const displayRole = computed(() => {
  const role = authStore.role;
  const roles = { Admin: 'Quản trị viên', Sales: 'Nhân viên bán hàng', Warehouse: 'Thủ kho', User: 'Người dùng' };
  return roles[role] || role;
});

// Password strength indicators
const hasSpecialChar = computed(() => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(passwordForm.newPassword));
const hasUpperCase = computed(() => /[A-Z]/.test(passwordForm.newPassword));
const hasNumber = computed(() => /[0-9]/.test(passwordForm.newPassword));

const passwordStrength = computed(() => {
  const pwd = passwordForm.newPassword;
  if (!pwd) return { class: '', text: '', percent: 0 };
  
  let strength = 0;
  if (pwd.length >= 6) strength++;
  if (hasSpecialChar.value) strength++;
  if (hasUpperCase.value) strength++;
  if (hasNumber.value) strength++;
  
  const percent = (strength / 4) * 100;
  
  if (strength <= 2) return { class: 'weak', text: 'Yếu', percent: percent };
  if (strength === 3) return { class: 'medium', text: 'Trung bình', percent: percent };
  return { class: 'strong', text: 'Mạnh', percent: percent };
});

const isPasswordValid = computed(() => {
  return passwordForm.newPassword.length >= 6 && 
         hasSpecialChar.value && 
         hasUpperCase.value && 
         hasNumber.value;
});

onMounted(() => {
  loadUserProfile();
  loadSettings();
});

function loadUserProfile() {
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
  
  if (appearance.darkMode) {
    document.body.classList.add('dark-mode');
  }
}

async function updateProfile() {
  successMessage.value = '';
  errorMessage.value = '';
  profileSaving.value = true;
  
  try {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      errorMessage.value = 'Không tìm thấy thông tin người dùng!';
      return;
    }
    
    const updateData = {
      fullName: profileForm.fullName,
      phone: profileForm.phone,
      avatar: profileForm.avatar
    };
    
    await api.put(`/users/${userId}`, updateData);
    
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

async function handleChangePassword() {
  passwordErrorMessage.value = '';
  passwordSuccessMessage.value = '';
  
  // Validate
  if (!passwordForm.oldPassword) {
    passwordErrorMessage.value = 'Vui lòng nhập mật khẩu hiện tại!';
    return;
  }
  
  if (!isPasswordValid.value) {
    passwordErrorMessage.value = 'Vui lòng đáp ứng tất cả yêu cầu về mật khẩu mới!';
    return;
  }
  
  if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
    passwordErrorMessage.value = 'Mật khẩu xác nhận không khớp!';
    return;
  }
  
  if (passwordForm.oldPassword === passwordForm.newPassword) {
    passwordErrorMessage.value = 'Mật khẩu mới không được trùng với mật khẩu cũ!';
    return;
  }
  
  passwordSaving.value = true;
  
  try {
    const response = await api.post('/users/change-password', {
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword,
      confirmNewPassword: passwordForm.confirmNewPassword
    });
    
    passwordSuccessMessage.value = response.data.message || 'Đổi mật khẩu thành công!';
    resetPasswordForm();
    
    setTimeout(() => {
      passwordSuccessMessage.value = '';
    }, 3000);
  } catch (error) {
    passwordErrorMessage.value = error.response?.data?.message || 'Đổi mật khẩu thất bại!';
  } finally {
    passwordSaving.value = false;
  }
}

function resetPasswordForm() {
  passwordForm.oldPassword = '';
  passwordForm.newPassword = '';
  passwordForm.confirmNewPassword = '';
  showOldPassword.value = false;
  showNewPassword.value = false;
  showConfirmPassword.value = false;
}

function checkPasswordStrength() {
  // Trigger computed properties
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
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.settings-container {
  padding: 24px;
  background: #f0f2f5;
  min-height: 100vh;
}

/* Header */
.settings-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding: 20px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  color: white;
}

.header-icon {
  width: 48px;
  height: 48px;
  background: rgba(255,255,255,0.2);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-icon svg {
  width: 28px;
  height: 28px;
  color: white;
}

.header-text {
  flex: 1;
}

.settings-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 4px;
}

.settings-subtitle {
  font-size: 14px;
  opacity: 0.85;
}

/* Settings Grid */
.settings-grid {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 24px;
}

/* Sidebar Navigation */
.settings-sidebar {
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
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
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(79, 70, 229, 0.08));
  color: #6366f1;
}

.nav-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-icon svg {
  width: 18px;
  height: 18px;
}

/* Content Panel */
.settings-content {
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
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
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #334155;
}

.form-control {
  width: 100%;
  padding: 12px 16px;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
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
  color: #64748b;
}

/* Input Group */
.input-group-custom {
  position: relative;
  display: flex;
  align-items: center;
}

.input-group-icon {
  position: absolute;
  left: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.input-group-icon svg {
  width: 18px;
  height: 18px;
  color: #94a3b8;
}

.input-group-custom .form-control {
  padding-left: 44px;
  padding-right: 44px;
}

.input-group-btn {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.input-group-btn svg {
  width: 20px;
  height: 20px;
  color: #94a3b8;
}

.input-group-btn:hover svg {
  color: #6366f1;
}

/* Password Strength */
.password-strength {
  margin-top: 12px;
}

.strength-bar {
  height: 4px;
  background: #e2e8f0;
  border-radius: 2px;
  overflow: hidden;
}

.strength-level {
  height: 100%;
  transition: width 0.3s;
}

.strength-level.weak { background: #ef4444; }
.strength-level.medium { background: #f59e0b; }
.strength-level.strong { background: #10b981; }

.strength-text {
  font-size: 12px;
  margin-top: 6px;
  display: inline-block;
}

.strength-text.weak { color: #ef4444; }
.strength-text.medium { color: #f59e0b; }
.strength-text.strong { color: #10b981; }

/* Password Requirements */
.password-requirements {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 12px;
}

.requirement-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #94a3b8;
  transition: color 0.2s;
}

.requirement-item.met {
  color: #10b981;
}

.requirement-item .req-icon svg {
  width: 12px;
  height: 12px;
}

.requirement-item.met .req-icon svg {
  stroke: #10b981;
}

.error-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #ef4444;
  margin-top: 8px;
}

.error-hint svg {
  width: 14px;
  height: 14px;
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
  bottom: 4px;
  right: 4px;
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
  transition: all 0.2s;
}

.avatar-edit:hover {
  transform: scale(1.1);
  background: #4f46e5;
}

.avatar-edit svg {
  width: 16px;
  height: 16px;
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
  padding: 10px 24px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
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
  padding: 8px 16px;
  font-size: 12px;
}

/* Alerts */
.alert {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 12px;
  margin-bottom: 20px;
  font-size: 14px;
}

.alert svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.alert-success {
  background: #d1fae5;
  color: #065f46;
  border-left: 3px solid #10b981;
}

.alert-success svg {
  stroke: #10b981;
}

.alert-danger {
  background: #fee2e2;
  color: #b91c1c;
  border-left: 3px solid #ef4444;
}

.alert-danger svg {
  stroke: #ef4444;
}

.text-danger {
  color: #ef4444;
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
  backdrop-filter: blur(4px);
}

.modal-container {
  background: white;
  border-radius: 20px;
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
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn svg {
  width: 20px;
  height: 20px;
  color: #94a3b8;
}

.close-btn:hover svg {
  color: #475569;
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
  padding: 12px;
  border-radius: 16px;
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
}

.custom-icon svg {
  width: 32px;
  height: 32px;
  color: #94a3b8;
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
  padding: 10px 12px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 13px;
}

.avatar-url-input input:focus {
  outline: none;
  border-color: #6366f1;
}

/* Toast */
.toast-message {
  position: fixed;
  bottom: 24px;
  right: 24px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  z-index: 1100;
  animation: slideIn 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

.toast-message svg {
  width: 18px;
  height: 18px;
}

.toast-message.success {
  background: #10b981;
  color: white;
}

.toast-message.success svg {
  stroke: white;
}

.toast-message.info {
  background: #6366f1;
  color: white;
}

.toast-message.error {
  background: #ef4444;
  color: white;
}

.mt-2 {
  margin-top: 8px;
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
  .settings-container {
    padding: 16px;
  }
  
  .settings-grid {
    grid-template-columns: 1fr;
  }
  
  .settings-header {
    flex-direction: column;
    text-align: center;
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
    justify-content: center;
  }
  
  .form-actions {
    flex-direction: column-reverse;
  }
  
  .form-actions button {
    width: 100%;
  }
}
</style>