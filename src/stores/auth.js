import { defineStore } from 'pinia';
import { userApi } from '@/api/axios';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: null,
    role: localStorage.getItem('role') || null,
    fullName: localStorage.getItem('fullName') || null
  }),
  
  getters: {
    // ✅ Thêm getter để dễ dàng kiểm tra
    isAdmin: (state) => {
      return state.role === 'Admin';
    },
    isAuthenticated: (state) => {
      return !!state.token;
    },
    displayName: (state) => {
      return state.fullName || state.user?.fullName || 'User';
    }
  },
  
  actions: {
    async login(username, password) {
      try {
        console.log('=== ĐANG ĐĂNG NHẬP ===');
        console.log('Username:', username);
        
        const res = await userApi.post('/auth/login', { username, password });
        
        console.log('Login response:', res.data);
        
        // Cập nhật state
        this.token = res.data.token;
        this.role = res.data.role;
        this.fullName = res.data.fullName;
        this.user = { fullName: res.data.fullName, id: res.data.userId };
        
        // Lưu vào localStorage
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('role', res.data.role);
        localStorage.setItem('fullName', res.data.fullName);
        localStorage.setItem('userId', res.data.userId);
        
        console.log('✅ Đã lưu - Role:', this.role);
        console.log('✅ Đã lưu - FullName:', this.fullName);
        
        return true;
      } catch (error) {
        console.error('❌ Login failed:', error);
        console.error('Error response:', error.response?.data);
        return false;
      }
    },
    
    logout() {
      console.log('=== ĐANG ĐĂNG XUẤT ===');
      this.token = null;
      this.user = null;
      this.role = null;
      this.fullName = null;
      localStorage.clear();
      console.log('✅ Đã xóa localStorage');
    },
    
    // ✅ Cập nhật lại phương thức isAdmin (có thể dùng getter hoặc method)
    checkIsAdmin() {
      const isAdmin = this.role === 'Admin';
      console.log('checkIsAdmin - role:', this.role, 'result:', isAdmin);
      return isAdmin;
    }
  }
});