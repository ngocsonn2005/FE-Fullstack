<template>
  <div class="app-wrapper">
    <!-- Sidebar -->
    <aside class="sidebar" :class="{ collapsed: isCollapsed }">
      <div class="sidebar-header">
        <div class="logo" @click="$router.push('/app/dashboard')">
          <div class="logo-icon">🏢</div>
          <div class="logo-text" v-show="!isCollapsed">
            <span class="logo-title">SmartStockDNU</span>
            <span class="logo-subtitle">Dashboard</span>
          </div>
        </div>
        <button class="collapse-btn" @click="toggleSidebar">
          <i>{{ isCollapsed ? '→' : '←' }}</i>
        </button>
      </div>

      <div class="user-profile" v-if="!isCollapsed">
        <div class="user-avatar">
          <img :src="userAvatar" alt="Avatar">
          <div class="online-dot"></div>
        </div>
        <div class="user-info">
          <h4>{{ displayName }}</h4>
          <span class="user-role">{{ displayRole }}</span>
        </div>
      </div>

      <div class="user-profile-mini" v-else>
        <img :src="userAvatar" alt="Avatar">
      </div>

      <nav class="sidebar-nav">
        <div class="nav-section" v-if="!isCollapsed">
          <span>MAIN MENU</span>
        </div>
        
        <router-link to="/app/dashboard" class="nav-item" :class="{ active: $route.path === '/app/dashboard' }">
          <span class="nav-icon">📊</span>
          <span class="nav-text" v-show="!isCollapsed">Dashboard</span>
          <span class="nav-badge" v-if="!isCollapsed">9+</span>
        </router-link>

        <router-link v-if="isAdminUser" to="/app/users" class="nav-item" :class="{ active: $route.path === '/app/users' }">
          <span class="nav-icon">👥</span>
          <span class="nav-text" v-show="!isCollapsed">Users</span>
        </router-link>

        <router-link to="/app/orders" class="nav-item" :class="{ active: $route.path === '/app/orders' }">
          <span class="nav-icon">🛒</span>
          <span class="nav-text" v-show="!isCollapsed">Orders</span>
        </router-link>

        <router-link to="/app/products" class="nav-item" :class="{ active: $route.path === '/app/products' }">
          <span class="nav-icon">📦</span>
          <span class="nav-text" v-show="!isCollapsed">Products</span>
        </router-link>

        <router-link to="/app/inventory" class="nav-item" :class="{ active: $route.path === '/app/inventory' }">
          <span class="nav-icon">🏪</span>
          <span class="nav-text" v-show="!isCollapsed">Inventory</span>
        </router-link>

        <router-link v-if="isAdminUser" to="/app/reports" class="nav-item" :class="{ active: $route.path === '/app/reports' }">
          <span class="nav-icon">📈</span>
          <span class="nav-text" v-show="!isCollapsed">Reports</span>
        </router-link>

        <div class="nav-divider"></div>

        <div class="nav-section" v-if="!isCollapsed">
          <span>SYSTEM</span>
        </div>

        <a href="#" class="nav-item" @click.prevent="openSettings">
          <span class="nav-icon">⚙️</span>
          <span class="nav-text" v-show="!isCollapsed">Settings</span>
        </a>

        <a href="#" class="nav-item logout-item" @click.prevent="logout">
          <span class="nav-icon">🚪</span>
          <span class="nav-text" v-show="!isCollapsed">Logout</span>
        </a>
      </nav>
    </aside>

    <!-- Main Content -->
    <div class="main-container" :class="{ expanded: isCollapsed }">
      <!-- Top Navbar -->
      <div class="top-navbar">
        <div class="navbar-left">
          <button class="mobile-toggle" @click="toggleSidebar">
            ☰
          </button>
          <div class="page-title">{{ currentPageTitle }}</div>
        </div>
        <div class="navbar-right">
          <div class="notification-btn">
            🔔
            <span class="notif-badge">3</span>
          </div>
          <div class="user-dropdown">
            <div class="user-info-mini" @click="toggleUserMenu">
              <img :src="userAvatar" alt="Avatar">
              <div class="user-details">
                <strong>{{ displayName }}</strong>
                <small>{{ displayRole }}</small>
              </div>
            </div>
            <div class="dropdown-menu-custom" v-show="showUserMenu">
              <a href="#" @click.prevent="logout">🚪 Đăng xuất</a>
            </div>
          </div>
        </div>
      </div>

      <!-- Page Content -->
      <div class="page-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter, useRoute } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();
const isCollapsed = ref(false);
const showUserMenu = ref(false);
const defaultAvatar = 'https://ui-avatars.com/api/?background=6366f1&color=fff&bold=true';

const userRole = computed(() => {
  return authStore.role || localStorage.getItem('role') || 'Guest';
});

const isAdminUser = computed(() => {
  const role = userRole.value;
  const isAdmin = role === 'Admin';
  console.log('isAdminUser check - role:', role, 'isAdmin:', isAdmin);
  return isAdmin;
});

const displayName = computed(() => {
  return authStore.user?.fullName || localStorage.getItem('fullName') || 'User';
});

const displayRole = computed(() => {
  return userRole.value;
});

const userAvatar = computed(() => {
  return authStore.user?.avatar || defaultAvatar;
});

const currentPageTitle = computed(() => {
  const titles = {
    '/app/dashboard': 'Dashboard',
    '/app/users': 'Quản lý người dùng',
    '/app/orders': 'Quản lý đơn hàng',
    '/app/products': 'Quản lý sản phẩm',
    '/app/inventory': 'Quản lý kho hàng',
    '/app/reports': 'Báo cáo thống kê'
  };
  return titles[route.path] || 'Trang chủ';
});

onMounted(() => {
  console.log('=== MainLayout mounted ===');
  console.log('authStore.role:', authStore.role);
  console.log('localStorage role:', localStorage.getItem('role'));
  console.log('userRole computed:', userRole.value);
  console.log('isAdminUser:', isAdminUser.value);
});

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value;
};

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value;
};

const logout = () => {
  authStore.logout();
  router.push('/');
};

const openSettings = () => {
  alert('Tính năng đang phát triển');
};

document.addEventListener('click', (e) => {
  if (!e.target.closest('.user-dropdown')) {
    showUserMenu.value = false;
  }
});
</script>

<style>
/* Reset CSS */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f5f7fa;
  overflow-x: hidden;
}

/* App Wrapper */
.app-wrapper {
  display: flex;
  min-height: 100vh;
}

/* Sidebar Styles */
.sidebar {
  width: 280px;
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
  color: #94a3b8;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 1000;
  overflow-y: auto;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.sidebar.collapsed {
  width: 80px;
}

.sidebar::-webkit-scrollbar {
  width: 5px;
}

.sidebar::-webkit-scrollbar-track {
  background: #334155;
}

.sidebar::-webkit-scrollbar-thumb {
  background: #6366f1;
  border-radius: 5px;
}

/* Sidebar Header */
.sidebar-header {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #334155;
  flex-shrink: 0;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: transform 0.2s;
}

.logo:hover {
  transform: scale(1.05);
}

.logo-icon {
  font-size: 32px;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
}

.logo-text {
  display: flex;
  flex-direction: column;
}

.logo-title {
  font-size: 18px;
  font-weight: 700;
  color: white;
  letter-spacing: 0.5px;
}

.logo-subtitle {
  font-size: 11px;
  color: #6366f1;
  letter-spacing: 1px;
}

.collapse-btn {
  background: #334155;
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.collapse-btn:hover {
  background: #6366f1;
  transform: scale(1.05);
}

/* User Profile */
.user-profile {
  padding: 24px 20px;
  text-align: center;
  border-bottom: 1px solid #334155;
  flex-shrink: 0;
}

.user-avatar {
  position: relative;
  display: inline-block;
}

.user-avatar img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid #6366f1;
  object-fit: cover;
}

.online-dot {
  position: absolute;
  bottom: 5px;
  right: 5px;
  width: 14px;
  height: 14px;
  background: #10b981;
  border-radius: 50%;
  border: 2px solid #1e293b;
}

.user-info h4 {
  color: white;
  font-size: 16px;
  margin: 12px 0 4px;
}

.user-role {
  font-size: 12px;
  color: #6366f1;
  background: rgba(99, 102, 241, 0.2);
  padding: 4px 12px;
  border-radius: 20px;
  display: inline-block;
}

.user-profile-mini {
  padding: 20px;
  text-align: center;
  flex-shrink: 0;
}

.user-profile-mini img {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  border: 2px solid #6366f1;
}

/* Navigation */
.sidebar-nav {
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  overflow-y: auto;
}

.nav-section {
  padding: 16px 12px 8px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1px;
  color: #64748b;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  color: #94a3b8;
  text-decoration: none;
  transition: all 0.2s;
  cursor: pointer;
  position: relative;
}

.nav-item:hover {
  background: rgba(99, 102, 241, 0.1);
  color: #a5b4fc;
  transform: translateX(4px);
}

.nav-item.active {
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.nav-icon {
  font-size: 20px;
  min-width: 24px;
}

.nav-text {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
}

.nav-badge {
  background: #ef4444;
  color: white;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 20px;
  font-weight: 600;
}

.nav-divider {
  height: 1px;
  background: #334155;
  margin: 16px 12px;
}

.logout-item {
  margin-top: 8px;
}

.logout-item:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #f87171;
}

/* Main Container */
.main-container {
  flex: 1;
  margin-left: 280px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 100vh;
}

.main-container.expanded {
  margin-left: 80px;
}

/* Top Navbar */
.top-navbar {
  background: white;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 999;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.mobile-toggle {
  display: none;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #1e293b;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.notification-btn {
  position: relative;
  background: #f1f5f9;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 20px;
}

.notification-btn:hover {
  background: #e2e8f0;
  transform: scale(1.05);
}

.notif-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #ef4444;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 20px;
  font-weight: bold;
}

.user-dropdown {
  position: relative;
}

.user-info-mini {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 12px;
  transition: all 0.2s;
}

.user-info-mini:hover {
  background: #f1f5f9;
}

.user-info-mini img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-details strong {
  font-size: 14px;
  color: #1e293b;
}

.user-details small {
  font-size: 11px;
  color: #64748b;
}

.dropdown-menu-custom {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  min-width: 180px;
  overflow: hidden;
  z-index: 1000;
}

.dropdown-menu-custom a {
  display: block;
  padding: 12px 16px;
  color: #1e293b;
  text-decoration: none;
  transition: background 0.2s;
}

.dropdown-menu-custom a:hover {
  background: #f1f5f9;
}

/* Page Content */
.page-content {
  padding: 24px;
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    position: fixed;
    z-index: 1050;
  }
  
  .sidebar.mobile-open {
    transform: translateX(0);
  }
  
  .main-container {
    margin-left: 0 !important;
  }
  
  .mobile-toggle {
    display: block;
  }
  
  .user-details {
    display: none;
  }
  
  .page-title {
    font-size: 18px;
  }
}

/* Animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.page-content {
  animation: fadeIn 0.3s ease-out;
}
</style>