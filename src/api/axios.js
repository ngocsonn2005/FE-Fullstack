import axios from 'axios';
import router from '@/router'; // ✅ Thêm import này

// Cấu hình API cho từng service
export const userApi = axios.create({
  baseURL: 'http://192.168.1.103:5000/api',
  headers: { 'Content-Type': 'application/json' }
});

export const orderApi = axios.create({
  baseURL: 'http://192.168.31.49:5044/api',
  headers: { 'Content-Type': 'application/json' }
});

export const productApi = axios.create({
  baseURL: 'http://192.168.30.244:5001/api',
  headers: { 'Content-Type': 'application/json' }
});

// Interceptor cho tất cả API
const attachToken = (config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

userApi.interceptors.request.use(attachToken);
orderApi.interceptors.request.use(attachToken);
productApi.interceptors.request.use(attachToken);

// ✅ THÊM RESPONSE INTERCEPTOR - XỬ LÝ 401 DO KHÓA TÀI KHOẢN
const handleUnauthorized = (error) => {
  if (error.response?.status === 401) {
    const data = error.response?.data || {};
    const message = data.message || '';
    
    // Kiểm tra nếu là lỗi do tài khoản bị khóa
    if (data.isLocked === true || message.includes('khóa') || message.includes('lock')) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('fullName');
      localStorage.removeItem('userId');
      localStorage.removeItem('rememberMe');
      
      alert('🔒 Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Admin để mở khóa!');
      router.push('/login');
    }
  }
  return Promise.reject(error);
};

userApi.interceptors.response.use(
  (response) => response,
  handleUnauthorized
);

orderApi.interceptors.response.use(
  (response) => response,
  handleUnauthorized
);

productApi.interceptors.response.use(
  (response) => response,
  handleUnauthorized
);

export default userApi;