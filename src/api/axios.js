import axios from 'axios';

// User Service
export const userApi = axios.create({
  baseURL: 'https://userreportservice-2woo.onrender.com/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Order Service
export const orderApi = axios.create({
  baseURL: 'https://ordersalesservice.onrender.com/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Product Service
export const productApi = axios.create({
  baseURL: 'https://productservice-pvo5.onrender.com/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Gắn JWT Token
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

export default userApi;