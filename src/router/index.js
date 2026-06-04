import { createRouter, createWebHistory } from 'vue-router';
import LandingPage from '@/views/LandingPage.vue';  // ✅ THÊM IMPORT LANDING PAGE
import Login from '@/views/login/Login.vue';
import Dashboard from '@/views/dashboard/Dashboard.vue';
import UserManagement from '@/views/users/UserManagement.vue';
import OrderList from '@/views/orders/OrderList.vue';
import OrderCreate from '@/views/orders/OrderCreate.vue';
import OrderDetail from '@/views/orders/OrderDetail.vue';
import ProductList from '@/views/products/ProductList.vue';
import InventoryManage from '@/views/products/InventoryManage.vue';
import Reports from '@/views/reports/Reports.vue';
import MainLayout from '@/layouts/MainLayout.vue';

// ✅ Khai báo title cho từng route
const routes = [
  { path: '/', component: LandingPage, meta: { title: 'Trang chủ' } },  // ✅ THÊM ROUTE LANDING PAGE
  { path: '/login', component: Login, meta: { title: 'Đăng nhập' } },
  {
    path: '/app',  // ✅ ĐỔI TỪ '/' THÀNH '/app' ĐỂ PHÂN BIỆT VỚI LANDING PAGE
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/app/dashboard' },
      { path: 'dashboard', component: Dashboard, meta: { requiresAuth: true, title: 'Dashboard' } },
      { path: 'users', component: UserManagement, meta: { requiresAuth: true, requiresAdmin: true, title: 'Quản lý người dùng' } },
      { path: 'orders', component: OrderList, meta: { requiresAuth: true, title: 'Quản lý đơn hàng' } },
      { path: 'orders/create', component: OrderCreate, meta: { requiresAuth: true, title: 'Tạo đơn hàng' } },
      { path: 'orders/:id', component: OrderDetail, meta: { requiresAuth: true, title: 'Chi tiết đơn hàng' } },
      { path: 'products', component: ProductList, meta: { requiresAuth: true, title: 'Quản lý sản phẩm' } },
      { path: 'inventory', component: InventoryManage, meta: { requiresAuth: true, title: 'Quản lý kho hàng' } },
      { path: 'reports', component: Reports, meta: { requiresAuth: true, requiresAdmin: true, title: 'Báo cáo thống kê' } }
    ]
  },
  // Route 404 - chuyển về trang chủ
  { path: '/:pathMatch(.*)*', redirect: '/' }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  }
});

// ✅ Cập nhật title trang
router.beforeEach((to, from) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  
  // ✅ Cập nhật title trình duyệt
  if (to.meta.title) {
    document.title = `${to.meta.title} | Microservices Dashboard`;
  } else {
    document.title = 'Microservices Dashboard';
  }
  
  // ✅ Nếu là landing page, cho phép vào tự do
  if (to.path === '/') {
    return true;
  }
  
  // Nếu trang yêu cầu đăng nhập mà không có token -> về landing page
  if (to.meta.requiresAuth && !token) {
    return '/';
  }
  
  // Nếu đã có token mà vào login -> về dashboard
  if (to.path === '/login' && token) {
    return '/app/dashboard';
  }
  
  // Nếu trang yêu cầu admin mà role không phải Admin -> về dashboard
  if (to.meta.requiresAdmin && role !== 'Admin') {
    return '/app/dashboard';
  }
  
  // Cho phép đi tiếp
  return true;
});

export default router;