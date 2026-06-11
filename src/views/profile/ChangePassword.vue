<template>
  <div class="change-password-container">
    <div class="page-header">
      <h1 class="page-title">🔐 Đổi mật khẩu</h1>
      <p class="page-subtitle">Cập nhật mật khẩu để bảo vệ tài khoản của bạn</p>
    </div>

    <div class="row">
      <!-- Form đổi mật khẩu -->
      <div class="col-md-7">
        <div class="card">
          <div class="card-header">
            <h3>Thông tin mật khẩu</h3>
          </div>
          <div class="card-body">
            <form @submit.prevent="handleChangePassword">
              <!-- Mật khẩu cũ -->
              <div class="form-group">
                <label>Mật khẩu hiện tại <span class="text-danger">*</span></label>
                <div class="input-group">
                  <span class="input-group-icon">🔒</span>
                  <input 
                    :type="showOldPassword ? 'text' : 'password'" 
                    v-model="formData.oldPassword"
                    class="form-control"
                    placeholder="Nhập mật khẩu hiện tại"
                    required
                  >
                  <button type="button" class="input-group-btn" @click="showOldPassword = !showOldPassword">
                    {{ showOldPassword ? '🙈' : '👁️' }}
                  </button>
                </div>
              </div>

              <!-- Mật khẩu mới -->
              <div class="form-group">
                <label>Mật khẩu mới <span class="text-danger">*</span></label>
                <div class="input-group">
                  <span class="input-group-icon">🔐</span>
                  <input 
                    :type="showNewPassword ? 'text' : 'password'" 
                    v-model="formData.newPassword"
                    class="form-control"
                    placeholder="Nhập mật khẩu mới"
                    required
                    @input="checkPasswordStrength"
                  >
                  <button type="button" class="input-group-btn" @click="showNewPassword = !showNewPassword">
                    {{ showNewPassword ? '🙈' : '👁️' }}
                  </button>
                </div>
                
                <!-- Độ mạnh mật khẩu -->
                <div v-if="formData.newPassword" class="password-strength mt-2">
                  <div class="strength-bar">
                    <div class="strength-level" :class="passwordStrength.class" :style="{ width: passwordStrength.percent + '%' }"></div>
                  </div>
                  <span class="strength-text" :class="passwordStrength.class">{{ passwordStrength.text }}</span>
                </div>
                
                <!-- Yêu cầu mật khẩu -->
                <div class="password-requirements mt-2">
                  <div class="requirement-item" :class="{ met: formData.newPassword.length >= 6 }">
                    <span class="req-icon">✓</span>
                    <span class="req-text">Ít nhất 6 ký tự</span>
                  </div>
                  <div class="requirement-item" :class="{ met: hasSpecialChar }">
                    <span class="req-icon">✓</span>
                    <span class="req-text">Ít nhất 1 ký tự đặc biệt (!@#$%^&*)</span>
                  </div>
                  <div class="requirement-item" :class="{ met: hasUpperCase }">
                    <span class="req-icon">✓</span>
                    <span class="req-text">Ít nhất 1 chữ hoa</span>
                  </div>
                  <div class="requirement-item" :class="{ met: hasNumber }">
                    <span class="req-icon">✓</span>
                    <span class="req-text">Ít nhất 1 số</span>
                  </div>
                </div>
              </div>

              <!-- Xác nhận mật khẩu mới -->
              <div class="form-group">
                <label>Xác nhận mật khẩu mới <span class="text-danger">*</span></label>
                <div class="input-group">
                  <span class="input-group-icon">✅</span>
                  <input 
                    :type="showConfirmPassword ? 'text' : 'password'" 
                    v-model="formData.confirmNewPassword"
                    class="form-control"
                    placeholder="Xác nhận mật khẩu mới"
                    required
                  >
                  <button type="button" class="input-group-btn" @click="showConfirmPassword = !showConfirmPassword">
                    {{ showConfirmPassword ? '🙈' : '👁️' }}
                  </button>
                </div>
                <div v-if="formData.confirmNewPassword && formData.newPassword !== formData.confirmNewPassword" class="error-hint">
                  ⚠️ Mật khẩu xác nhận không khớp
                </div>
              </div>

              <!-- Thông báo -->
              <div v-if="errorMessage" class="alert alert-danger">
                <span>⚠️</span> {{ errorMessage }}
              </div>
              <div v-if="successMessage" class="alert alert-success">
                <span>✅</span> {{ successMessage }}
              </div>

              <!-- Nút hành động -->
              <div class="form-actions">
                <button type="button" class="btn btn-secondary" @click="resetForm">Hủy bỏ</button>
                <button type="submit" class="btn btn-primary" :disabled="loading">
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                  {{ loading ? 'Đang xử lý...' : 'Đổi mật khẩu' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Tips bảo mật -->
      <div class="col-md-5">
        <div class="tips-card">
          <div class="tips-header">
            <span class="tips-icon">💡</span>
            <h3>Mẹo bảo mật</h3>
          </div>
          <div class="tips-body">
            <div class="tip-item">
              <div class="tip-icon">🔒</div>
              <div class="tip-content">
                <h4>Không chia sẻ mật khẩu</h4>
                <p>Không bao giờ chia sẻ mật khẩu với bất kỳ ai, kể cả nhân viên hỗ trợ</p>
              </div>
            </div>
            <div class="tip-item">
              <div class="tip-icon">🔄</div>
              <div class="tip-content">
                <h4>Đổi mật khẩu định kỳ</h4>
                <p>Nên đổi mật khẩu mỗi 3 tháng để tăng cường bảo mật</p>
              </div>
            </div>
            <div class="tip-item">
              <div class="tip-icon">🔐</div>
              <div class="tip-content">
                <h4>Sử dụng mật khẩu mạnh</h4>
                <p>Kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt</p>
              </div>
            </div>
            <div class="tip-item">
              <div class="tip-icon">🚫</div>
              <div class="tip-content">
                <h4>Không dùng chung mật khẩu</h4>
                <p>Mỗi tài khoản nên có một mật khẩu riêng biệt</p>
              </div>
            </div>
            <div class="tip-item">
              <div class="tip-icon">📱</div>
              <div class="tip-content">
                <h4>Bật xác thực 2 lớp</h4>
                <p>Tăng cường bảo mật với xác thực 2 yếu tố</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Thông tin phiên đăng nhập -->
        <div class="session-card">
          <div class="session-header">
            <span class="session-icon">🖥️</span>
            <h3>Phiên đăng nhập hiện tại</h3>
          </div>
          <div class="session-body">
            <div class="session-item">
              <div class="session-device">💻 Desktop - Windows</div>
              <div class="session-time">Đang hoạt động</div>
              <span class="session-badge active">Hiện tại</span>
            </div>
            <div class="session-item">
              <div class="session-device">📱 Mobile - iPhone</div>
              <div class="session-time">2 giờ trước</div>
              <span class="session-badge">Không hoạt động</span>
            </div>
          </div>
          <button class="btn-logout-all">Đăng xuất tất cả thiết bị</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import api from '@/api/axios';

const loading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

// Form data
const formData = ref({
  oldPassword: '',
  newPassword: '',
  confirmNewPassword: ''
});

// Show/hide password
const showOldPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

// Password strength indicators
const hasSpecialChar = computed(() => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.value.newPassword));
const hasUpperCase = computed(() => /[A-Z]/.test(formData.value.newPassword));
const hasNumber = computed(() => /[0-9]/.test(formData.value.newPassword));

const passwordStrength = computed(() => {
  const pwd = formData.value.newPassword;
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
  return formData.value.newPassword.length >= 6 && 
         hasSpecialChar.value && 
         hasUpperCase.value && 
         hasNumber.value;
});

// Methods
async function handleChangePassword() {
  errorMessage.value = '';
  successMessage.value = '';
  
  // Validate
  if (!formData.value.oldPassword) {
    errorMessage.value = 'Vui lòng nhập mật khẩu hiện tại!';
    return;
  }
  
  if (!isPasswordValid.value) {
    errorMessage.value = 'Vui lòng đáp ứng tất cả yêu cầu về mật khẩu mới!';
    return;
  }
  
  if (formData.value.newPassword !== formData.value.confirmNewPassword) {
    errorMessage.value = 'Mật khẩu xác nhận không khớp!';
    return;
  }
  
  if (formData.value.oldPassword === formData.value.newPassword) {
    errorMessage.value = 'Mật khẩu mới không được trùng với mật khẩu cũ!';
    return;
  }
  
  loading.value = true;
  
  try {
    const response = await api.post('/users/change-password', {
      oldPassword: formData.value.oldPassword,
      newPassword: formData.value.newPassword,
      confirmNewPassword: formData.value.confirmNewPassword
    });
    
    successMessage.value = response.data.message || 'Đổi mật khẩu thành công!';
    resetForm();
    
    // Tự động reset success message sau 3 giây
    setTimeout(() => {
      successMessage.value = '';
    }, 3000);
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Đổi mật khẩu thất bại!';
  } finally {
    loading.value = false;
  }
}

function resetForm() {
  formData.value = {
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  };
  showOldPassword.value = false;
  showNewPassword.value = false;
  showConfirmPassword.value = false;
}

function checkPasswordStrength() {
  // Trigger computed properties
}
</script>

<style scoped>
.change-password-container {
  padding: 24px;
  background: #f0f2f5;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
}

.page-subtitle {
  color: #64748b;
  font-size: 14px;
}

/* Card Styles */
.card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 24px;
}

.card-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.card-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.card-body {
  padding: 24px;
}

/* Form Styles */
.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.input-group {
  position: relative;
  display: flex;
  align-items: center;
}

.input-group-icon {
  position: absolute;
  left: 14px;
  font-size: 18px;
  color: #94a3b8;
}

.form-control {
  width: 100%;
  padding: 12px 44px 12px 44px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 14px;
  transition: all 0.3s;
  background: #f8fafc;
}

.form-control:focus {
  outline: none;
  border-color: #6366f1;
  background: white;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.input-group-btn {
  position: absolute;
  right: 14px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  color: #94a3b8;
  padding: 0;
}

/* Password Strength */
.password-strength {
  margin-bottom: 8px;
}

.strength-bar {
  height: 4px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 4px;
}

.strength-level {
  height: 100%;
  transition: all 0.3s;
}

.strength-level.weak { background: #ef4444; }
.strength-level.medium { background: #f59e0b; }
.strength-level.strong { background: #10b981; }

.strength-text {
  font-size: 12px;
}

.strength-text.weak { color: #ef4444; }
.strength-text.medium { color: #f59e0b; }
.strength-text.strong { color: #10b981; }

/* Password Requirements */
.password-requirements {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 8px;
}

.requirement-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #94a3b8;
}

.requirement-item.met {
  color: #10b981;
}

.requirement-item .req-icon {
  font-size: 10px;
}

.error-hint {
  font-size: 11px;
  color: #ef4444;
  margin-top: 4px;
}

/* Alert Messages */
.alert {
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.alert-danger {
  background: #fee2e2;
  border-left: 3px solid #ef4444;
  color: #b91c1c;
}

.alert-success {
  background: #d1fae5;
  border-left: 3px solid #10b981;
  color: #065f46;
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 28px;
}

.btn {
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}

.btn-secondary {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #475569;
}

.btn-secondary:hover {
  background: #e2e8f0;
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

/* Tips Card */
.tips-card, .session-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 24px;
}

.tips-header, .session-header {
  padding: 20px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  gap: 12px;
}

.tips-icon, .session-icon {
  font-size: 28px;
}

.tips-header h3, .session-header h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.tips-body {
  padding: 20px 24px;
}

.tip-item {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.tip-item:last-child {
  margin-bottom: 0;
}

.tip-icon {
  font-size: 24px;
}

.tip-content h4 {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
}

.tip-content p {
  font-size: 12px;
  color: #64748b;
  margin: 0;
}

/* Session Card */
.session-body {
  padding: 20px 24px;
}

.session-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #e2e8f0;
}

.session-item:last-child {
  border-bottom: none;
}

.session-device {
  font-weight: 500;
  font-size: 14px;
  color: #1e293b;
}

.session-time {
  font-size: 12px;
  color: #64748b;
}

.session-badge {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 20px;
  background: #f1f5f9;
  color: #64748b;
}

.session-badge.active {
  background: #d1fae5;
  color: #065f46;
}

.btn-logout-all {
  width: calc(100% - 48px);
  margin: 0 24px 24px;
  padding: 10px;
  background: #fee2e2;
  border: none;
  border-radius: 10px;
  color: #dc2626;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-logout-all:hover {
  background: #fecaca;
}

/* Grid System */
.row {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -12px;
}

.col-md-7, .col-md-5 {
  padding: 0 12px;
}

.col-md-7 {
  width: 58.33%;
}

.col-md-5 {
  width: 41.66%;
}

.text-danger {
  color: #ef4444;
}

.mt-2 {
  margin-top: 8px;
}

.me-2 {
  margin-right: 8px;
}

/* Responsive */
@media (max-width: 768px) {
  .col-md-7, .col-md-5 {
    width: 100%;
  }
  
  .change-password-container {
    padding: 16px;
  }
  
  .password-requirements {
    flex-direction: column;
    gap: 4px;
  }
}
</style>