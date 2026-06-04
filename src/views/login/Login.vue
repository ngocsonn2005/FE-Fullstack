<template>
  <div class="login-wrapper">
    <div class="login-container">
      <!-- Card chuyển đổi -->
      <div class="auth-card">
        <div class="auth-header">
          <div class="logo">
            <span class="logo-icon">🏢</span>
            <span class="logo-text">Microservices Dashboard</span>
          </div>
          <div class="auth-tabs">
            <button 
              class="tab-btn" 
              :class="{ active: activeTab === 'login' }"
              @click="activeTab = 'login'"
            >
              Đăng nhập
            </button>
            <button 
              class="tab-btn" 
              :class="{ active: activeTab === 'register' }"
              @click="activeTab = 'register'"
            >
              Đăng ký
            </button>
          </div>
        </div>

        <!-- FORM ĐĂNG NHẬP -->
        <form v-if="activeTab === 'login'" @submit.prevent="handleLogin" class="auth-form">
          <div class="form-group">
            <label>Tên đăng nhập</label>
            <input 
              type="text" 
              v-model="loginForm.username" 
              placeholder="Nhập tên đăng nhập"
              required
            >
            <span class="input-icon">👤</span>
          </div>

          <div class="form-group">
            <label>Mật khẩu</label>
            <input 
              :type="showPassword ? 'text' : 'password'" 
              v-model="loginForm.password" 
              placeholder="Nhập mật khẩu"
              required
            >
            <span class="input-icon">🔒</span>
            <button type="button" class="toggle-password" @click="showPassword = !showPassword">
              {{ showPassword ? '🙈' : '👁️' }}
            </button>
          </div>

          <div class="form-options">
            <label class="checkbox">
              <input type="checkbox" v-model="rememberMe"> Ghi nhớ đăng nhập
            </label>
            <a href="#" class="forgot-link">Quên mật khẩu?</a>
          </div>

          <button type="submit" class="btn-login" :disabled="loading">
            {{ loading ? 'Đang xử lý...' : 'Đăng nhập' }}
          </button>
        </form>

        <!-- FORM ĐĂNG KÝ -->
        <form v-else @submit.prevent="handleRegister" class="auth-form">
          <div class="form-row">
            <div class="form-group half">
              <label>Họ và tên *</label>
              <input 
                type="text" 
                v-model="registerForm.fullName" 
                placeholder="Nhập họ tên"
                required
              >
            </div>
            <div class="form-group half">
              <label>Tên đăng nhập *</label>
              <input 
                type="text" 
                v-model="registerForm.username" 
                placeholder="Nhập tên đăng nhập"
                required
              >
            </div>
          </div>

          <div class="form-row">
            <div class="form-group half">
              <label>Email</label>
              <input 
                type="email" 
                v-model="registerForm.email" 
                placeholder="example@email.com"
              >
            </div>
            <div class="form-group half">
              <label>Số điện thoại</label>
              <input 
                type="tel" 
                v-model="registerForm.phone" 
                placeholder="0912345678"
              >
            </div>
          </div>

          <div class="form-row">
            <div class="form-group half">
              <label>Mật khẩu *</label>
              <input 
                :type="showRegPassword ? 'text' : 'password'" 
                v-model="registerForm.password" 
                placeholder="Nhập mật khẩu"
                required
              >
              <button type="button" class="toggle-password" @click="showRegPassword = !showRegPassword">
                {{ showRegPassword ? '🙈' : '👁️' }}
              </button>
            </div>
            <div class="form-group half">
              <label>Xác nhận mật khẩu *</label>
              <input 
                :type="showRegConfirm ? 'text' : 'password'" 
                v-model="registerForm.confirmPassword" 
                placeholder="Xác nhận mật khẩu"
                required
              >
              <button type="button" class="toggle-password" @click="showRegConfirm = !showRegConfirm">
                {{ showRegConfirm ? '🙈' : '👁️' }}
              </button>
            </div>
          </div>

          <div class="form-group">
            <label class="checkbox">
              <input type="checkbox" v-model="agreeTerms" required>
              <span>Tôi đồng ý với <a href="#">Điều khoản sử dụng</a></span>
            </label>
          </div>

          <button type="submit" class="btn-register" :disabled="registering">
            {{ registering ? 'Đang xử lý...' : 'Đăng ký' }}
          </button>
        </form>

        <!-- Thông báo lỗi -->
        <div v-if="errorMessage" class="error-message">
          <span>⚠️</span> {{ errorMessage }}
        </div>

        <!-- Thông báo thành công -->
        <div v-if="successMessage" class="success-message">
          <span>✅</span> {{ successMessage }}
        </div>
      </div>

      <!-- Footer -->
      <div class="auth-footer">
        <p>&copy; 2025 Microservices Dashboard. All rights reserved.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import api from '@/api/axios';

const authStore = useAuthStore();
const router = useRouter();

// Tab state
const activeTab = ref('login');

// Login form
const loginForm = ref({
  username: '',
  password: ''
});
const showPassword = ref(false);
const rememberMe = ref(false);
const loading = ref(false);

// Register form
const registerForm = ref({
  username: '',
  password: '',
  confirmPassword: '',
  fullName: '',
  email: '',
  phone: ''
});
const showRegPassword = ref(false);
const showRegConfirm = ref(false);
const registering = ref(false);
const agreeTerms = ref(false);

// Messages
const errorMessage = ref('');
const successMessage = ref('');

// Handle Login
const handleLogin = async () => {
  errorMessage.value = '';
  loading.value = true;
  
  try {
    console.log('=== ĐANG ĐĂNG NHẬP ===');
    console.log('Username:', loginForm.value.username);
    
    const response = await api.post('/auth/login', {
      username: loginForm.value.username,
      password: loginForm.value.password
    });
    
    console.log('Response data:', response.data);
    
    const { token, role, fullName, userId } = response.data;
    
    console.log('Role nhận được:', role);
    
    // Lưu token
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('fullName', fullName);
    localStorage.setItem('userId', userId);
    
    // Cập nhật store
    authStore.token = token;
    authStore.role = role;
    authStore.fullName = fullName;
    authStore.user = { fullName: fullName, id: userId };
    
    if (rememberMe.value) {
      localStorage.setItem('rememberMe', 'true');
    }
    
    console.log('Đã lưu localStorage - role:', localStorage.getItem('role'));
    console.log('Đã lưu store - role:', authStore.role);
    
    // ✅ Chuyển đến dashboard (đã sửa thành /app/dashboard)
    router.push('/app/dashboard');
  } catch (error) {
    console.error('Login error:', error);
    errorMessage.value = error.response?.data?.message || 'Đăng nhập thất bại!';
  } finally {
    loading.value = false;
  }
};

// Handle Register
const handleRegister = async () => {
  errorMessage.value = '';
  successMessage.value = '';
  
  // Validate
  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    errorMessage.value = 'Mật khẩu xác nhận không khớp!';
    return;
  }
  
  if (registerForm.value.password.length < 6) {
    errorMessage.value = 'Mật khẩu phải có ít nhất 6 ký tự!';
    return;
  }
  
  if (!registerForm.value.fullName) {
    errorMessage.value = 'Vui lòng nhập họ tên!';
    return;
  }
  
  if (!registerForm.value.username) {
    errorMessage.value = 'Vui lòng nhập tên đăng nhập!';
    return;
  }
  
  registering.value = true;
  
  try {
    console.log('=== ĐANG ĐĂNG KÝ ===');
    console.log('Username:', registerForm.value.username);
    console.log('FullName:', registerForm.value.fullName);
    
    const response = await api.post('/auth/register', {
      username: registerForm.value.username,
      password: registerForm.value.password,
      confirmPassword: registerForm.value.confirmPassword,
      fullName: registerForm.value.fullName,
      email: registerForm.value.email,
      phone: registerForm.value.phone
    });
    
    console.log('Register response:', response.data);
    
    const { token, role, fullName, userId, message } = response.data;
    
    // Lưu token
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('fullName', fullName);
    localStorage.setItem('userId', userId);
    
    // Cập nhật store
    authStore.token = token;
    authStore.role = role;
    authStore.fullName = fullName;
    authStore.user = { fullName: fullName, id: userId };
    
    successMessage.value = message || 'Đăng ký thành công!';
    
    console.log('Đăng ký thành công, chuyển hướng sau 1.5s');
    
    // ✅ Tự động chuyển sang dashboard (đã sửa thành /app/dashboard)
    setTimeout(() => {
      router.push('/app/dashboard');
    }, 1500);
  } catch (error) {
    console.error('Register error:', error);
    errorMessage.value = error.response?.data?.message || 'Đăng ký thất bại!';
  } finally {
    registering.value = false;
  }
};
</script>

<style scoped>
.login-wrapper {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-container {
  width: 100%;
  max-width: 480px;
}

.auth-card {
  background: white;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  animation: slideUp 0.5s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.auth-header {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  padding: 32px 24px;
  text-align: center;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 24px;
}

.logo-icon {
  font-size: 36px;
}

.logo-text {
  font-size: 18px;
  font-weight: 700;
  color: white;
  letter-spacing: 1px;
}

.auth-tabs {
  display: flex;
  gap: 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 4px;
}

.tab-btn {
  flex: 1;
  padding: 10px;
  border: none;
  background: transparent;
  color: #94a3b8;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s;
}

.tab-btn.active {
  background: #6366f1;
  color: white;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.auth-form {
  padding: 32px 24px;
}

.form-group {
  position: relative;
  margin-bottom: 20px;
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

.form-group input {
  width: 100%;
  padding: 12px 40px 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 14px;
  transition: all 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.input-icon {
  position: absolute;
  right: 16px;
  top: 42px;
  font-size: 18px;
  color: #94a3b8;
}

.toggle-password {
  position: absolute;
  right: 16px;
  top: 42px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  color: #94a3b8;
}

.form-row {
  display: flex;
  gap: 16px;
}

.form-group.half {
  flex: 1;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #64748b;
  cursor: pointer;
  width: 100%;
}

.checkbox input {
  width: 16px;
  height: 16px;
  margin: 0;
  padding: 0;
  cursor: pointer;
  flex-shrink: 0;
}

.checkbox span {
  flex: 1;
}

.checkbox a {
  color: #6366f1;
  text-decoration: none;
}

.checkbox a:hover {
  text-decoration: underline;
}

.forgot-link {
  font-size: 13px;
  color: #6366f1;
  text-decoration: none;
}

.forgot-link:hover {
  text-decoration: underline;
}

.btn-login, .btn-register {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-login {
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white;
}

.btn-login:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
}

.btn-register {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.btn-register:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
}

.btn-login:disabled, .btn-register:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.error-message {
  margin: 0 24px 24px;
  padding: 12px;
  background: #fee2e2;
  border-left: 4px solid #ef4444;
  border-radius: 8px;
  color: #b91c1c;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.success-message {
  margin: 0 24px 24px;
  padding: 12px;
  background: #d1fae5;
  border-left: 4px solid #10b981;
  border-radius: 8px;
  color: #065f46;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.auth-footer {
  text-align: center;
  padding: 20px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
}

/* Responsive */
@media (max-width: 480px) {
  .auth-card {
    border-radius: 16px;
  }
  
  .form-row {
    flex-direction: column;
    gap: 0;
  }
  
  .auth-form {
    padding: 24px 20px;
  }
}
</style>