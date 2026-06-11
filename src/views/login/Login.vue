<template>
  <div class="page-root">

    <!-- ===== LANDING PAGE BACKGROUND (NỀN TRẮNG) ===== -->
    <div class="landing-bg" aria-hidden="true">
      <div class="landing-container">
        <!-- Navigation -->
        <nav class="landing-nav">
          <div class="nav-brand">
            <span class="brand-icon">🏢</span>
            <span class="brand-text">SmartStockDNU</span>
          </div>
          <div class="nav-links">
            <a href="#">Trang chủ</a>
            <a href="#">Tính năng</a>
            <a href="#">Giới thiệu</a>
            <a href="#">Liên hệ</a>
          </div>
        </nav>

        <!-- Hero Section -->
        <div class="hero-section">
          <div class="hero-content">
            <span class="hero-badge">🚀 Phiên bản 2025</span>
            <h1 class="hero-title">
              Quản lý bán hàng &
              <span class="hero-highlight">Kho hàng</span> thông minh
            </h1>
            <p class="hero-description">
              Quản lý sản phẩm, tồn kho, đơn hàng, khách hàng, nhà cung cấp trong một hệ thống duy nhất. 
              Giải pháp toàn diện cho doanh nghiệp vừa và nhỏ.
            </p>
          </div>
          
          <!-- Hero Dashboard Mockup -->
          <div class="hero-visual">
            <div class="hero-dashboard-mockup">
              <div class="mockup-header">
                <div class="mockup-dots">
                  <span></span><span></span><span></span>
                </div>
                <div class="mockup-search"></div>
              </div>
              <div class="mockup-content">
                <div class="mockup-sidebar">
                  <div class="mockup-item active"></div>
                  <div class="mockup-item"></div>
                  <div class="mockup-item"></div>
                  <div class="mockup-item"></div>
                </div>
                <div class="mockup-main">
                  <div class="mockup-cards">
                    <div class="mockup-card"></div>
                    <div class="mockup-card"></div>
                    <div class="mockup-card"></div>
                  </div>
                  <div class="mockup-chart">
                    <div class="mockup-bar" style="height:60%"></div>
                    <div class="mockup-bar" style="height:80%"></div>
                    <div class="mockup-bar" style="height:50%"></div>
                    <div class="mockup-bar" style="height:90%"></div>
                    <div class="mockup-bar" style="height:70%"></div>
                    <div class="mockup-bar" style="height:85%"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Features Section -->
        <div class="features-section">
          <h2 class="section-heading">Tính năng nổi bật</h2>
          <p class="section-sub">Mọi công cụ bạn cần để vận hành doanh nghiệp</p>
          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-icon">📦</div>
              <h3>Quản lý sản phẩm</h3>
              <p>Quản lý danh mục, theo dõi tồn kho, cảnh báo hàng sắp hết</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🛒</div>
              <h3>Quản lý đơn hàng</h3>
              <p>Xử lý đơn hàng nhanh chóng, theo dõi công nợ và thanh toán</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">👥</div>
              <h3>Quản lý khách hàng</h3>
              <p>Lưu trữ thông tin, lịch sử mua hàng và công nợ khách hàng</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🏪</div>
              <h3>Quản lý kho hàng</h3>
              <p>Cập nhật tồn kho thời gian thực, nhập/xuất kho dễ dàng</p>
            </div>
          </div>
        </div>

        <!-- Stats Section -->
        <div class="stats-section">
          <div class="stat-item">
            <h3>10,000+</h3>
            <p>Khách hàng</p>
          </div>
          <div class="stat-item">
            <h3>50,000+</h3>
            <p>Đơn hàng/tháng</p>
          </div>
          <div class="stat-item">
            <h3>99.9%</h3>
            <p>Uptime</p>
          </div>
          <div class="stat-item">
            <h3>24/7</h3>
            <p>Hỗ trợ</p>
          </div>
        </div>

        <!-- Footer -->
        <footer class="landing-footer">
          <p>© 2025 SmartStockDNU. Tất cả quyền được bảo lưu.</p>
          <div class="footer-links">
            <a href="#">Điều khoản</a>
            <a href="#">Bảo mật</a>
            <a href="#">Hỗ trợ</a>
          </div>
        </footer>
      </div>
    </div>

    <!-- ===== OVERLAY ===== -->
    <div class="overlay"></div>

    <!-- ===== NÚT BACK ===== -->
    <button class="btn-back" @click="router.push('/')">
      <span class="btn-back-arrow">←</span>
      <span>Về trang chủ</span>
    </button>

    <!-- ===== LOGIN MODAL ===== -->
    <div class="login-container">
      <div class="auth-card">
        <div class="auth-header">
          <div class="logo">
            <span class="logo-icon">🏢</span>
            <span class="logo-text">SmartStockDNU</span>
          </div>
          <div class="auth-tabs">
            <button class="tab-btn" :class="{ active: activeTab === 'login' }" @click="activeTab = 'login'">
              Đăng nhập
            </button>
            <button class="tab-btn" :class="{ active: activeTab === 'register' }" @click="activeTab = 'register'">
              Đăng ký
            </button>
          </div>
        </div>

        <!-- FORM ĐĂNG NHẬP -->
        <form v-if="activeTab === 'login'" @submit.prevent="handleLogin" class="auth-form">
          <div class="form-group">
            <label>Tên đăng nhập</label>
            <div class="input-wrap">
              <span class="input-prefix">👤</span>
              <input type="text" v-model="loginForm.username" placeholder="Nhập tên đăng nhập" required>
            </div>
          </div>
          <div class="form-group">
            <label>Mật khẩu</label>
            <div class="input-wrap">
              <span class="input-prefix">🔒</span>
              <input :type="showPassword ? 'text' : 'password'" v-model="loginForm.password" placeholder="Nhập mật khẩu" required>
              <button type="button" class="toggle-password" @click="showPassword = !showPassword">
                {{ showPassword ? '🙈' : '👁️' }}
              </button>
            </div>
          </div>
          <div class="form-options">
            <label class="checkbox">
              <input type="checkbox" v-model="rememberMe"> Ghi nhớ đăng nhập
            </label>
            <a href="#" class="forgot-link">Quên mật khẩu?</a>
          </div>
          <button type="submit" class="btn-submit" :disabled="loading">
            {{ loading ? 'Đang xử lý...' : 'Đăng nhập' }}
          </button>

          <div class="register-link">
            Chưa có tài khoản?
            <span @click="activeTab = 'register'">Đăng ký</span>
          </div>
        </form>

        <!-- FORM ĐĂNG KÝ -->
        <form v-else @submit.prevent="handleRegister" class="auth-form">
          <div class="form-row">
            <div class="form-group half">
              <label>Họ và tên *</label>
              <input type="text" v-model="registerForm.fullName" placeholder="Nhập họ tên" required>
            </div>
            <div class="form-group half">
              <label>Tên đăng nhập *</label>
              <input type="text" v-model="registerForm.username" placeholder="Nhập tên đăng nhập" required>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group half">
              <label>Email</label>
              <input type="email" v-model="registerForm.email" placeholder="example@email.com">
            </div>
            <div class="form-group half">
              <label>Số điện thoại</label>
              <input type="tel" v-model="registerForm.phone" placeholder="0912345678">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group half">
              <label>Mật khẩu *</label>
              <div class="input-wrap">
                <input :type="showRegPassword ? 'text' : 'password'" v-model="registerForm.password" placeholder="Nhập mật khẩu" required>
                <button type="button" class="toggle-password" @click="showRegPassword = !showRegPassword">{{ showRegPassword ? '🙈' : '👁️' }}</button>
              </div>
            </div>
            <div class="form-group half">
              <label>Xác nhận mật khẩu *</label>
              <div class="input-wrap">
                <input :type="showRegConfirm ? 'text' : 'password'" v-model="registerForm.confirmPassword" placeholder="Xác nhận mật khẩu" required>
                <button type="button" class="toggle-password" @click="showRegConfirm = !showRegConfirm">{{ showRegConfirm ? '🙈' : '👁️' }}</button>
              </div>
            </div>
          </div>
          <div class="form-group">
            <label class="checkbox">
              <input type="checkbox" v-model="agreeTerms" required>
              <span>Tôi đồng ý với <a href="#">Điều khoản sử dụng</a></span>
            </label>
          </div>
          <button type="submit" class="btn-submit register" :disabled="registering">
            {{ registering ? 'Đang xử lý...' : 'Đăng ký' }}
          </button>

          <div class="social-divider">
            <span class="divider-line"></span>
            <span class="divider-text">hoặc đăng ký nhanh với</span>
            <span class="divider-line"></span>
          </div>

          <div class="social-buttons">
            <button type="button" class="btn-social btn-google" @click="handleGoogleAuth">
              <svg class="social-icon" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Google
            </button>
            <button type="button" class="btn-social btn-facebook" @click="handleFacebookAuth">
              <svg class="social-icon" viewBox="0 0 24 24"><path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              Facebook
            </button>
          </div>
        </form>

        <div v-if="errorMessage" class="error-message">⚠️ {{ errorMessage }}</div>
        <div v-if="successMessage" class="success-message">✅ {{ successMessage }}</div>
      </div>

      <div class="auth-footer">
        <p>© 2025 SmartStockDNU. All rights reserved.</p>
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

const activeTab = ref('login');
const loginForm = ref({ username: '', password: '' });
const showPassword = ref(false);
const rememberMe = ref(false);
const loading = ref(false);

const registerForm = ref({ username: '', password: '', confirmPassword: '', fullName: '', email: '', phone: '' });
const showRegPassword = ref(false);
const showRegConfirm = ref(false);
const registering = ref(false);
const agreeTerms = ref(false);

const errorMessage = ref('');
const successMessage = ref('');

const handleLogin = async () => {
  errorMessage.value = '';
  loading.value = true;
  try {
    const response = await api.post('/auth/login', {
      username: loginForm.value.username,
      password: loginForm.value.password
    });
    const { token, role, fullName, userId } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('fullName', fullName);
    localStorage.setItem('userId', userId);
    authStore.token = token; authStore.role = role;
    authStore.fullName = fullName; authStore.user = { fullName, id: userId };
    if (rememberMe.value) localStorage.setItem('rememberMe', 'true');
    router.push('/app/dashboard');
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Đăng nhập thất bại!';
  } finally {
    loading.value = false;
  }
};

const handleRegister = async () => {
  errorMessage.value = '';
  successMessage.value = '';
  if (registerForm.value.password !== registerForm.value.confirmPassword) { errorMessage.value = 'Mật khẩu xác nhận không khớp!'; return; }
  if (registerForm.value.password.length < 6) { errorMessage.value = 'Mật khẩu phải có ít nhất 6 ký tự!'; return; }
  if (!registerForm.value.fullName) { errorMessage.value = 'Vui lòng nhập họ tên!'; return; }
  if (!registerForm.value.username) { errorMessage.value = 'Vui lòng nhập tên đăng nhập!'; return; }
  registering.value = true;
  try {
    const response = await api.post('/auth/register', {
      username: registerForm.value.username,
      password: registerForm.value.password,
      confirmPassword: registerForm.value.confirmPassword,
      fullName: registerForm.value.fullName,
      email: registerForm.value.email,
      phone: registerForm.value.phone
    });
    const { token, role, fullName, userId, message } = response.data;
    localStorage.setItem('token', token); localStorage.setItem('role', role);
    localStorage.setItem('fullName', fullName); localStorage.setItem('userId', userId);
    authStore.token = token; authStore.role = role;
    authStore.fullName = fullName; authStore.user = { fullName, id: userId };
    successMessage.value = message || 'Đăng ký thành công!';
    setTimeout(() => router.push('/app/dashboard'), 1500);
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Đăng ký thất bại!';
  } finally {
    registering.value = false;
  }
};

const handleGoogleAuth = () => {
  window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/google?prompt=select_account`;
};

const handleFacebookAuth = () => {
  window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/facebook`;
};
</script>

<style scoped>
/* ===== ROOT ===== */
.page-root {
  position: relative;
  min-height: 100vh;
  width: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #faf9ff;
}

/* ===== LANDING PAGE BACKGROUND (NỀN TRẮNG) ===== */
.landing-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow-y: auto;
  overflow-x: hidden;
  pointer-events: none;
  user-select: none;
}

.landing-container {
  min-height: 100vh;
  background: #faf9ff;
  color: #051a3e;
  padding: 0 24px;
  max-width: 1200px;
  margin: 0 auto;
}

/* Navigation */
.landing-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid #e9edff;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand-icon { font-size: 28px; }

.brand-text {
  font-size: 20px;
  font-weight: 700;
  color: #003d9b;
}

.nav-links {
  display: flex;
  gap: 30px;
}

.nav-links a {
  color: #434654;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
}

/* Hero Section */
.hero-section {
  display: flex;
  align-items: center;
  gap: 60px;
  padding: 60px 0;
}

.hero-content { flex: 1; }

.hero-badge {
  display: inline-block;
  padding: 6px 16px;
  background: rgba(0, 82, 204, 0.1);
  border-radius: 20px;
  font-size: 13px;
  color: #0052cc;
  margin-bottom: 20px;
}

.hero-title {
  font-size: 44px;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 20px;
  color: #051a3e;
}

.hero-highlight {
  color: #0052cc;
}

.hero-description {
  font-size: 16px;
  color: #434654;
  line-height: 1.6;
}

/* Hero Mockup */
.hero-visual { flex: 1; }

.hero-dashboard-mockup {
  background: white;
  border: 1px solid #e9edff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.mockup-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.mockup-dots { display: flex; gap: 6px; }

.mockup-dots span {
  width: 10px; height: 10px;
  border-radius: 50%;
  background: #c3c6d6;
}

.mockup-search {
  flex: 1;
  height: 8px;
  background: #e9edff;
  border-radius: 4px;
}

.mockup-content { display: flex; gap: 16px; }

.mockup-sidebar {
  width: 50px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mockup-item {
  height: 8px;
  background: #e9edff;
  border-radius: 4px;
}

.mockup-item.active { background: #0052cc; }

.mockup-main { flex: 1; }

.mockup-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 16px;
}

.mockup-card {
  height: 60px;
  background: #f5f7fa;
  border-radius: 8px;
}

.mockup-chart {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  height: 80px;
}

.mockup-bar {
  flex: 1;
  background: linear-gradient(to top, #0052cc, #93c5fd);
  border-radius: 4px 4px 0 0;
  opacity: 0.5;
}

/* Features Section */
.features-section {
  padding: 80px 0;
}

.section-heading {
  font-size: 32px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 12px;
  color: #051a3e;
}

.section-sub {
  text-align: center;
  color: #434654;
  margin-bottom: 48px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
}

.feature-card {
  background: white;
  border: 1px solid #e9edff;
  border-radius: 16px;
  padding: 28px;
  text-align: center;
}

.feature-icon { font-size: 40px; margin-bottom: 16px; }

.feature-card h3 { font-size: 18px; margin-bottom: 10px; color: #051a3e; }

.feature-card p { color: #737685; font-size: 14px; line-height: 1.5; }

/* Stats Section */
.stats-section {
  display: flex;
  justify-content: center;
  gap: 60px;
  padding: 60px 0;
  border-top: 1px solid #e9edff;
  border-bottom: 1px solid #e9edff;
}

.stat-item { text-align: center; }

.stat-item h3 {
  font-size: 32px;
  font-weight: 700;
  color: #003d9b;
}

.stat-item p { color: #434654; font-size: 14px; }

/* Footer */
.landing-footer {
  display: flex;
  justify-content: space-between;
  padding: 30px 0;
  color: #737685;
  font-size: 14px;
}

.footer-links { display: flex; gap: 20px; }

.footer-links a { color: #737685; text-decoration: none; }

/* ===== OVERLAY ===== */
.overlay {
  position: fixed; inset: 0; z-index: 1;
  background: rgba(5, 26, 62, 0.4);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

/* ===== NÚT BACK ===== */
.btn-back {
  position: fixed;
  top: 20px; left: 20px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid #c3c6d6;
  color: #051a3e;
  font-size: 14px;
  font-weight: 600;
  padding: 10px 20px;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.25s;
}
.btn-back:hover {
  background: white;
  transform: translateX(-4px);
}
.btn-back-arrow { font-size: 18px; }

/* ===== LOGIN MODAL ===== */
.login-container {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 460px;
  padding: 20px;
  animation: slideUp 0.45s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(32px) scale(0.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.auth-card {
  background: white;
  border-radius: 24px;
  box-shadow: 0 24px 80px rgba(0,0,0,0.2);
  overflow: hidden;
}

.auth-header {
  background: linear-gradient(135deg, #003d9b, #0052cc);
  padding: 28px 24px;
  text-align: center;
}

.logo { display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 20px; }
.logo-icon { font-size: 32px; }
.logo-text { font-size: 17px; font-weight: 700; color: white; }

.auth-tabs { display: flex; background: rgba(255,255,255,0.15); border-radius: 12px; padding: 4px; gap: 4px; }
.tab-btn { flex: 1; padding: 9px; border: none; background: transparent; color: rgba(255,255,255,0.7); font-size: 15px; font-weight: 600; cursor: pointer; border-radius: 8px; transition: all 0.25s; }
.tab-btn.active { background: white; color: #003d9b; }

.auth-form { padding: 24px 24px 20px; }
.form-group { margin-bottom: 16px; }
.form-group label { display: block; margin-bottom: 7px; font-size: 12px; font-weight: 600; color: #334155; text-transform: uppercase; }
.input-wrap { position: relative; display: flex; align-items: center; }
.input-prefix { position: absolute; left: 12px; font-size: 16px; color: #94a3b8; pointer-events: none; }

.form-group input,
.input-wrap input {
  width: 100%; padding: 11px 40px 11px 38px;
  border: 2px solid #e2e8f0; border-radius: 12px;
  font-size: 14px; box-sizing: border-box; background: #fafafa;
  color: #051a3e;
}
.form-group input:focus,
.input-wrap input:focus {
  outline: none; border-color: #0052cc; background: white;
}
.toggle-password { position: absolute; right: 12px; background: none; border: none; cursor: pointer; font-size: 16px; color: #94a3b8; }

.form-row { display: flex; gap: 14px; }
.form-group.half { flex: 1; }
.form-group.half input { padding: 11px 12px; width: 100%; box-sizing: border-box; }

.form-options { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
.checkbox { display: flex; align-items: center; gap: 7px; font-size: 13px; color: #64748b; cursor: pointer; }
.checkbox input[type="checkbox"] { width: 15px; height: 15px; cursor: pointer; accent-color: #0052cc; }
.checkbox a { color: #0052cc; text-decoration: none; }
.forgot-link { font-size: 13px; color: #0052cc; text-decoration: none; }

.btn-submit {
  width: 100%; padding: 13px; border: none; border-radius: 12px;
  font-size: 15px; font-weight: 600; cursor: pointer;
  background: linear-gradient(135deg, #0052cc, #003d9b); color: white;
}
.btn-submit:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0, 61, 155, 0.3); }
.btn-submit.register { background: linear-gradient(135deg, #10b981, #059669); }
.btn-submit:disabled { opacity: 0.7; cursor: not-allowed; }

.social-divider { display: flex; align-items: center; gap: 12px; margin: 18px 0 16px; }
.divider-line { flex: 1; height: 1px; background: #e2e8f0; }
.divider-text { font-size: 12px; color: #94a3b8; white-space: nowrap; }

.social-buttons { display: flex; gap: 12px; }
.btn-social {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: 9px;
  padding: 11px 16px; border-radius: 12px; font-size: 14px; font-weight: 600;
  cursor: pointer; border: 2px solid #e2e8f0; background: white; color: #334155;
}
.btn-social:hover { transform: translateY(-2px); }
.btn-google:hover { border-color: #4285F4; }
.btn-facebook:hover { border-color: #1877F2; }
.social-icon { width: 20px; height: 20px; }

.register-link { text-align: center; margin-top: 18px; font-size: 14px; color: #64748b; }
.register-link span { color: #0052cc; font-weight: 700; cursor: pointer; }

.error-message {
  margin: 0 24px 20px; padding: 11px;
  background: #fee2e2; border-left: 4px solid #ef4444;
  border-radius: 8px; color: #b91c1c; font-size: 13px;
}
.success-message {
  margin: 0 24px 20px; padding: 11px;
  background: #d1fae5; border-left: 4px solid #10b981;
  border-radius: 8px; color: #065f46; font-size: 13px;
}

.auth-footer { text-align: center; padding: 16px; color: rgba(5, 26, 62, 0.6); font-size: 12px; }

@media (max-width: 600px) {
  .hero-section { flex-direction: column; }
  .hero-title { font-size: 32px; }
  .form-row { flex-direction: column; gap: 0; }
  .auth-form { padding: 20px 16px 16px; }
}
</style>