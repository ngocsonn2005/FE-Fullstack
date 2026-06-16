<template>
  <main class="stock-auth" :class="`mode-${mode}`">
    <section class="form-panel">
      <div class="form-card">
        <!-- TAB ĐĂNG NHẬP / ĐĂNG KÝ -->
        <div class="auth-tabs">
          <button
            type="button"
            :class="{ active: mode === 'login' || mode === 'forgot' }"
            @click="switchMode('login')"
          >
            Đăng nhập
          </button>

          <button
            type="button"
            :class="{ active: mode === 'register' }"
            @click="switchMode('register')"
          >
            Đăng ký
          </button>
        </div>

        <!-- ĐĂNG NHẬP -->
        <form
          v-if="mode === 'login'"
          key="login"
          class="auth-form compact"
          @submit.prevent="handleLogin"
        >
          <div class="field">
            <label for="loginUsername">Tên đăng nhập</label>
            <input
              id="loginUsername"
              v-model.trim="loginForm.username"
              type="text"
              placeholder="Nhập tên đăng nhập"
              required
            />
          </div>

          <div class="field">
            <label for="loginPassword">Mật khẩu</label>
            <div class="password-wrap">
              <input
                id="loginPassword"
                v-model="loginForm.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Nhập mật khẩu"
                required
              />
              <button type="button" class="eye-btn" @click="showPassword = !showPassword">
                {{ showPassword ? '🙈' : '👁' }}
              </button>
            </div>
          </div>

          <div class="option-line">
            <label>
              <input v-model="rememberMe" type="checkbox" />
              <span>Ghi nhớ đăng nhập</span>
            </label>

            <button type="button" @click="switchMode('forgot')">
              Quên mật khẩu?
            </button>
          </div>

          <button class="primary-btn" type="submit" :disabled="loading">
            {{ loading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
          </button>

          <button type="button" class="back-home-btn" @click="goHome">
            ← Quay lại trang chủ
          </button>

        </form>

        <!-- ĐĂNG KÝ -->
        <form
          v-else-if="mode === 'register'"
          key="register"
          class="auth-form"
          @submit.prevent="handleRegister"
        >
          <div class="field">
            <label for="fullName">Họ và tên</label>
            <input
              id="fullName"
              v-model.trim="registerForm.fullName"
              type="text"
              placeholder="Nhập họ và tên"
              required
            />
          </div>

          <div class="field">
            <label for="username">Tên đăng nhập</label>
            <input
              id="username"
              v-model.trim="registerForm.username"
              type="text"
              placeholder="Tên đăng nhập của bạn"
              required
            />
          </div>

          <div class="field">
            <label for="email">Email</label>
            <input
              id="email"
              v-model.trim="registerForm.email"
              type="email"
              placeholder="email@gmail.com"
            />
          </div>

          <div class="field">
            <label for="phone">Số điện thoại</label>
            <input
              id="phone"
              v-model.trim="registerForm.phone"
              type="tel"
              placeholder="0912345678"
            />
          </div>

          <div class="field">
            <label for="regPassword">Mật khẩu</label>
            <div class="password-wrap">
              <input
                id="regPassword"
                v-model="registerForm.password"
                :type="showRegPassword ? 'text' : 'password'"
                placeholder="Tối thiểu 6 ký tự"
                required
              />
              <button type="button" class="eye-btn" @click="showRegPassword = !showRegPassword">
                {{ showRegPassword ? '🙈' : '👁' }}
              </button>
            </div>
          </div>

          <div class="field">
            <label for="confirmPassword">Xác nhận mật khẩu</label>
            <div class="password-wrap">
              <input
                id="confirmPassword"
                v-model="registerForm.confirmPassword"
                :type="showRegConfirm ? 'text' : 'password'"
                placeholder="Nhập lại mật khẩu"
                required
              />
              <button type="button" class="eye-btn" @click="showRegConfirm = !showRegConfirm">
                {{ showRegConfirm ? '🙈' : '👁' }}
              </button>
            </div>
          </div>

          <label class="terms-line">
            <input v-model="agreeTerms" type="checkbox" required />
            <span>Tôi đồng ý với Điều khoản dịch vụ và Chính sách bảo mật.</span>
          </label>

          <button class="primary-btn" type="submit" :disabled="registering">
            {{ registering ? 'Đang đăng ký...' : 'Đăng ký' }}
          </button>

          <button type="button" class="back-home-btn" @click="goHome">
            ← Quay lại trang chủ
          </button>

          <div class="divider"><span>ĐĂNG NHẬP NHANH</span></div>

          <button type="button" class="quick-login-btn" @click="handleGoogleAuth">
            <span class="google-mark">G</span>
            Đăng nhập nhanh bằng Google
          </button>
        </form>

        <!-- QUÊN MẬT KHẨU -->
        <form
          v-else
          key="forgot"
          class="auth-form"
          @submit.prevent="handleForgotPassword"
        >
          <div class="field">
            <label for="forgotUsername">Tên đăng nhập</label>
            <input
              id="forgotUsername"
              v-model.trim="forgotForm.username"
              type="text"
              placeholder="Nhập tên đăng nhập"
              required
            />
          </div>

          <div class="field">
            <label for="newPassword">Mật khẩu mới</label>
            <div class="password-wrap">
              <input
                id="newPassword"
                v-model="forgotForm.newPassword"
                :type="showForgotPassword ? 'text' : 'password'"
                placeholder="Nhập mật khẩu mới"
                required
              />
              <button type="button" class="eye-btn" @click="showForgotPassword = !showForgotPassword">
                {{ showForgotPassword ? '🙈' : '👁' }}
              </button>
            </div>
          </div>

          <div class="field">
            <label for="forgotConfirmPassword">Xác nhận mật khẩu mới</label>
            <input
              id="forgotConfirmPassword"
              v-model="forgotForm.confirmPassword"
              type="password"
              placeholder="Nhập lại mật khẩu mới"
              required
            />
          </div>

          <button class="primary-btn" type="submit" :disabled="resetting">
            {{ resetting ? 'Đang cập nhật...' : 'Cập nhật mật khẩu' }}
          </button>

          <button type="button" class="back-home-btn" @click="goHome">
            ← Quay lại trang chủ
          </button>

          <p class="switch-text register-switch">
            Nhớ mật khẩu rồi?
            <button type="button" @click="switchMode('login')">
              Quay lại đăng nhập
            </button>
          </p>
        </form>

        <div v-if="errorMessage" class="message error">
          ⚠️ {{ errorMessage }}
        </div>

        <div v-if="successMessage" class="message success">
          ✅ {{ successMessage }}
        </div>
      </div>
    </section>

    <section class="hero-panel">
      <div class="hero-bg"></div>

      <div v-if="mode === 'login'" class="login-glass">
        <div class="hero-icon">▣</div>

        <h2>StockFlow</h2>

        <p>
          Welcome back.<br />
          <em>Manage your business with precision.</em>
        </p>

        <div class="login-stats">
          <div>
            <strong>⌁</strong>
            <span>REAL-TIME</span>
            <b>Analytics</b>
          </div>

          <div>
            <strong>◉</strong>
            <span>INVENTORY</span>
            <b>Tracking</b>
          </div>

          <div>
            <strong>⌁</strong>
            <span>SUPPLY</span>
            <b>Velocity</b>
          </div>
        </div>
      </div>

      <div v-else class="register-copy">
        <h2>Cùng hàng ngàn doanh nghiệp tối ưu kho hàng</h2>

        <p>
          Giải pháp quản lý logistics thông minh giúp bạn kiểm soát mọi khía cạnh
          của chuỗi cung ứng với độ chính xác tuyệt đối.
        </p>

        <div class="benefit-grid">
          <div>
            <i>⌁</i>
            <h3>Mở rộng nhanh chóng</h3>
            <p>Phát triển quy mô kho bãi dễ dàng với hệ thống hiện đại.</p>
          </div>

          <div>
            <i>⚡</i>
            <h3>Đồng bộ thời gian thực</h3>
            <p>Theo dõi tồn kho trực tiếp trên tất cả các kênh bán hàng.</p>
          </div>
        </div>

        <div class="trust-pill">
          👥 👥 👥
          <span>Được tin dùng bởi hơn 12.000 lãnh đạo logistics toàn cầu.</span>
        </div>
      </div>
    </section>

    <!-- ✅ MODAL YÊU CẦU ĐỔI MẬT KHẨU -->
    <div class="modal-overlay" :class="{ show: showForcePasswordModal }" v-if="showForcePasswordModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h3>⚠️ Yêu cầu đổi mật khẩu</h3>
            <button class="modal-close" @click="closeForcePasswordModal">✕</button>
          </div>
          <div class="modal-body">
            <div class="force-password-icon">🔒</div>
            <p class="force-password-text">
              Đây là lần đầu tiên bạn đăng nhập hoặc tài khoản yêu cầu đổi mật khẩu.
              Vui lòng đổi mật khẩu mới để tiếp tục.
            </p>
            
            <div class="field">
              <label>Mật khẩu mới <span class="required">*</span></label>
              <div class="password-wrap">
                <input 
                  :type="showForcePassword ? 'text' : 'password'" 
                  v-model="forcePasswordForm.newPassword" 
                  placeholder="Nhập mật khẩu mới"
                  required
                  @input="checkForcePasswordStrength"
                />
                <button type="button" class="eye-btn" @click="showForcePassword = !showForcePassword">
                  {{ showForcePassword ? '🙈' : '👁' }}
                </button>
              </div>
              <!-- Hiển thị độ mạnh mật khẩu -->
              <div v-if="forcePasswordForm.newPassword" class="password-strength">
                <div class="strength-bar" :class="forcePasswordStrength.class"></div>
                <span class="strength-text">{{ forcePasswordStrength.text }}</span>
              </div>
              <ul class="password-requirements">
                <li :class="{ met: forcePasswordForm.newPassword.length >= 6 }">✓ Ít nhất 6 ký tự</li>
                <li :class="{ met: forceHasSpecialChar }">✓ Ít nhất 1 ký tự đặc biệt (!@#$%^&*)</li>
                <li :class="{ met: forceHasUpperCase }">✓ Ít nhất 1 chữ hoa</li>
                <li :class="{ met: forceHasNumber }">✓ Ít nhất 1 số</li>
              </ul>
            </div>

            <div class="field">
              <label>Xác nhận mật khẩu mới <span class="required">*</span></label>
              <div class="password-wrap">
                <input 
                  :type="showForceConfirm ? 'text' : 'password'" 
                  v-model="forcePasswordForm.confirmPassword" 
                  placeholder="Xác nhận mật khẩu mới"
                  required
                />
                <button type="button" class="eye-btn" @click="showForceConfirm = !showForceConfirm">
                  {{ showForceConfirm ? '🙈' : '👁' }}
                </button>
              </div>
              <div v-if="forcePasswordForm.confirmPassword && forcePasswordForm.newPassword !== forcePasswordForm.confirmPassword" class="error-hint">
                Mật khẩu xác nhận không khớp
              </div>
            </div>

            <div v-if="forceError" class="message error">
              ⚠️ {{ forceError }}
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" @click="closeForcePasswordModal">Hủy</button>
            <button class="btn-primary" @click="handleForceChangePassword" :disabled="forceChanging">
              {{ forceChanging ? 'Đang xử lý...' : 'Đổi mật khẩu' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import api from '@/api/axios';

const authStore = useAuthStore();
const router = useRouter();

const mode = ref('login');

const loginForm = ref({
  username: '',
  password: ''
});

const rememberMe = ref(localStorage.getItem('rememberMe') === 'true');
const showPassword = ref(false);
const loading = ref(false);

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

const forgotForm = ref({
  username: '',
  newPassword: '',
  confirmPassword: ''
});

const showForgotPassword = ref(false);
const resetting = ref(false);

const errorMessage = ref('');
const successMessage = ref('');

// ✅ State cho Force Password Change
const showForcePasswordModal = ref(false);
const showForcePassword = ref(false);
const showForceConfirm = ref(false);
const forceChanging = ref(false);
const forceError = ref('');
const tempToken = ref('');
const tempUserData = ref(null);

const forcePasswordForm = ref({
  newPassword: '',
  confirmPassword: ''
});

// ✅ Computed cho Force Password
const forceHasSpecialChar = computed(() => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(forcePasswordForm.value.newPassword));
const forceHasUpperCase = computed(() => /[A-Z]/.test(forcePasswordForm.value.newPassword));
const forceHasNumber = computed(() => /[0-9]/.test(forcePasswordForm.value.newPassword));

const forcePasswordStrength = computed(() => {
  const pwd = forcePasswordForm.value.newPassword;
  if (!pwd) return { class: '', text: '' };
  
  let strength = 0;
  if (pwd.length >= 6) strength++;
  if (forceHasSpecialChar.value) strength++;
  if (forceHasUpperCase.value) strength++;
  if (forceHasNumber.value) strength++;
  
  if (strength <= 2) return { class: 'weak', text: 'Yếu' };
  if (strength === 3) return { class: 'medium', text: 'Trung bình' };
  return { class: 'strong', text: 'Mạnh' };
});

const switchMode = (nextMode) => {
  mode.value = nextMode;
  errorMessage.value = '';
  successMessage.value = '';
};

const goHome = () => {
  router.push('/');
};

const saveAuthData = (data) => {
  const { token, role, fullName, userId } = data;

  localStorage.setItem('token', token || '');
  localStorage.setItem('role', role || '');
  localStorage.setItem('fullName', fullName || '');
  localStorage.setItem('userId', userId || '');

  authStore.token = token;
  authStore.role = role;
  authStore.fullName = fullName;
  authStore.user = {
    fullName,
    id: userId
  };
};

// ✅ SỬA HÀM handleLogin - Thêm xử lý requirePasswordChange và khóa tài khoản
const handleLogin = async () => {
  errorMessage.value = '';
  successMessage.value = '';
  loading.value = true;

  try {
    const response = await api.post('/auth/login', {
      username: loginForm.value.username,
      password: loginForm.value.password
    });

    const data = response.data;

    // ✅ Kiểm tra tài khoản bị khóa (nếu backend trả về isLocked)
    if (data.isLocked) {
      errorMessage.value = 'Tài khoản đã bị khóa. Vui lòng liên hệ Admin để mở khóa!';
      loading.value = false;
      return;
    }

    // ✅ Kiểm tra yêu cầu đổi mật khẩu
    if (data.requirePasswordChange) {
      // Lưu token tạm thời và thông tin user
      tempToken.value = data.token;
      tempUserData.value = data;
      
      // Hiển thị modal đổi mật khẩu
      showForcePasswordModal.value = true;
      forceError.value = '';
      forcePasswordForm.value = {
        newPassword: '',
        confirmPassword: ''
      };
      loading.value = false;
      return;
    }

    // Đăng nhập bình thường
    saveAuthData(data);

    if (rememberMe.value) {
      localStorage.setItem('rememberMe', 'true');
    } else {
      localStorage.removeItem('rememberMe');
    }

    router.push('/app/dashboard');
  } catch (error) {
    // ✅ Kiểm tra nếu lỗi là do tài khoản bị khóa từ backend
    const errorMsg = error.response?.data?.message || '';
    if (errorMsg.includes('khóa') || errorMsg.includes('lock')) {
      errorMessage.value = 'Tài khoản đã bị khóa. Vui lòng liên hệ Admin để mở khóa!';
    } else {
      errorMessage.value = errorMsg || 'Đăng nhập thất bại! Kiểm tra lại tài khoản hoặc mật khẩu.';
    }
  } finally {
    loading.value = false;
  }
};

// ✅ HÀM ĐỔI MẬT KHẨU BẮT BUỘC
const handleForceChangePassword = async () => {
  forceError.value = '';

  // Kiểm tra mật khẩu
  if (forcePasswordForm.value.newPassword.length < 6) {
    forceError.value = 'Mật khẩu phải có ít nhất 6 ký tự!';
    return;
  }

  if (!forceHasSpecialChar.value) {
    forceError.value = 'Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (!@#$%^&*)!';
    return;
  }

  if (!forceHasUpperCase.value) {
    forceError.value = 'Mật khẩu phải chứa ít nhất 1 chữ hoa!';
    return;
  }

  if (!forceHasNumber.value) {
    forceError.value = 'Mật khẩu phải chứa ít nhất 1 số!';
    return;
  }

  if (forcePasswordForm.value.newPassword !== forcePasswordForm.value.confirmPassword) {
    forceError.value = 'Mật khẩu xác nhận không khớp!';
    return;
  }

  forceChanging.value = true;

  try {
    // Gọi API đổi mật khẩu với token tạm thời
    await api.post('/auth/force-change-password', {
      newPassword: forcePasswordForm.value.newPassword
    }, {
      headers: {
        Authorization: `Bearer ${tempToken.value}`
      }
    });

    // Đóng modal
    showForcePasswordModal.value = false;

    // Lưu token và thông tin user
    saveAuthData(tempUserData.value);

    if (rememberMe.value) {
      localStorage.setItem('rememberMe', 'true');
    } else {
      localStorage.removeItem('rememberMe');
    }

    // Chuyển đến dashboard
    router.push('/app/dashboard');
  } catch (error) {
    forceError.value = error.response?.data?.message || 'Đổi mật khẩu thất bại!';
  } finally {
    forceChanging.value = false;
  }
};

// ✅ Đóng modal force password
const closeForcePasswordModal = () => {
  showForcePasswordModal.value = false;
  forceError.value = '';
  forcePasswordForm.value = {
    newPassword: '',
    confirmPassword: ''
  };
  // Quay lại trang đăng nhập
  switchMode('login');
};

// ✅ Kiểm tra strength cho force password
const checkForcePasswordStrength = () => {
  // Chỉ trigger computed
};

const handleRegister = async () => {
  errorMessage.value = '';
  successMessage.value = '';

  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    errorMessage.value = 'Mật khẩu xác nhận không khớp!';
    return;
  }

  if (registerForm.value.password.length < 6) {
    errorMessage.value = 'Mật khẩu phải có ít nhất 6 ký tự!';
    return;
  }

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

    if (response.data?.token) {
      saveAuthData(response.data);
      successMessage.value = response.data?.message || 'Đăng ký thành công!';
      setTimeout(() => router.push('/app/dashboard'), 1000);
    } else {
      successMessage.value =
        response.data?.message || 'Đăng ký thành công! Hãy đăng nhập.';
      setTimeout(() => switchMode('login'), 1000);
    }
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Đăng ký thất bại!';
  } finally {
    registering.value = false;
  }
};

const handleForgotPassword = async () => {
  errorMessage.value = '';
  successMessage.value = '';

  if (forgotForm.value.newPassword !== forgotForm.value.confirmPassword) {
    errorMessage.value = 'Mật khẩu xác nhận không khớp!';
    return;
  }

  if (forgotForm.value.newPassword.length < 6) {
    errorMessage.value = 'Mật khẩu mới phải có ít nhất 6 ký tự!';
    return;
  }

  resetting.value = true;

  try {
    await api.post('/auth/forgot-password', {
      username: forgotForm.value.username,
      newPassword: forgotForm.value.newPassword,
      confirmPassword: forgotForm.value.confirmPassword
    });

    successMessage.value = 'Cập nhật mật khẩu thành công! Hãy đăng nhập lại.';

    forgotForm.value = {
      username: '',
      newPassword: '',
      confirmPassword: ''
    };

    setTimeout(() => switchMode('login'), 1000);
  } catch (error) {
    errorMessage.value =
      error.response?.data?.message ||
      'Không thể cập nhật mật khẩu. Kiểm tra API /auth/forgot-password trong backend.';
  } finally {
    resetting.value = false;
  }
};

const handleGoogleAuth = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || api.defaults.baseURL;
  window.location.href = `${baseUrl}/auth/google?prompt=select_account`;
};
</script>

<style scoped>
.stock-auth {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: #faf9ff;
  color: #071a3d;
  font-family:
    Inter,
    "SF Pro Display",
    "Segoe UI",
    Arial,
    sans-serif;
}

.form-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 42px 72px;
  background:
    radial-gradient(circle at top left, rgba(13, 99, 255, 0.07), transparent 34%),
    #fbfaff;
}

.form-card {
  position: relative;
  width: 100%;
  max-width: 560px;
  font-family:
    Inter,
    "SF Pro Display",
    "Segoe UI",
    sans-serif;
}

.mode-register .form-card,
.mode-forgot .form-card {
  max-width: 560px;
}

.auth-tabs {
  display: flex;
  gap: 0;
  padding: 7px;
  margin-bottom: 36px;
  border-radius: 20px;
  background: #e9edf9;
  box-shadow:
    inset 0 0 0 1px rgba(0, 71, 179, 0.04),
    0 18px 45px rgba(24, 42, 78, 0.08);
}

.auth-tabs button {
  flex: 1;
  min-height: 60px;
  border: 0;
  border-radius: 15px;
  background: transparent;
  color: #26334d;
  font-size: 24px;
  font-weight: 800;
  letter-spacing: 0.4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.auth-tabs button.active {
  background: linear-gradient(135deg, #0d63ff, #004bb8);
  color: #ffffff;
  box-shadow: 0 12px 30px rgba(0, 75, 184, 0.35);
}

.auth-tabs button:hover:not(.active) {
  background: rgba(255, 255, 255, 0.62);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 17px;
  animation: fadeSlide 0.35s ease;
}

.auth-form.compact {
  gap: 19px;
}

@keyframes fadeSlide {
  from {
    opacity: 0;
    transform: translateY(16px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field label {
  color: #1f2b46;
  font-size: 14px;
  font-weight: 650;
  letter-spacing: 0.22px;
}

.field input,
.password-wrap {
  width: 100%;
  min-height: 54px;
  border: 1.5px solid #d6def0;
  border-radius: 13px;
  background: #ffffff;
  color: #1b2a4a;
  transition: all 0.25s ease;
}

.field input {
  padding: 0 18px;
  font-size: 15px;
  font-weight: 500;
}

.field input::placeholder {
  color: #9aa7c2;
  font-size: 14px;
  font-weight: 400;
}

.password-wrap {
  display: flex;
  align-items: center;
  padding: 0 12px 0 18px;
}

.password-wrap input {
  flex: 1;
  min-height: auto;
  border: 0;
  padding: 0;
  outline: none;
}

.eye-btn {
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 10px;
  background: #f3f6ff;
  cursor: pointer;
  color: #33415f;
  font-size: 14px;
  transition: 0.2s;
}

.eye-btn:hover {
  background: #e7eeff;
}

.field input:focus,
.password-wrap:focus-within {
  border-color: #0d63ff;
  box-shadow: 0 0 0 5px rgba(13, 99, 255, 0.12);
  outline: 0;
}

.option-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 13px;
}

.option-line label,
.terms-line {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #4c5670;
  font-weight: 500;
}

.option-line input,
.terms-line input {
  width: 15px;
  height: 15px;
  accent-color: #0d63ff;
}

.option-line button,
.switch-text button {
  border: 0;
  background: transparent;
  color: #0048b8;
  font-weight: 800;
  cursor: pointer;
  transition: 0.2s;
}

.option-line button:hover,
.switch-text button:hover {
  color: #0d63ff;
  text-decoration: underline;
}

.terms-line {
  align-items: flex-start;
  margin-top: 2px;
  font-size: 13px;
  line-height: 1.45;
}

.primary-btn {
  min-height: 52px;
  border: 0;
  border-radius: 13px;
  background: linear-gradient(135deg, #0d63ff, #004bb8);
  color: #ffffff;
  font-size: 16px;
  font-weight: 750;
  letter-spacing: 0.35px;
  cursor: pointer;
  box-shadow: 0 14px 26px rgba(0, 75, 184, 0.25);
  transition: all 0.25s ease;
}

.primary-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 18px 34px rgba(0, 75, 184, 0.34);
}

.primary-btn:disabled {
  opacity: 0.72;
  cursor: not-allowed;
}

.back-home-btn {
  min-height: 46px;
  border: 1.5px solid #d6def0;
  border-radius: 13px;
  background: #ffffff;
  color: #33415f;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.22s;
}

.back-home-btn:hover {
  color: #004bb8;
  border-color: #0d63ff;
  background: #f3f6ff;
  transform: translateY(-1px);
}

.divider {
  display: flex;
  align-items: center;
  gap: 14px;
  margin: 18px 0 2px;
  color: #7b8497;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.12em;
}

.divider::before,
.divider::after {
  content: '';
  height: 1px;
  flex: 1;
  background: #cfd6e6;
}

.quick-login-btn {
  min-height: 50px;
  border: 1.5px solid #d6def0;
  border-radius: 13px;
  background: #ffffff;
  color: #132342;
  font-size: 14px;
  font-weight: 750;
  cursor: pointer;
  transition: 0.22s;
}

.quick-login-btn:hover {
  border-color: #0d63ff;
  background: #f7f9ff;
  transform: translateY(-2px);
}

.google-mark {
  font-weight: 900;
  color: #0d63ff;
}

.switch-text {
  margin: 10px 0 0;
  text-align: center;
  color: #4c5670;
  font-size: 13px;
}

.register-switch {
  padding-top: 18px;
  border-top: 1px solid #e2e7f3;
}

.message {
  margin-top: 16px;
  padding: 12px 14px;
  border-radius: 13px;
  font-size: 13px;
  font-weight: 700;
}

.message.error {
  background: #ffdad6;
  color: #93000a;
}

.message.success {
  background: #dff7e6;
  color: #12602a;
}

.hero-panel {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 56px;
  background: #004bb8;
}

.hero-bg {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(0deg, rgba(0, 74, 180, 0.82), rgba(0, 74, 180, 0.78)),
    url('https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1400&q=80') center/cover;
  animation: bgZoom 12s ease-in-out infinite alternate;
}

.mode-register .hero-bg,
.mode-forgot .hero-bg {
  background:
    linear-gradient(135deg, rgba(0, 69, 170, 0.95), rgba(0, 86, 190, 0.86)),
    url('https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1400&q=80') center/cover;
}

@keyframes bgZoom {
  from {
    transform: scale(1);
  }

  to {
    transform: scale(1.08);
  }
}

.login-glass {
  position: relative;
  z-index: 1;
  width: min(430px, 100%);
  padding: 54px 42px 44px;
  border-radius: 30px;
  text-align: center;
  color: #ffffff;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.24);
  box-shadow: 0 22px 70px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(18px);
  animation: floatCard 4s ease-in-out infinite;
}

@keyframes floatCard {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-12px);
  }
}

.hero-icon {
  width: 72px;
  height: 72px;
  margin: 0 auto 26px;
  display: grid;
  place-items: center;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.16);
  font-size: 46px;
}

.login-glass h2 {
  margin: 0 0 28px;
  font-size: 48px;
  font-weight: 850;
  letter-spacing: -0.04em;
}

.login-glass p {
  margin: 0 0 42px;
  font-size: 22px;
  line-height: 1.4;
  font-weight: 700;
}

.login-glass em {
  font-weight: 500;
  color: rgba(255, 255, 255, 0.82);
}

.login-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.login-stats div {
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: #ffffff;
}

.login-stats strong {
  color: #d9e6ff;
  font-size: 22px;
}

.login-stats span {
  font-size: 9px;
  opacity: 0.72;
  letter-spacing: 0.12em;
}

.login-stats b {
  font-size: 13px;
}

.register-copy {
  position: relative;
  z-index: 1;
  width: min(680px, 100%);
  color: #ffffff;
  animation: fadeSlide 0.45s ease;
}

.register-copy h2 {
  max-width: 650px;
  margin: 0 0 28px;
  font-size: 64px;
  line-height: 1.05;
  font-weight: 800;
  letter-spacing: -2px;
}

.register-copy > p {
  max-width: 610px;
  margin: 0 0 46px;
  font-size: 20px;
  line-height: 1.8;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.92);
}

.benefit-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 22px;
  margin-bottom: 42px;
}

.benefit-grid div {
  padding: 32px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  transition: all 0.3s ease;
}

.benefit-grid div:hover {
  transform: translateY(-10px);
  background: rgba(255, 255, 255, 0.18);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
}

.benefit-grid i {
  width: 46px;
  height: 46px;
  display: grid;
  place-items: center;
  margin-bottom: 22px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.12);
  font-style: normal;
}

.benefit-grid h3 {
  margin: 0 0 12px;
  font-size: 28px;
  font-weight: 750;
  line-height: 1.18;
  letter-spacing: -0.5px;
}

.benefit-grid p {
  margin: 0;
  font-size: 16px;
  line-height: 1.7;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.88);
}

.trust-pill {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 13px 18px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
  font-size: 13px;
  font-weight: 750;
  backdrop-filter: blur(10px);
}

@media (max-width: 1180px) {
  .register-copy h2 {
    font-size: 54px;
  }

  .register-copy > p {
    font-size: 18px;
  }
}

@media (max-width: 980px) {
  .stock-auth {
    grid-template-columns: 1fr;
  }

  .hero-panel {
    display: none;
  }

  .form-panel {
    min-height: 100vh;
    padding: 50px 22px;
  }
}

@media (max-width: 520px) {
  .form-card {
    max-width: 100%;
  }

  .auth-tabs button {
    min-height: 52px;
    font-size: 18px;
  }
}

/* ✅ Thêm style cho Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-overlay.show {
  display: flex;
}

.modal-dialog {
  width: 100%;
  max-width: 480px;
  animation: slideUp 0.3s ease;
}

.modal-content {
  background: white;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
}

.modal-header {
  padding: 20px 24px;
  background: linear-gradient(135deg, #fef2f2, #fee2e2);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #fca5a5;
}

.modal-header h3 {
  color: #991b1b;
  font-size: 18px;
  font-weight: 700;
  margin: 0;
}

.modal-close {
  background: rgba(153, 27, 27, 0.1);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
  color: #991b1b;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  background: rgba(153, 27, 27, 0.2);
}

.modal-body {
  padding: 24px;
}

.modal-footer {
  padding: 16px 24px;
  background: #f8fafc;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid #e5e7eb;
}

.btn-cancel {
  padding: 10px 24px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  background: white;
  color: #6b7280;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #f3f4f6;
}

.btn-primary {
  padding: 10px 24px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #0d63ff, #004bb8);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(13, 99, 255, 0.3);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.force-password-icon {
  text-align: center;
  font-size: 48px;
  margin-bottom: 12px;
}

.force-password-text {
  text-align: center;
  color: #374151;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 20px;
}

.required {
  color: #ef4444;
}

.error-hint {
  font-size: 12px;
  color: #ef4444;
  margin-top: 4px;
}

.password-strength {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.strength-bar {
  width: 60px;
  height: 4px;
  border-radius: 4px;
  background: #e2e8f0;
  overflow: hidden;
  position: relative;
}

.strength-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  transition: all 0.3s;
}

.strength-bar.weak::after { background: #ef4444; width: 33%; }
.strength-bar.medium::after { background: #f59e0b; width: 66%; }
.strength-bar.strong::after { background: #10b981; width: 100%; }

.strength-text {
  font-size: 12px;
  color: #64748b;
}

.password-requirements {
  list-style: none;
  margin-top: 8px;
  font-size: 11px;
  color: #94a3b8;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 0;
}

.password-requirements li {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.password-requirements li.met {
  color: #10b981;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive cho modal */
@media (max-width: 520px) {
  .modal-dialog {
    max-width: 100%;
    margin: 10px;
  }
  
  .modal-body {
    padding: 16px;
  }
  
  .modal-footer {
    flex-direction: column;
  }
  
  .btn-cancel,
  .btn-primary {
    width: 100%;
    justify-content: center;
  }
}
</style>