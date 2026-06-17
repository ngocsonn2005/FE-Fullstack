<template>
  <div class="dashboard-container">
    <!-- ==================== HEADER ==================== -->
    <header class="dashboard-header">
      <div class="header-left">
        <div class="user-profile">
          <div class="avatar-wrapper">
            <img :src="userAvatar" alt="Avatar" @error="handleAvatarError">
            <span class="status-indicator"></span>
          </div>
          <div class="user-info">
            <h1 class="user-greeting">
              <span class="greeting-text">{{ greeting }}</span>
              <span class="user-name">{{ authStore?.fullName || 'Admin' }}</span>
            </h1>
            <div class="user-meta">
              <span class="role-tag" :class="getRoleClass(authStore?.role)">
                {{ authStore?.role || 'Administrator' }}
              </span>
              <span class="meta-divider">|</span>
              <span class="meta-text">Quản trị hệ thống</span>
            </div>
          </div>
        </div>
      </div>
      <div class="header-right">
        <div class="date-display">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <div>
            <span class="date-day">{{ currentDay }}</span>
            <span class="date-full">{{ currentDate }}</span>
          </div>
        </div>
        <button class="refresh-button" @click="refreshData" :disabled="isRefreshing">
          <svg :class="{ spinning: isRefreshing }" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <polyline points="23 4 23 10 17 10"/>
            <polyline points="1 20 1 14 7 14"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
          <span>{{ isRefreshing ? 'Đang tải...' : 'Làm mới' }}</span>
        </button>
      </div>
    </header>

    <!-- ==================== STATS ROW ==================== -->
    <section class="stats-row">
      <div class="stat-item" v-for="stat in quickStats" :key="stat.label">
        <span class="stat-number">{{ stat.value }}</span>
        <span class="stat-label">{{ stat.label }}</span>
        <span class="stat-change" :class="stat.trend">{{ stat.change }}</span>
      </div>
    </section>

    <!-- ==================== NAVIGATION TABS ==================== -->
    <nav class="dashboard-nav">
      <button 
        v-for="tab in tabs" 
        :key="tab.key"
        class="nav-item" 
        :class="{ active: activeTab === tab.key }"
        @click="switchTab(tab.key)"
      >
        <span class="nav-icon" v-html="tab.icon" />
        <span>{{ tab.label }}</span>
        <span class="nav-badge" v-if="tab.badge">{{ tab.badge }}</span>
      </button>
    </nav>

    <!-- ============================================================ -->
    <!-- TAB: TỔNG QUAN -->
    <!-- ============================================================ -->
    <section v-if="activeTab === 'overview'" class="tab-content">
      <div class="metric-grid">
        <div class="metric-card" v-for="card in overviewStats" :key="card.label">
          <span class="metric-value">{{ card.value }}</span>
          <span class="metric-label">{{ card.label }}</span>
          <span class="metric-trend" :class="card.trend">{{ card.trendValue }}</span>
          <div class="metric-bar" v-if="card.progress">
            <div class="bar-track">
              <div class="bar-fill" :style="{ width: card.progress + '%' }"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="chart-grid">
        <div class="chart-container">
          <div class="chart-head">
            <div class="chart-title">
              <h3>Biểu đồ doanh thu</h3>
              <p>Theo dõi doanh thu 12 tháng gần nhất</p>
            </div>
            <div class="year-switcher">
              <button v-for="y in [2023, 2024, 2025]" :key="y" :class="['year-btn', { active: selectedYear === y }]" @click="selectedYear = y">{{ y }}</button>
            </div>
          </div>
          <div class="chart-body">
            <canvas id="revenueChart"></canvas>
          </div>
        </div>

        <div class="chart-container">
          <div class="chart-head">
            <div class="chart-title">
              <h3>Sản phẩm bán chạy</h3>
              <p>Top 5 sản phẩm có doanh số cao nhất</p>
            </div>
          </div>
          <div class="chart-body">
            <canvas id="topProductsChart"></canvas>
          </div>
        </div>
      </div>

      <div class="activity-panel">
        <div class="panel-header">
          <h3>Hoạt động gần đây</h3>
          <button class="view-all">Xem tất cả</button>
        </div>
        <div class="activity-feed">
          <div class="feed-item" v-for="activity in recentActivities" :key="activity.id">
            <div class="feed-icon" :class="activity.type" v-html="activity.icon" />
            <div class="feed-content">
              <p class="feed-text">{{ activity.text }}</p>
              <span class="feed-time">{{ activity.time }}</span>
            </div>
            <span class="feed-status" :class="activity.status">{{ activity.statusText }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================================ -->
    <!-- TAB: NGƯỜI DÙNG -->
    <!-- ============================================================ -->
    <section v-if="activeTab === 'users'" class="tab-content">
      <div class="section-head">
        <div>
          <h2>Thống kê người dùng</h2>
          <p>Phân tích chi tiết về người dùng trong hệ thống</p>
        </div>
        <button class="export-btn" @click="exportData('users')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Xuất báo cáo
        </button>
      </div>

      <div class="metric-grid">
        <div class="metric-card" v-for="card in userStatCards" :key="card.label">
          <span class="metric-value">{{ card.value }}</span>
          <span class="metric-label">{{ card.label }}</span>
          <span class="metric-trend" :class="card.trend" v-if="card.trend">{{ card.trendValue }}</span>
        </div>
      </div>

      <div class="chart-grid two-col">
        <div class="chart-container">
          <div class="chart-head">
            <div class="chart-title">
              <h3>Tăng trưởng người dùng</h3>
              <p>Số lượng người dùng mới theo tháng</p>
            </div>
          </div>
          <div class="chart-body">
            <canvas id="userGrowthChart"></canvas>
          </div>
        </div>

        <div class="chart-container">
          <div class="chart-head">
            <div class="chart-title">
              <h3>Phân bố vai trò</h3>
              <p>Tỷ lệ người dùng theo vai trò</p>
            </div>
          </div>
          <div class="chart-body">
            <canvas id="userRoleChart"></canvas>
          </div>
        </div>
      </div>

      <div class="table-wrapper">
        <div class="table-header">
          <h3>Danh sách người dùng</h3>
          <div class="table-controls">
            <input type="text" placeholder="Tìm kiếm..." class="search-field" v-model="userSearch">
          </div>
        </div>
        <div class="table-scroll">
          <table class="data-table">
            <thead>
              <tr><th>ID</th><th>Người dùng</th><th>Vai trò</th><th>Trạng thái</th><th>Lần cuối</th></tr>
            </thead>
            <tbody>
              <tr v-if="isLoadingUsers"><td colspan="5" class="loading-row"><span class="loader"></span>Đang tải dữ liệu...</td></tr>
              <tr v-else-if="filteredUsers.length === 0"><td colspan="5" class="empty-row">Không có người dùng nào</td></tr>
              <tr v-for="user in filteredUsers" :key="user.id">
                <td>#{{ user.id }}</td>
                <td>
                  <div class="user-cell">
                    <img :src="user.avatar || defaultAvatar" class="user-avatar" @error="handleAvatarError" loading="lazy">
                    <div>
                      <div class="cell-name">{{ user.fullName || user.username }}</div>
                      <div class="cell-sub">{{ user.email || user.username }}</div>
                    </div>
                  </div>
                </td>
                <td><span class="role-tag" :class="getRoleClass(user.role)">{{ user.role || 'User' }}</span></td>
                <td><span class="status-tag" :class="user.isLocked ? 'locked' : 'active'">{{ user.isLocked ? 'Đã khóa' : 'Hoạt động' }}</span></td>
                <td>{{ formatDate(user.lastLoginAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- ============================================================ -->
    <!-- TAB: SẢN PHẨM -->
    <!-- ============================================================ -->
    <section v-if="activeTab === 'products'" class="tab-content">
      <div class="section-head">
        <div>
          <h2>Thống kê sản phẩm</h2>
          <p>Phân tích chi tiết về sản phẩm và tồn kho</p>
        </div>
        <button class="export-btn" @click="exportData('products')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Xuất báo cáo
        </button>
      </div>

      <div class="metric-grid">
        <div class="metric-card" v-for="card in productStatCards" :key="card.label">
          <span class="metric-value">{{ card.value }}</span>
          <span class="metric-label">{{ card.label }}</span>
          <span class="metric-trend" :class="card.trend" v-if="card.trend">{{ card.trendValue }}</span>
        </div>
      </div>

      <div class="chart-grid two-col">
        <div class="chart-container">
          <div class="chart-head">
            <div class="chart-title">
              <h3>Tình trạng tồn kho</h3>
              <p>Phân bố sản phẩm theo tình trạng</p>
            </div>
          </div>
          <div class="chart-body">
            <canvas id="inventoryStatusChart"></canvas>
          </div>
        </div>

        <div class="chart-container">
          <div class="chart-head">
            <div class="chart-title">
              <h3>Phân bố danh mục</h3>
              <p>Số lượng sản phẩm theo danh mục</p>
            </div>
          </div>
          <div class="chart-body">
            <canvas id="categoryChart"></canvas>
          </div>
        </div>
      </div>

      <div class="table-wrapper">
        <div class="table-header">
          <h3>Danh sách sản phẩm</h3>
          <div class="table-controls">
            <input type="text" placeholder="Tìm kiếm..." class="search-field" v-model="productSearch">
            <select class="filter-select" v-model="productCategoryFilter">
              <option value="">Tất cả danh mục</option>
              <option v-for="cat in productCategories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>
        </div>
        <div class="table-scroll">
          <table class="data-table">
            <thead>
              <tr><th>ID</th><th>Sản phẩm</th><th>Danh mục</th><th>Tồn kho</th><th>Giá</th><th>Trạng thái</th></tr>
            </thead>
            <tbody>
              <tr v-if="isLoadingProducts"><td colspan="6" class="loading-row"><span class="loader"></span>Đang tải dữ liệu...</td></tr>
              <tr v-else-if="filteredProducts.length === 0"><td colspan="6" class="empty-row">Không có sản phẩm nào</td></tr>
              <tr v-for="product in filteredProducts" :key="product.id">
                <td>#{{ product.id }}</td>
                <td>
                  <div class="product-cell">
                    <img :src="getProductImage(product)" class="product-thumb" @error="handleProductImageError" loading="lazy">
                    <div>
                      <div class="cell-name">{{ product.name || product.productName }}</div>
                      <div class="cell-sub">SKU: {{ product.sku || product.code || 'N/A' }}</div>
                    </div>
                  </div>
                </td>
                <td><span class="category-tag">{{ product.category || 'Chưa phân loại' }}</span></td>
                <td><span class="stock-value" :class="getStockClass(product.stock || product.stockQuantity || 0)">{{ product.stock || product.stockQuantity || 0 }}</span></td>
                <td>{{ formatCurrency(product.price || 0) }}</td>
                <td><span class="status-tag" :class="getStockStatus(product.stock || product.stockQuantity || 0)">{{ getStockStatusText(product.stock || product.stockQuantity || 0) }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- ============================================================ -->
    <!-- TAB: ĐƠN HÀNG -->
    <!-- ============================================================ -->
    <section v-if="activeTab === 'orders'" class="tab-content">
      <div class="section-head">
        <div>
          <h2>Thống kê đơn hàng</h2>
          <p>Phân tích chi tiết về đơn hàng và doanh thu</p>
        </div>
        <button class="export-btn" @click="exportData('orders')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Xuất báo cáo
        </button>
      </div>

      <div class="metric-grid">
        <div class="metric-card" v-for="card in orderStatCards" :key="card.label">
          <span class="metric-value">{{ card.value }}</span>
          <span class="metric-label">{{ card.label }}</span>
          <span class="metric-trend" :class="card.trend" v-if="card.trend">{{ card.trendValue }}</span>
        </div>
      </div>

      <div class="chart-grid">
        <div class="chart-container">
          <div class="chart-head">
            <div class="chart-title">
              <h3>Đơn hàng theo tháng</h3>
              <p>Số lượng đơn hàng trong 6 tháng gần nhất</p>
            </div>
          </div>
          <div class="chart-body">
            <canvas id="orderChart"></canvas>
          </div>
        </div>

        <div class="chart-container">
          <div class="chart-head">
            <div class="chart-title">
              <h3>Trạng thái đơn hàng</h3>
              <p>Phân bố đơn hàng theo trạng thái</p>
            </div>
          </div>
          <div class="chart-body">
            <canvas id="orderStatusChart"></canvas>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch, computed } from 'vue';
import { userApi, orderApi, productApi } from '@/api/axios';
import { useAuthStore } from '@/stores/auth';
import Chart from 'chart.js/auto';

const authStore = useAuthStore();

// ==================== STATE ====================
const activeTab = ref('overview');
const selectedYear = ref(2024);
const isRefreshing = ref(false);

const userSearch = ref('');
const productSearch = ref('');
const productCategoryFilter = ref('');

const isLoadingUsers = ref(true);
const isLoadingProducts = ref(true);

const defaultAvatar = 'https://ui-avatars.com/api/?background=4f46e5&color=fff&bold=true&name=User';
const defaultProductImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHJ4PSI4IiBmaWxsPSIjZjFmNWY5Ii8+PHBhdGggZD0iTTIwIDEyTDI2IDIwTDIwIDI4TDE0IDIwTDIwIDEyWiIgZmlsbD0iIzk0YTNiOCIvPjwvc3ZnPg==';

// ==================== DATA ====================
const users = ref([]);
const products = ref([]);

const userStats = ref({ totalUsers: 0, adminCount: 0, staffCount: 0, totalLocked: 0 });
const orderStats = ref({ totalOrders: 0, totalRevenue: 0, pending: 0, completed: 0, cancelled: 0 });
const productStats = ref({ totalProducts: 0, totalStock: 0, lowStockCount: 0, outOfStock: 0 });

// ==================== COMPUTED ====================
const userAvatar = computed(() => authStore.user?.avatar || defaultAvatar);

const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Chào buổi sáng';
  if (hour < 17) return 'Chào buổi chiều';
  return 'Chào buổi tối';
});

const currentDay = computed(() => {
  return new Date().toLocaleDateString('vi-VN', { weekday: 'long' });
});

const currentDate = computed(() => {
  return new Date().toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' });
});

const filteredUsers = computed(() => {
  if (!userSearch.value) return users.value.slice(0, 10);
  const keyword = userSearch.value.toLowerCase();
  return users.value
    .filter(u => 
      (u.fullName && u.fullName.toLowerCase().includes(keyword)) ||
      (u.username && u.username.toLowerCase().includes(keyword)) ||
      (u.email && u.email.toLowerCase().includes(keyword))
    )
    .slice(0, 10);
});

const filteredProducts = computed(() => {
  let result = products.value;
  
  if (productSearch.value) {
    const keyword = productSearch.value.toLowerCase();
    result = result.filter(p => 
      (p.name && p.name.toLowerCase().includes(keyword)) ||
      (p.productName && p.productName.toLowerCase().includes(keyword)) ||
      (p.sku && p.sku.toLowerCase().includes(keyword))
    );
  }
  
  if (productCategoryFilter.value) {
    result = result.filter(p => p.category === productCategoryFilter.value);
  }
  
  return result.slice(0, 10);
});

const productCategories = computed(() => {
  const cats = new Set();
  products.value.forEach(p => {
    if (p.category) cats.add(p.category);
  });
  return Array.from(cats);
});

// ==================== ICONS (dạng SVG string để dùng v-html) ====================
const ICONS = {
  home: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1"/></svg>`,
  users: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>`,
  box: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3 27 9 24 15 27 21 24"/></svg>`,
  shopping: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>`,
  check: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`,
  user: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`
};

// ==================== TABS ====================
const tabs = [
  { key: 'overview', label: 'Tổng quan', icon: ICONS.home, badge: null },
  { key: 'users', label: 'Người dùng', icon: ICONS.users, badge: null },
  { key: 'products', label: 'Sản phẩm', icon: ICONS.box, badge: null },
  { key: 'orders', label: 'Đơn hàng', icon: ICONS.shopping, badge: null }
];

// ==================== QUICK STATS ====================
const quickStats = computed(() => [
  { 
    label: 'Tổng doanh thu', 
    value: formatCompactCurrency(orderStats.value.totalRevenue),
    trend: 'up',
    change: '+12.5%'
  },
  { 
    label: 'Đơn hàng', 
    value: orderStats.value.totalOrders.toLocaleString(),
    trend: 'up',
    change: '+8.2%'
  },
  { 
    label: 'Sản phẩm', 
    value: productStats.value.totalProducts,
    trend: 'up',
    change: '+5.7%'
  },
  { 
    label: 'Người dùng', 
    value: userStats.value.totalUsers,
    trend: 'up',
    change: '+15.3%'
  }
]);

// ==================== STAT CARDS ====================
const overviewStats = computed(() => [
  {
    label: 'Tổng người dùng',
    value: userStats.value.totalUsers,
    trend: 'up',
    trendValue: '+12%',
    progress: Math.min((userStats.value.totalUsers / 200) * 100, 100)
  },
  {
    label: 'Đơn hàng',
    value: orderStats.value.totalOrders.toLocaleString(),
    trend: 'up',
    trendValue: '+8%',
    progress: Math.min((orderStats.value.totalOrders / 500) * 100, 100)
  },
  {
    label: 'Doanh thu',
    value: formatCompactCurrency(orderStats.value.totalRevenue),
    trend: 'up',
    trendValue: '+15%',
    progress: 78
  },
  {
    label: 'Sản phẩm',
    value: productStats.value.totalProducts,
    trend: 'up',
    trendValue: '+5%',
    progress: Math.min((productStats.value.totalProducts / 300) * 100, 100)
  }
]);

const userStatCards = computed(() => [
  { label: 'Tổng người dùng', value: userStats.value.totalUsers },
  { label: 'Quản trị viên', value: userStats.value.adminCount },
  { label: 'Nhân viên', value: userStats.value.staffCount },
  { label: 'Tài khoản bị khóa', value: userStats.value.totalLocked, trend: 'down', trendValue: '-2%' }
]);

const productStatCards = computed(() => [
  { label: 'Tổng sản phẩm', value: productStats.value.totalProducts },
  { label: 'Tổng tồn kho', value: productStats.value.totalStock.toLocaleString() },
  { label: 'Sắp hết hàng', value: productStats.value.lowStockCount, trend: 'down', trendValue: '-3%' },
  { label: 'Hết hàng', value: productStats.value.outOfStock || 0, trend: 'down', trendValue: '-1%' }
]);

const orderStatCards = computed(() => [
  { label: 'Tổng đơn hàng', value: orderStats.value.totalOrders.toLocaleString() },
  { label: 'Doanh thu', value: formatCompactCurrency(orderStats.value.totalRevenue) },
  { label: 'Đang xử lý', value: orderStats.value.pending || 0 },
  { label: 'Hoàn thành', value: orderStats.value.completed || 0 }
]);

// ==================== RECENT ACTIVITIES ====================
const recentActivities = ref([
  { id: 1, text: 'Đăng nhập thành công', time: 'Vừa xong', type: 'success', icon: ICONS.check, status: 'completed', statusText: 'Hoàn thành' },
  { id: 2, text: 'Đơn hàng mới #ORD-2024-001', time: '5 phút trước', type: 'info', icon: ICONS.shopping, status: 'pending', statusText: 'Đang xử lý' },
  { id: 3, text: 'Cập nhật sản phẩm: iPhone 15', time: '15 phút trước', type: 'warning', icon: ICONS.box, status: 'completed', statusText: 'Đã cập nhật' },
  { id: 4, text: 'Người dùng mới đăng ký', time: '30 phút trước', type: 'info', icon: ICONS.user, status: 'completed', statusText: 'Thành công' }
]);

// ==================== CHART REFERENCES ====================
let revenueChart = null;
let topProductsChart = null;
let userGrowthChart = null;
let userRoleChart = null;
let inventoryStatusChart = null;
let categoryChart = null;
let orderChart = null;
let orderStatusChart = null;

// ==================== HELPERS ====================
function getProductImage(product) {
  if (product.image) return product.image;
  if (product.images && product.images.length > 0) return product.images[0];
  if (product.avatar) return product.avatar;
  return defaultProductImage;
}

function handleAvatarError(e) {
  e.target.src = defaultAvatar;
}

function handleProductImageError(e) {
  e.target.src = defaultProductImage;
}

function formatDate(date) {
  if (!date) return '--/--/----';
  const d = new Date(date);
  return d.toLocaleDateString('vi-VN') + ' ' + d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

function formatCurrency(value) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);
}

function formatCompactCurrency(value) {
  if (!value) return '0 ₫';
  if (value >= 1000000000) return (value / 1000000000).toFixed(1) + 'B ₫';
  if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M ₫';
  if (value >= 1000) return (value / 1000).toFixed(0) + 'K ₫';
  return value.toLocaleString() + ' ₫';
}

function getRoleClass(role) {
  const map = { Admin: 'admin', Sales: 'sales', Warehouse: 'warehouse', User: 'user' };
  return map[role] || 'default';
}

function getStockClass(stock) {
  if (stock === 0) return 'zero';
  if (stock <= 10) return 'low';
  return 'normal';
}

function getStockStatus(stock) {
  if (stock === 0) return 'out-of-stock';
  if (stock <= 10) return 'low-stock';
  return 'in-stock';
}

function getStockStatusText(stock) {
  if (stock === 0) return 'Hết hàng';
  if (stock <= 10) return 'Sắp hết';
  return 'Còn hàng';
}

// ==================== LOAD DATA ====================
async function loadAllData() {
  await Promise.all([
    loadUsers(),
    loadProducts(),
    loadOrderStats()
  ]);
  
  updateStats();
  
  nextTick(() => {
    setTimeout(() => {
      renderAllCharts();
    }, 300);
  });
}

async function loadUsers() {
  isLoadingUsers.value = true;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const res = await userApi.get('/users', { signal: controller.signal });
    clearTimeout(timeoutId);
    
    users.value = res.data || [];
  } catch (error) {
    users.value = [
      { id: 1, username: 'admin', fullName: 'Nguyễn Văn A', email: 'admin@example.com', role: 'Admin', isLocked: false, lastLoginAt: new Date(), avatar: '' },
      { id: 2, username: 'sales1', fullName: 'Trần Thị B', email: 'sales1@example.com', role: 'Sales', isLocked: false, lastLoginAt: new Date(), avatar: '' },
      { id: 3, username: 'warehouse1', fullName: 'Lê Văn C', email: 'warehouse1@example.com', role: 'Warehouse', isLocked: true, lastLoginAt: new Date(), avatar: '' },
      { id: 4, username: 'sales2', fullName: 'Phạm Thị D', email: 'sales2@example.com', role: 'Sales', isLocked: false, lastLoginAt: new Date(), avatar: '' }
    ];
  } finally {
    isLoadingUsers.value = false;
  }
}

async function loadProducts() {
  isLoadingProducts.value = true;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const res = await productApi.get('/products', { signal: controller.signal });
    clearTimeout(timeoutId);
    
    products.value = res.data || [];
  } catch (error) {
    products.value = [
      { id: 1, name: 'iPhone 15 Pro Max', sku: 'IP15PM-001', category: 'Điện tử', stock: 45, price: 29990000, image: '' },
      { id: 2, name: 'Samsung Galaxy S24 Ultra', sku: 'SGS24-001', category: 'Điện tử', stock: 32, price: 25990000, image: '' },
      { id: 3, name: 'Tai nghe Sony WH-1000XM5', sku: 'SONY-001', category: 'Phụ kiện', stock: 15, price: 7990000, image: '' },
      { id: 4, name: 'Laptop Dell XPS 16', sku: 'DELL-001', category: 'Laptop', stock: 8, price: 45990000, image: '' }
    ];
  } finally {
    isLoadingProducts.value = false;
  }
}

async function loadOrderStats() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const res = await orderApi.get('/orders/stats', { signal: controller.signal });
    clearTimeout(timeoutId);
    
    orderStats.value = {
      totalOrders: res.data?.totalOrders || 0,
      totalRevenue: res.data?.totalRevenue || 0,
      pending: res.data?.pending || 0,
      completed: res.data?.completed || 0,
      cancelled: res.data?.cancelled || 0
    };
  } catch (error) {
    orderStats.value = {
      totalOrders: 342,
      totalRevenue: 125000000,
      pending: 45,
      completed: 267,
      cancelled: 30
    };
  }
}

function updateStats() {
  userStats.value = {
    totalUsers: users.value.length,
    adminCount: users.value.filter(u => u.role === 'Admin').length,
    staffCount: users.value.filter(u => u.role !== 'Admin').length,
    totalLocked: users.value.filter(u => u.isLocked).length
  };
  
  let totalStock = 0;
  let lowStockCount = 0;
  let outOfStock = 0;
  
  products.value.forEach(p => {
    const stock = p.stock || p.stockQuantity || 0;
    totalStock += stock;
    if (stock === 0) outOfStock++;
    else if (stock <= 10) lowStockCount++;
  });
  
  productStats.value = {
    totalProducts: products.value.length,
    totalStock: totalStock,
    lowStockCount: lowStockCount,
    outOfStock: outOfStock
  };
}

// ==================== CHARTS ====================
function renderAllCharts() {
  updateRevenueChart();
  updateTopProductsChart();
  updateUserGrowthChart();
  updateUserRoleChart();
  updateInventoryStatusChart();
  updateCategoryChart();
  updateOrderChart();
  updateOrderStatusChart();
}

function updateRevenueChart() {
  const monthlyData = {
    2023: [10500000, 11800000, 13200000, 14800000, 15500000, 16900000, 17500000, 19000000, 20500000, 21800000, 23000000, 26000000],
    2024: [12500000, 13800000, 15200000, 16800000, 17500000, 18900000, 19500000, 21000000, 22500000, 23800000, 25000000, 28000000],
    2025: [14500000, 15800000, 17200000, 18800000, 19500000, 20900000, 21500000, 23000000, 24500000, 25800000, 27000000, 30000000]
  };

  const data = monthlyData[selectedYear.value] || monthlyData[2024];
  const ctx = document.getElementById('revenueChart');
  
  if (ctx) {
    if (revenueChart) revenueChart.destroy();
    
    const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(79, 70, 229, 0.3)');
    gradient.addColorStop(0.5, 'rgba(79, 70, 229, 0.08)');
    gradient.addColorStop(1, 'rgba(79, 70, 229, 0.01)');

    revenueChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
        datasets: [{
          label: 'Doanh thu',
          data: data,
          borderColor: '#4f46e5',
          backgroundColor: gradient,
          borderWidth: 2.5,
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointBackgroundColor: '#4f46e5',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1e293b',
            cornerRadius: 8,
            padding: 12,
            callbacks: {
              label: (ctx) => 'Doanh thu: ' + ctx.raw.toLocaleString('vi-VN') + ' ₫'
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: '#f1f5f9', drawBorder: false },
            ticks: { callback: (v) => (v / 1000000).toFixed(0) + 'M', color: '#94a3b8', font: { size: 10 } }
          },
          x: {
            grid: { display: false },
            ticks: { color: '#94a3b8', font: { size: 10 } }
          }
        }
      }
    });
  }
}

function updateTopProductsChart() {
  const ctx = document.getElementById('topProductsChart');
  if (ctx) {
    if (topProductsChart) topProductsChart.destroy();
    
    const names = products.value.slice(0, 5).map(p => p.name || p.productName || 'Sản phẩm');
    const data = products.value.slice(0, 5).map(p => Math.floor(Math.random() * 50) + 10);
    
    topProductsChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: names.length ? names : ['iPhone 15', 'Samsung S24', 'Laptop Dell', 'Tai nghe Sony', 'iPad Pro'],
        datasets: [{
          data: data.length ? data : [45, 38, 25, 30, 20],
          backgroundColor: ['#4f46e5', '#059669', '#d97706', '#dc2626', '#7c3aed'],
          borderWidth: 2,
          borderColor: '#fff',
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: { 
            position: 'bottom', 
            labels: { 
              padding: 12,
              usePointStyle: true,
              pointStyleWidth: 8,
              font: { size: 11 },
              color: '#64748b'
            } 
          },
          tooltip: {
            backgroundColor: '#1e293b',
            cornerRadius: 8,
            padding: 10,
            callbacks: { label: (ctx) => ' ' + ctx.label + ': ' + ctx.raw + ' đơn hàng' }
          }
        }
      }
    });
  }
}

function updateUserGrowthChart() {
  const ctx = document.getElementById('userGrowthChart');
  if (ctx) {
    if (userGrowthChart) userGrowthChart.destroy();
    
    userGrowthChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
        datasets: [{
          label: 'Người dùng mới',
          data: [12, 18, 15, 22, 28, 35, 42, 38, 45, 52, 48, 58],
          backgroundColor: 'rgba(5, 150, 105, 0.7)',
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1e293b',
            cornerRadius: 8,
            padding: 10,
            callbacks: { label: (ctx) => 'Người dùng mới: ' + ctx.raw }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: '#f1f5f9', drawBorder: false },
            ticks: { color: '#94a3b8', font: { size: 10 } }
          },
          x: {
            grid: { display: false },
            ticks: { color: '#94a3b8', font: { size: 10 } }
          }
        }
      }
    });
  }
}

function updateUserRoleChart() {
  const ctx = document.getElementById('userRoleChart');
  if (ctx) {
    if (userRoleChart) userRoleChart.destroy();
    
    userRoleChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Admin', 'Sales', 'Warehouse'],
        datasets: [{
          data: [
            userStats.value.adminCount || 1,
            userStats.value.staffCount * 0.6 || 5,
            userStats.value.staffCount * 0.4 || 3
          ],
          backgroundColor: ['#dc2626', '#059669', '#d97706'],
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 12,
              usePointStyle: true,
              pointStyleWidth: 8,
              font: { size: 11 },
              color: '#64748b'
            }
          },
          tooltip: {
            backgroundColor: '#1e293b',
            cornerRadius: 8,
            padding: 10,
            callbacks: { label: (ctx) => ' ' + ctx.label + ': ' + ctx.raw + ' người' }
          }
        }
      }
    });
  }
}

function updateInventoryStatusChart() {
  const ctx = document.getElementById('inventoryStatusChart');
  if (ctx) {
    if (inventoryStatusChart) inventoryStatusChart.destroy();
    
    const inStock = Math.max(productStats.value.totalProducts - productStats.value.lowStockCount - productStats.value.outOfStock, 0);
    
    inventoryStatusChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Còn hàng', 'Sắp hết', 'Hết hàng'],
        datasets: [{
          data: [inStock, productStats.value.lowStockCount || 0, productStats.value.outOfStock || 0],
          backgroundColor: ['#059669', '#d97706', '#dc2626'],
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 12,
              usePointStyle: true,
              pointStyleWidth: 8,
              font: { size: 11 },
              color: '#64748b'
            }
          },
          tooltip: {
            backgroundColor: '#1e293b',
            cornerRadius: 8,
            padding: 10,
            callbacks: { label: (ctx) => ' ' + ctx.label + ': ' + ctx.raw + ' sản phẩm' }
          }
        }
      }
    });
  }
}

function updateCategoryChart() {
  const ctx = document.getElementById('categoryChart');
  if (ctx) {
    if (categoryChart) categoryChart.destroy();
    
    const categoryMap = {};
    products.value.forEach(p => {
      const cat = p.category || 'Chưa phân loại';
      categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    });
    
    const labels = Object.keys(categoryMap);
    const data = Object.values(categoryMap);
    const colors = ['#4f46e5', '#059669', '#d97706', '#dc2626', '#7c3aed'];
    
    categoryChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels.length ? labels : ['Điện tử', 'Thời trang', 'Phụ kiện'],
        datasets: [{
          label: 'Số lượng sản phẩm',
          data: data.length ? data : [45, 32, 28],
          backgroundColor: colors.slice(0, Math.max(labels.length, 3)),
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1e293b',
            cornerRadius: 8,
            padding: 10,
            callbacks: { label: (ctx) => 'Số lượng: ' + ctx.raw + ' sản phẩm' }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            grid: { color: '#f1f5f9', drawBorder: false },
            ticks: { color: '#94a3b8', font: { size: 10 } }
          },
          y: {
            grid: { display: false },
            ticks: { color: '#64748b', font: { size: 11 } }
          }
        }
      }
    });
  }
}

function updateOrderChart() {
  const ctx = document.getElementById('orderChart');
  if (ctx) {
    if (orderChart) orderChart.destroy();
    
    orderChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'],
        datasets: [{
          label: 'Đơn hàng',
          data: [45, 52, 48, 65, 58, 72],
          borderColor: '#4f46e5',
          backgroundColor: 'rgba(79, 70, 229, 0.08)',
          borderWidth: 2.5,
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointBackgroundColor: '#4f46e5'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1e293b',
            cornerRadius: 8,
            padding: 10,
            callbacks: { label: (ctx) => 'Đơn hàng: ' + ctx.raw }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: '#f1f5f9', drawBorder: false },
            ticks: { color: '#94a3b8', font: { size: 10 } }
          },
          x: {
            grid: { display: false },
            ticks: { color: '#94a3b8', font: { size: 10 } }
          }
        }
      }
    });
  }
}

function updateOrderStatusChart() {
  const ctx = document.getElementById('orderStatusChart');
  if (ctx) {
    if (orderStatusChart) orderStatusChart.destroy();
    
    const total = orderStats.value.totalOrders || 100;
    const completed = orderStats.value.completed || Math.floor(total * 0.65);
    const pending = orderStats.value.pending || Math.floor(total * 0.25);
    const cancelled = orderStats.value.cancelled || Math.floor(total * 0.1);
    
    orderStatusChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Hoàn thành', 'Đang xử lý', 'Đã hủy'],
        datasets: [{
          data: [completed, pending, cancelled],
          backgroundColor: ['#059669', '#d97706', '#dc2626'],
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 12,
              usePointStyle: true,
              pointStyleWidth: 8,
              font: { size: 11 },
              color: '#64748b'
            }
          },
          tooltip: {
            backgroundColor: '#1e293b',
            cornerRadius: 8,
            padding: 10,
            callbacks: { label: (ctx) => ' ' + ctx.label + ': ' + ctx.raw + ' đơn' }
          }
        }
      }
    });
  }
}

// ==================== SWITCH TAB ====================
function switchTab(tabKey) {
  activeTab.value = tabKey;
  nextTick(() => {
    setTimeout(() => {
      if (tabKey === 'overview') {
        updateRevenueChart();
        updateTopProductsChart();
      } else if (tabKey === 'users') {
        updateUserGrowthChart();
        updateUserRoleChart();
      } else if (tabKey === 'products') {
        updateInventoryStatusChart();
        updateCategoryChart();
      } else if (tabKey === 'orders') {
        updateOrderChart();
        updateOrderStatusChart();
      }
    }, 100);
  });
}

// ==================== REFRESH & EXPORT ====================
async function refreshData() {
  isRefreshing.value = true;
  await loadAllData();
  setTimeout(() => {
    isRefreshing.value = false;
  }, 1000);
}

function exportData(type) {
  alert(`Đang xuất báo cáo ${type}...`);
}

// ==================== WATCHERS ====================
watch(selectedYear, () => {
  if (activeTab.value === 'overview') {
    updateRevenueChart();
  }
});

// ==================== LIFECYCLE ====================
onMounted(async () => {
  await loadAllData();
});
</script>

<style scoped>
/* ============================================================
   RESET & BASE
   ============================================================ */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.dashboard-container {
  padding: 24px;
  background: #f8fafc;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* ============================================================
   HEADER
   ============================================================ */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #ffffff;
  border-radius: 12px;
  margin-bottom: 24px;
  border: 1px solid #e9edf4;
}

.header-left {
  display: flex;
  align-items: center;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 14px;
}

.avatar-wrapper {
  position: relative;
}

.avatar-wrapper img {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e9edf4;
}

.status-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  background: #22c55e;
  border-radius: 50%;
  border: 2px solid #fff;
}

.user-greeting {
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
}

.greeting-text {
  color: #94a3b8;
  font-weight: 400;
  font-size: 14px;
}

.user-name {
  color: #0f172a;
  margin-left: 4px;
}

.user-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 2px;
  font-size: 12px;
}

.meta-divider {
  color: #e2e8f0;
}

.meta-text {
  color: #94a3b8;
}

.role-tag {
  padding: 1px 10px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  background: #f1f5f9;
  color: #475569;
}

.role-tag.admin { background: #fef2f2; color: #dc2626; }
.role-tag.sales { background: #ecfdf5; color: #059669; }
.role-tag.warehouse { background: #ecfeff; color: #0891b2; }
.role-tag.user { background: #f3f4f6; color: #6b7280; }
.role-tag.default { background: #f3f4f6; color: #6b7280; }

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.date-display {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #f1f5f9;
}

.date-display svg {
  color: #4f46e5;
  flex-shrink: 0;
}

.date-day {
  font-size: 12px;
  font-weight: 500;
  color: #0f172a;
}

.date-full {
  font-size: 10px;
  color: #94a3b8;
}

.refresh-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  background: #ffffff;
  border: 1px solid #e9edf4;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
}

.refresh-button:hover:not(:disabled) {
  border-color: #4f46e5;
  color: #4f46e5;
}

.refresh-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinning {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ============================================================
   STATS ROW
   ============================================================ */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  background: #e9edf4;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 24px;
}

.stat-item {
  background: #ffffff;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  transition: all 0.2s;
}

.stat-item:hover {
  background: #fafbfc;
}

.stat-number {
  font-size: 26px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.5px;
}

.stat-label {
  font-size: 13px;
  color: #94a3b8;
  font-weight: 400;
}

.stat-change {
  font-size: 12px;
  font-weight: 500;
}

.stat-change.up { color: #059669; }
.stat-change.down { color: #dc2626; }

/* ============================================================
   NAVIGATION TABS
   ============================================================ */
.dashboard-nav {
  display: flex;
  gap: 0;
  background: #ffffff;
  border-radius: 12px;
  margin-bottom: 24px;
  border: 1px solid #e9edf4;
  overflow: hidden;
}

.nav-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  background: transparent;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 2px solid transparent;
}

.nav-item:hover {
  background: #f8fafc;
  color: #0f172a;
}

.nav-item.active {
  color: #4f46e5;
  border-bottom-color: #4f46e5;
  background: #f8f7ff;
}

.nav-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.nav-icon svg {
  width: 20px;
  height: 20px;
}

.nav-badge {
  background: #e9edf4;
  padding: 0 8px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 600;
  color: #64748b;
}

.nav-item.active .nav-badge {
  background: #eef2ff;
  color: #4f46e5;
}

/* ============================================================
   TAB CONTENT
   ============================================================ */
.tab-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.section-head h2 {
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
}

.section-head p {
  color: #94a3b8;
  margin: 2px 0 0;
  font-size: 13px;
}

.export-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #ffffff;
  border: 1px solid #e9edf4;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
}

.export-btn:hover {
  border-color: #4f46e5;
  color: #4f46e5;
}

/* ============================================================
   METRIC GRID
   ============================================================ */
.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.metric-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px 24px;
  border: 1px solid #e9edf4;
  transition: all 0.25s;
}

.metric-card:hover {
  border-color: #d1d9e6;
}

.metric-value {
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
  display: block;
}

.metric-label {
  font-size: 13px;
  color: #94a3b8;
  display: block;
  margin-top: 2px;
}

.metric-trend {
  font-size: 12px;
  font-weight: 500;
  display: inline-block;
  margin-top: 6px;
}

.metric-trend.up { color: #059669; }
.metric-trend.down { color: #dc2626; }

.metric-bar {
  margin-top: 12px;
}

.bar-track {
  height: 3px;
  background: #f1f5f9;
  border-radius: 2px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: #4f46e5;
  border-radius: 2px;
  transition: width 1s ease;
}

/* ============================================================
   CHARTS
   ============================================================ */
.chart-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
}

.chart-grid.two-col {
  grid-template-columns: 1fr 1fr;
}

.chart-container {
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e9edf4;
  overflow: hidden;
}

.chart-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 18px 24px 0;
}

.chart-title h3 {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
}

.chart-title p {
  font-size: 11px;
  color: #94a3b8;
  margin: 2px 0 0;
}

.chart-body {
  padding: 16px 24px 24px;
  height: 280px;
}

.chart-body canvas {
  width: 100% !important;
  height: 100% !important;
}

.year-switcher {
  display: flex;
  background: #f8fafc;
  border-radius: 6px;
  padding: 2px;
  border: 1px solid #e9edf4;
}

.year-btn {
  padding: 3px 12px;
  border: none;
  background: transparent;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.year-btn.active {
  background: #ffffff;
  color: #4f46e5;
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}

.year-btn:hover:not(.active) {
  color: #0f172a;
}

/* ============================================================
   ACTIVITY
   ============================================================ */
.activity-panel {
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e9edf4;
  padding: 18px 24px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.panel-header h3 {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
}

.view-all {
  background: none;
  border: none;
  font-size: 12px;
  color: #4f46e5;
  cursor: pointer;
  font-weight: 500;
}

.view-all:hover {
  text-decoration: underline;
}

.activity-feed {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.feed-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.2s;
}

.feed-item:hover {
  background: #f8fafc;
}

.feed-icon {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.feed-icon svg {
  width: 14px;
  height: 14px;
}

.feed-icon.success { background: #ecfdf5; color: #059669; }
.feed-icon.info { background: #eef2ff; color: #4f46e5; }
.feed-icon.warning { background: #fffbeb; color: #d97706; }

.feed-content {
  flex: 1;
}

.feed-text {
  font-size: 13px;
  color: #0f172a;
  margin: 0;
  font-weight: 500;
}

.feed-time {
  font-size: 11px;
  color: #94a3b8;
}

.feed-status {
  font-size: 10px;
  padding: 1px 8px;
  border-radius: 8px;
  font-weight: 500;
}

.feed-status.completed { background: #ecfdf5; color: #059669; }
.feed-status.pending { background: #fffbeb; color: #d97706; }

/* ============================================================
   TABLES
   ============================================================ */
.table-wrapper {
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e9edf4;
  overflow: hidden;
  margin-top: 24px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 24px;
  border-bottom: 1px solid #f1f5f9;
}

.table-header h3 {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
}

.table-controls {
  display: flex;
  gap: 8px;
}

.search-field {
  padding: 6px 12px;
  border: 1px solid #e9edf4;
  border-radius: 6px;
  font-size: 12px;
  outline: none;
  min-width: 160px;
  transition: all 0.2s;
}

.search-field:focus {
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.filter-select {
  padding: 6px 12px;
  border: 1px solid #e9edf4;
  border-radius: 6px;
  font-size: 12px;
  background: #ffffff;
  outline: none;
  cursor: pointer;
}

.table-scroll {
  overflow-x: auto;
  padding: 0 24px 20px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.data-table thead th {
  text-align: left;
  padding: 10px 12px;
  font-size: 10px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #f1f5f9;
}

.data-table tbody td {
  padding: 10px 12px;
  border-bottom: 1px solid #f8fafc;
  color: #0f172a;
}

.data-table tbody tr:hover {
  background: #f8fafc;
}

.user-cell, .product-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar, .product-thumb {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  object-fit: cover;
}

.cell-name {
  font-weight: 500;
  color: #0f172a;
}

.cell-sub {
  font-size: 11px;
  color: #94a3b8;
}

.status-tag {
  padding: 1px 8px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 500;
}

.status-tag.active { background: #ecfdf5; color: #059669; }
.status-tag.locked { background: #fef2f2; color: #dc2626; }
.status-tag.in-stock { background: #ecfdf5; color: #059669; }
.status-tag.low-stock { background: #fffbeb; color: #d97706; }
.status-tag.out-of-stock { background: #fef2f2; color: #dc2626; }

.category-tag {
  padding: 1px 8px;
  background: #eef2ff;
  color: #4f46e5;
  border-radius: 8px;
  font-size: 11px;
}

.stock-value {
  font-weight: 600;
}

.stock-value.normal { color: #059669; }
.stock-value.low { color: #d97706; }
.stock-value.zero { color: #dc2626; }

.loading-row, .empty-row {
  text-align: center;
  padding: 30px 0;
  color: #94a3b8;
}

.loader {
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 2px solid #e9edf4;
  border-top-color: #4f46e5;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-right: 8px;
  vertical-align: middle;
}

/* ============================================================
   RESPONSIVE
   ============================================================ */
@media (max-width: 1200px) {
  .metric-grid { grid-template-columns: repeat(2, 1fr); }
  .chart-grid { grid-template-columns: 1fr; }
  .chart-grid.two-col { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
  .dashboard-container { padding: 16px; }
  .dashboard-header { flex-direction: column; gap: 12px; align-items: flex-start; }
  .header-right { width: 100%; flex-wrap: wrap; }
  .stats-row { grid-template-columns: 1fr 1fr; }
  .metric-grid { grid-template-columns: 1fr; }
  .dashboard-nav { flex-wrap: wrap; }
  .nav-item { flex: 1 1 45%; font-size: 12px; padding: 10px 12px; }
  .table-controls { flex-direction: column; width: 100%; }
  .search-field { min-width: unset; width: 100%; }
  .section-head { flex-direction: column; gap: 10px; }
}
</style>