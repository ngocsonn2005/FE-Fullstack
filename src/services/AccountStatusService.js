import api from '@/api/axios';
import router from '@/router';
import { useAuthStore } from '@/stores/auth'; // ✅ Thêm import này

class AccountStatusService {
  constructor() {
    this.checkInterval = null;
    this.isChecking = false;
    this.callbacks = [];
  }

  onLocked(callback) {
    this.callbacks.push(callback);
  }

  startChecking(interval = 8000) {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    this.checkStatus();

    this.checkInterval = setInterval(() => {
      this.checkStatus();
    }, interval);
  }

  stopChecking() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isChecking = false;
  }

  async checkStatus() {
    if (this.isChecking) return;
    
    const token = localStorage.getItem('token');
    if (!token) {
      this.stopChecking();
      return;
    }

    this.isChecking = true;
    try {
      const response = await api.get('/users/check-status');
      const data = response.data;
      
      if (data.isLocked || data.isDeleted) {
        this.stopChecking();
        
        this.callbacks.forEach(cb => {
          try { cb(data); } catch (e) { console.error('Callback error:', e); }
        });
        
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('fullName');
        localStorage.removeItem('userId');
        localStorage.removeItem('rememberMe');
        
        // ✅ Sử dụng useAuthStore để logout
        const authStore = useAuthStore();
        authStore.logout();
        
        const message = data.isLocked 
          ? '🔒 Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Admin để mở khóa!' 
          : '⚠️ Tài khoản đã bị vô hiệu hóa!';
        
        alert(message);
        router.push('/login');
      }
    } catch (error) {
      if (error.response?.status === 401) {
        this.stopChecking();
      }
    } finally {
      this.isChecking = false;
    }
  }
}

const accountStatusService = new AccountStatusService();
export default accountStatusService;