<template>
  <div class="app-wrapper">
    <!-- Sidebar -->
    <aside class="sidebar" :class="{ collapsed: isCollapsed, 'mobile-open': mobileSidebarOpen }">
      <div class="sidebar-header">
        <div class="logo" @click="router.push('/app/dashboard')">
          <div class="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <div class="logo-text" v-show="!isCollapsed">
            <span class="logo-title">SmartStockDNU</span>
            <span class="logo-subtitle">Dashboard</span>
          </div>
        </div>
        <button class="collapse-btn" @click="toggleSidebar">
          <svg class="collapse-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline v-if="!isCollapsed" points="15 18 9 12 15 6"/>
            <polyline v-else points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>

      <div class="user-profile" v-if="!isCollapsed">
        <div class="user-avatar">
          <img :src="userAvatar" alt="Avatar" @error="handleAvatarError">
          <div class="online-dot"></div>
        </div>
        <div class="user-info">
          <h4>{{ displayName }}</h4>
          <span class="user-role">{{ displayRole }}</span>
        </div>
      </div>

      <div class="user-profile-mini" v-else>
        <img :src="userAvatar" alt="Avatar" @error="handleAvatarError">
      </div>

      <nav class="sidebar-nav">
        <div class="nav-section" v-if="!isCollapsed"><span>MENU CHÍNH</span></div>
        
        <router-link to="/app/dashboard" class="nav-item" :class="{ active: $route.path === '/app/dashboard' }">
          <span class="nav-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/>
              <rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
          </span>
          <span class="nav-text" v-show="!isCollapsed">Dashboard</span>
        </router-link>

        <router-link v-if="isAdminUser" to="/app/users" class="nav-item" :class="{ active: $route.path === '/app/users' }">
          <span class="nav-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </span>
          <span class="nav-text" v-show="!isCollapsed">Người dùng</span>
        </router-link>

        <router-link to="/app/orders" class="nav-item" :class="{ active: $route.path === '/app/orders' }">
          <span class="nav-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </span>
          <span class="nav-text" v-show="!isCollapsed">Đơn hàng</span>
        </router-link>

        <router-link to="/app/products" class="nav-item" :class="{ active: $route.path === '/app/products' }">
          <span class="nav-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            </svg>
          </span>
          <span class="nav-text" v-show="!isCollapsed">Sản phẩm</span>
        </router-link>

        <router-link to="/app/inventory" class="nav-item" :class="{ active: $route.path === '/app/inventory' }">
          <span class="nav-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
          </span>
          <span class="nav-text" v-show="!isCollapsed">Kho hàng</span>
        </router-link>

        <router-link v-if="isAdminUser" to="/app/reports" class="nav-item" :class="{ active: $route.path === '/app/reports' }">
          <span class="nav-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 20V10M12 20V4M6 20v-6"/>
            </svg>
          </span>
          <span class="nav-text" v-show="!isCollapsed">Báo cáo</span>
        </router-link>

        <div class="nav-divider"></div>
        <div class="nav-section" v-if="!isCollapsed"><span>HỆ THỐNG</span></div>

        <router-link to="/app/settings" class="nav-item" :class="{ active: $route.path === '/app/settings' }">
          <span class="nav-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </span>
          <span class="nav-text" v-show="!isCollapsed">Cài đặt</span>
        </router-link>

        <a href="#" class="nav-item logout-item" @click.prevent="logout">
          <span class="nav-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </span>
          <span class="nav-text" v-show="!isCollapsed">Đăng xuất</span>
        </a>
      </nav>
    </aside>

    <!-- Main Content -->
    <div class="main-container" :class="{ expanded: isCollapsed }">
      <header class="top-navbar">
        <div class="navbar-left">
          <button class="mobile-toggle" @click="toggleMobileSidebar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <div class="page-title">{{ currentPageTitle }}</div>
        </div>
        
        <div class="navbar-right">
          <!-- Chuông thông báo -->
          <div class="notification-wrapper">
            <button class="notification-btn" @click.stop="toggleNotifications">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <span class="notif-badge" v-if="lowStockProducts.length > 0">{{ lowStockProducts.length }}</span>
            </button>

            <div class="notification-dropdown" v-show="showNotifications">
              <div class="notif-header">
                <h4>Cảnh báo tồn kho</h4>
                <span class="notif-count">{{ lowStockProducts.length }} sản phẩm</span>
              </div>
              <div class="dropdown-divider"></div>
              <div class="notif-body">
                <div v-if="lowStockProducts.length === 0" class="notif-empty">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  <p>Tất cả sản phẩm đều đủ hàng</p>
                </div>
                <div v-else class="notif-list">
                  <div v-for="product in lowStockProducts" :key="product.id" class="notif-item" @click="goToInventory">
                    <div class="notif-icon warning">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                        <line x1="12" y1="9" x2="12" y2="13"/>
                        <line x1="12" y1="17" x2="12.01" y2="17"/>
                      </svg>
                    </div>
                    <div class="notif-content">
                      <strong>{{ product.name }}</strong>
                      <span>Tồn: <span class="text-danger">{{ product.stockQuantity || 0 }}</span> / Ngưỡng: {{ product.minStockThreshold || 10 }}</span>
                    </div>
                    <span :class="['notif-status', product.stockQuantity <= 0 ? 'out' : 'low']">
                      {{ product.stockQuantity <= 0 ? 'Hết' : 'Thấp' }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="dropdown-divider"></div>
              <div class="notif-footer">
                <button @click="goToInventory">Xem tất cả</button>
              </div>
            </div>
          </div>

          <!-- USER DROPDOWN -->
          <div class="user-dropdown" ref="userDropdownRef">
            <div class="user-trigger" @click.stop="toggleUserMenu">
              <img :src="userAvatar" alt="Avatar" @error="handleAvatarError">
              <div class="user-details">
                <strong>{{ displayName }}</strong>
                <small>{{ displayRole }}</small>
              </div>
              <svg class="chevron-icon" :class="{ rotated: showUserMenu }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>

            <div class="dropdown-menu" v-if="showUserMenu" @click.stop>
              <div class="dropdown-header">
                <img :src="userAvatar" alt="Avatar">
                <div>
                  <strong>{{ displayName }}</strong>
                  <span>{{ displayRole }}</span>
                </div>
              </div>
              <div class="dropdown-divider"></div>
              <router-link to="/app/change-password" class="dropdown-item" @click="showUserMenu = false">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                Đổi mật khẩu
              </router-link>
              <router-link to="/app/settings" class="dropdown-item" @click="showUserMenu = false">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
                Cài đặt
              </router-link>
              <div class="dropdown-divider"></div>
              <a href="#" class="dropdown-item logout" @click.prevent="logout">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Đăng xuất
              </a>
            </div>
          </div>
        </div>
      </header>

      <main class="page-content">
        <router-view />
      </main>
    </div>

    <div class="mobile-overlay" v-if="mobileSidebarOpen" @click="closeMobileSidebar"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'; // ✅ Thêm watch vào import
import { useAuthStore } from '@/stores/auth';
import { useRouter, useRoute } from 'vue-router';
import { productApi } from '@/api/axios';
import accountStatusService from '@/services/AccountStatusService';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const isCollapsed = ref(false);
const showUserMenu = ref(false);
const showNotifications = ref(false);
const mobileSidebarOpen = ref(false);
const lowStockProducts = ref([]);
const userDropdownRef = ref(null);
const defaultAvatar = 'https://ui-avatars.com/api/?background=6366f1&color=fff&bold=true';

const userRole = computed(() => authStore.role || localStorage.getItem('role') || 'Guest');
const isAdminUser = computed(() => userRole.value === 'Admin');
const displayName = computed(() => authStore.user?.fullName || localStorage.getItem('fullName') || 'User');
const displayRole = computed(() => userRole.value);
const userAvatar = computed(() => authStore.user?.avatar || defaultAvatar);

const currentPageTitle = computed(() => {
  const titles = {
    '/app/dashboard': 'Dashboard',
    '/app/users': 'Quản lý người dùng',
    '/app/orders': 'Quản lý đơn hàng',
    '/app/products': 'Quản lý sản phẩm',
    '/app/inventory': 'Quản lý kho hàng',
    '/app/reports': 'Báo cáo thống kê',
    '/app/change-password': 'Đổi mật khẩu',
    '/app/settings': 'Cài đặt hệ thống'
  };
  return titles[route.path] || 'Trang chủ';
});

// ✅ Thêm watcher để kiểm tra khi chuyển trang
watch(() => route.path, () => {
  const token = localStorage.getItem('token');
  if (token) {
    accountStatusService.checkStatus();
  }
});

async function loadLowStockProducts() {
  try {
    const res = await productApi.get('/products');
    const products = res.data || [];
    lowStockProducts.value = products.filter(p => (p.stockQuantity || 0) <= (p.minStockThreshold || 10));
  } catch (error) {
    lowStockProducts.value = [
      { id: 1, name: 'Laptop Dell', stockQuantity: 0, minStockThreshold: 10 },
      { id: 2, name: 'Chuột không dây', stockQuantity: 2, minStockThreshold: 10 },
    ];
  }
}

function handleAvatarError(e) {
  e.target.src = defaultAvatar;
}

function toggleSidebar() { isCollapsed.value = !isCollapsed.value; }
function toggleMobileSidebar() { mobileSidebarOpen.value = !mobileSidebarOpen.value; }
function closeMobileSidebar() { mobileSidebarOpen.value = false; }

function toggleUserMenu(e) {
  if (e) e.stopPropagation();
  showUserMenu.value = !showUserMenu.value;
  if (showUserMenu.value) showNotifications.value = false;
}

function toggleNotifications(e) {
  if (e) e.stopPropagation();
  showNotifications.value = !showNotifications.value;
  if (showNotifications.value) showUserMenu.value = false;
}

function goToInventory() {
  showNotifications.value = false;
  router.push('/app/inventory');
}

function logout() {
  showUserMenu.value = false;
  showNotifications.value = false;
  authStore.logout();
  router.push('/');
}

function handleClickOutside(e) {
  if (userDropdownRef.value && !userDropdownRef.value.contains(e.target)) {
    showUserMenu.value = false;
  }
}

onMounted(() => {
  loadLowStockProducts();
  setTimeout(() => {
    document.addEventListener('click', handleClickOutside);
  }, 100);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style>
/* Reset */
* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f8fafc;
  overflow-x: hidden;
  color: #1e293b;
}

.app-wrapper { display: flex; min-height: 100vh; }

/* Sidebar */
.sidebar {
  width: 260px;
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
  color: #94a3b8;
  transition: width 0.3s ease;
  position: fixed; top: 0; left: 0; height: 100vh;
  z-index: 1000; display: flex; flex-direction: column;
  box-shadow: 4px 0 24px rgba(0,0,0,0.2);
}
.sidebar.collapsed { width: 76px; }

.sidebar-header {
  padding: 20px 16px; display: flex;
  justify-content: space-between; align-items: center;
  border-bottom: 1px solid rgba(255,255,255,0.06); flex-shrink: 0;
}
.logo { display: flex; align-items: center; gap: 12px; cursor: pointer; }
.logo-icon {
  width: 38px; height: 38px;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.logo-icon svg { width: 20px; height: 20px; color: white; }
.logo-text { display: flex; flex-direction: column; }
.logo-title { font-size: 16px; font-weight: 700; color: white; }
.logo-subtitle { font-size: 10px; color: #6366f1; }

.collapse-btn {
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
  color: #94a3b8; width: 34px; height: 34px; border-radius: 8px;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
}
.collapse-btn:hover { background: rgba(99,102,241,0.2); color: white; }
.collapse-icon { width: 18px; height: 18px; }

.user-profile { padding: 20px 16px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.06); }
.user-avatar { position: relative; display: inline-block; margin-bottom: 10px; }
.user-avatar img {
  width: 60px; height: 60px; border-radius: 50%;
  border: 2px solid rgba(99,102,241,0.4); object-fit: cover;
}
.online-dot {
  position: absolute; bottom: 3px; right: 3px;
  width: 12px; height: 12px; background: #10b981;
  border-radius: 50%; border: 2px solid #1e293b;
}
.user-info h4 { color: #f1f5f9; font-size: 14px; margin-bottom: 4px; }
.user-role {
  font-size: 11px; background: rgba(99,102,241,0.15);
  color: #a5b4fc; padding: 4px 10px; border-radius: 12px;
}
.user-profile-mini { padding: 20px; text-align: center; }
.user-profile-mini img {
  width: 40px; height: 40px; border-radius: 50%;
  border: 2px solid rgba(99,102,241,0.4);
}

.sidebar-nav {
  padding: 12px 10px; display: flex; flex-direction: column;
  gap: 2px; flex: 1; overflow-y: auto;
}
.nav-section {
  padding: 16px 12px 8px; font-size: 10px; font-weight: 700;
  letter-spacing: 2px; color: #64748b;
}
.nav-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px; border-radius: 8px;
  color: #94a3b8; text-decoration: none;
  transition: all 0.2s; font-size: 13px;
}
.nav-item:hover { background: rgba(99,102,241,0.08); color: #c7d2fe; }
.nav-item.active {
  background: linear-gradient(135deg, rgba(99,102,241,0.25), rgba(79,70,229,0.15));
  color: #e0e7ff;
}
.nav-icon { width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.nav-icon svg { width: 18px; height: 18px; }
.nav-text { flex: 1; }
.nav-divider { height: 1px; background: rgba(255,255,255,0.06); margin: 8px 12px; }
.logout-item:hover { background: rgba(239,68,68,0.12) !important; color: #fca5a5 !important; }

/* Main Container */
.main-container { flex: 1; margin-left: 260px; transition: margin-left 0.3s ease; min-height: 100vh; }
.main-container.expanded { margin-left: 76px; }

/* Top Navbar */
.top-navbar {
  background: white; padding: 12px 24px; display: flex;
  justify-content: space-between; align-items: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  position: sticky; top: 0; z-index: 998;
  border-bottom: 1px solid #e2e8f0;
}
.navbar-left { display: flex; align-items: center; gap: 14px; }
.mobile-toggle { display: none; background: none; border: none; cursor: pointer; color: #64748b; padding: 6px; border-radius: 6px; }
.mobile-toggle svg { width: 22px; height: 22px; }
.page-title { font-size: 18px; font-weight: 600; color: #1e293b; }
.navbar-right { display: flex; align-items: center; gap: 8px; }

/* Notification */
.notification-wrapper { position: relative; }
.notification-btn {
  position: relative; background: #f8fafc; border: 1px solid #e2e8f0;
  width: 38px; height: 38px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: #64748b; transition: all 0.2s;
}
.notification-btn:hover { background: #f1f5f9; color: #1e293b; }
.notification-btn svg { width: 18px; height: 18px; }
.notif-badge {
  position: absolute; top: -4px; right: -4px;
  background: #ef4444; color: white; font-size: 9px;
  min-width: 18px; height: 18px; border-radius: 9px;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; border: 2px solid white;
}

.notification-dropdown {
  position: absolute; top: calc(100% + 8px); right: 0;
  width: 340px; background: white; border-radius: 14px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.12);
  overflow: hidden; z-index: 1001; border: 1px solid #f1f5f9;
}
.notif-header { padding: 16px; display: flex; justify-content: space-between; align-items: center; }
.notif-header h4 { font-size: 15px; color: #1e293b; margin: 0; }
.notif-count { font-size: 12px; background: #fef2f2; color: #ef4444; padding: 4px 10px; border-radius: 12px; font-weight: 600; }
.notif-body { max-height: 300px; overflow-y: auto; }
.notif-empty { padding: 32px 16px; text-align: center; color: #94a3b8; }
.notif-empty svg { width: 40px; height: 40px; margin-bottom: 12px; }
.notif-list { padding: 4px; }
.notif-item {
  display: flex; align-items: center; gap: 12px;
  padding: 12px; border-radius: 10px; cursor: pointer; transition: all 0.15s;
}
.notif-item:hover { background: #f8fafc; }
.notif-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.notif-icon.warning { background: #fffbeb; color: #f59e0b; }
.notif-icon svg { width: 18px; height: 18px; }
.notif-content { flex: 1; }
.notif-content strong { display: block; font-size: 13px; color: #1e293b; margin-bottom: 2px; }
.notif-content span { font-size: 12px; color: #64748b; }
.text-danger { color: #ef4444 !important; font-weight: 600; }
.notif-status { font-size: 10px; padding: 3px 8px; border-radius: 10px; font-weight: 600; white-space: nowrap; }
.notif-status.out { background: #fef2f2; color: #ef4444; }
.notif-status.low { background: #fffbeb; color: #d97706; }
.notif-footer { padding: 12px 16px; text-align: center; }
.notif-footer button { background: none; border: none; color: #6366f1; font-size: 13px; font-weight: 600; cursor: pointer; }
.notif-footer button:hover { text-decoration: underline; }
.dropdown-divider { height: 1px; background: #f1f5f9; }

/* USER DROPDOWN */
.user-dropdown { position: relative; z-index: 1001; }
.user-trigger {
  display: flex; align-items: center; gap: 10px;
  cursor: pointer; padding: 5px 10px 5px 5px;
  border-radius: 8px; transition: all 0.2s;
  border: 1px solid transparent;
}
.user-trigger:hover { background: #f8fafc; border-color: #e2e8f0; }
.user-trigger img { width: 34px; height: 34px; border-radius: 50%; object-fit: cover; }
.user-details { display: flex; flex-direction: column; }
.user-details strong { font-size: 13px; color: #1e293b; }
.user-details small { font-size: 11px; color: #64748b; }
.chevron-icon { width: 16px; height: 16px; color: #94a3b8; transition: transform 0.2s; }
.chevron-icon.rotated { transform: rotate(180deg); }

.dropdown-menu {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 240px;
  background: white;
  border-radius: 14px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.18);
  overflow: hidden;
  z-index: 2000;
  border: 1px solid #e2e8f0;
}
.dropdown-header {
  padding: 16px; display: flex; align-items: center; gap: 12px;
  background: #f8fafc; border-bottom: 1px solid #e2e8f0;
}
.dropdown-header img { width: 40px; height: 40px; border-radius: 50%; }
.dropdown-header strong { display: block; font-size: 14px; color: #1e293b; }
.dropdown-header span { font-size: 12px; color: #64748b; }
.dropdown-item {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 16px; color: #475569;
  text-decoration: none; font-size: 13px;
  transition: all 0.15s; cursor: pointer;
}
.dropdown-item:hover { background: #f1f5f9; }
.dropdown-item svg { width: 18px; height: 18px; color: #94a3b8; }
.dropdown-item.logout { color: #ef4444; }
.dropdown-item.logout:hover { background: #fef2f2; }

/* Page Content */
.page-content { padding: 24px; }
.mobile-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 999; }

/* Responsive */
@media (max-width: 1024px) {
  .sidebar { width: 76px; }
  .sidebar .logo-text, .sidebar .user-profile, .sidebar .nav-text, .sidebar .nav-section { display: none !important; }
  .sidebar .user-profile-mini { display: block; }
  .main-container { margin-left: 76px; }
}
@media (max-width: 768px) {
  .sidebar { transform: translateX(-100%); width: 260px !important; }
  .sidebar.mobile-open { transform: translateX(0); }
  .sidebar.mobile-open .logo-text, .sidebar.mobile-open .user-profile, .sidebar.mobile-open .nav-text, .sidebar.mobile-open .nav-section { display: flex !important; }
  .main-container { margin-left: 0 !important; }
  .mobile-toggle { display: block; }
  .mobile-overlay { display: block; }
  .user-details { display: none; }
  .page-content { padding: 16px; }
  .notification-dropdown, .dropdown-menu { width: 260px; right: -10px; }
}
</style>