<template>
  <div class="dashboard-container">
    <!-- ==================== HEADER ==================== -->
    <div class="dashboard-header">
      <div class="header-left">
        <div class="greeting-avatar">
          <img :src="userAvatar" alt="Avatar" @error="handleAvatarError">
          <span class="online-dot"></span>
        </div>
        <div class="greeting-text">
          <h1>
            <span class="greeting-word">{{ greeting }}</span>
            <span class="greeting-name">{{ authStore?.fullName || 'Admin' }}</span>
          </h1>
          <p class="greeting-sub">
            <span class="role-badge" :class="getRoleClass(authStore?.role)">
              {{ authStore?.role || 'Admin' }}
            </span>
            Chào mừng bạn quay trở lại quản trị hệ thống
          </p>
        </div>
      </div>
      <div class="header-right">
        <div class="header-date">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <div>
            <span class="date-day">{{ currentDay }}</span>
            <span class="date-full">{{ currentDate }}</span>
          </div>
        </div>
        <button class="btn-refresh" @click="refreshData" :disabled="isRefreshing">
          <svg :class="{ spinning: isRefreshing }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 4 23 10 17 10"/>
            <polyline points="1 20 1 14 7 14"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
          {{ isRefreshing ? 'Đang tải...' : 'Làm mới' }}
        </button>
      </div>
    </div>

    <!-- ==================== QUICK STATS ==================== -->
    <div class="quick-stats-row">
      <div class="quick-stat-item" v-for="stat in quickStats" :key="stat.label">
        <div class="quick-stat-icon" :style="{ background: stat.color }">
          <component :is="stat.icon" />
        </div>
        <div class="quick-stat-info">
          <span class="quick-stat-number">{{ stat.value }}</span>
          <span class="quick-stat-label">{{ stat.label }}</span>
        </div>
        <div class="quick-stat-change" :class="stat.trend">
          {{ stat.change }}
        </div>
      </div>
    </div>

    <!-- ==================== TABS ==================== -->
    <div class="dashboard-tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.key"
        class="tab-btn" 
        :class="{ active: activeTab === tab.key }"
        @click="switchTab(tab.key)"
      >
        <component :is="tab.icon" class="tab-icon" />
        {{ tab.label }}
        <span class="tab-badge" v-if="tab.badge">{{ tab.badge }}</span>
      </button>
    </div>

    <!-- ============================================================ -->
    <!-- TAB 1: TỔNG QUAN -->
    <!-- ============================================================ -->
    <div v-if="activeTab === 'overview'" class="tab-panel">
      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card" v-for="card in overviewStats" :key="card.label">
          <div class="stat-card-icon" :style="{ background: card.iconBg }">
            <component :is="card.icon" />
          </div>
          <div class="stat-card-content">
            <span class="stat-card-value">{{ card.value }}</span>
            <span class="stat-card-label">{{ card.label }}</span>
          </div>
          <div class="stat-card-trend" :class="card.trend">
            {{ card.trendValue }}
          </div>
          <div class="stat-card-progress" v-if="card.progress">
            <div class="progress-track">
              <div class="progress-fill" :style="{ width: card.progress + '%' }"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts -->
      <div class="charts-grid">
        <div class="chart-card">
          <div class="chart-header">
            <div>
              <h3>Doanh thu theo tháng</h3>
              <p>Biểu đồ doanh thu 12 tháng gần nhất</p>
            </div>
            <div class="year-selector">
              <button 
                v-for="y in [2023, 2024, 2025]" 
                :key="y"
                :class="['year-btn', { active: selectedYear === y }]"
                @click="selectedYear = y"
              >{{ y }}</button>
            </div>
          </div>
          <div class="chart-body">
            <canvas id="revenueChart"></canvas>
          </div>
        </div>

        <div class="chart-card">
          <div class="chart-header">
            <div>
              <h3>Sản phẩm bán chạy</h3>
              <p>Top 5 sản phẩm có doanh số cao nhất</p>
            </div>
          </div>
          <div class="chart-body">
            <canvas id="topProductsChart"></canvas>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="activity-section">
        <div class="section-header">
          <h3>Hoạt động gần đây</h3>
          <button class="btn-view-all">Xem tất cả →</button>
        </div>
        <div class="activity-list">
          <div class="activity-item" v-for="activity in recentActivities" :key="activity.id">
            <div class="activity-icon" :class="activity.type">
              <component :is="activity.icon" />
            </div>
            <div class="activity-content">
              <p class="activity-text">{{ activity.text }}</p>
              <span class="activity-time">{{ activity.time }}</span>
            </div>
            <span class="activity-status" :class="activity.status">{{ activity.statusText }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ============================================================ -->
    <!-- TAB 2: THỐNG KÊ NGƯỜI DÙNG -->
    <!-- ============================================================ -->
    <div v-if="activeTab === 'users'" class="tab-panel">
      <div class="tab-header">
        <div>
          <h2>👥 Thống kê người dùng</h2>
          <p>Phân tích chi tiết về người dùng trong hệ thống</p>
        </div>
        <div class="tab-actions">
          <button class="btn-export" @click="exportData('users')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Xuất báo cáo
          </button>
        </div>
      </div>

      <!-- User Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card" v-for="card in userStatCards" :key="card.label">
          <div class="stat-card-icon" :style="{ background: card.iconBg }">
            <component :is="card.icon" />
          </div>
          <div class="stat-card-content">
            <span class="stat-card-value">{{ card.value }}</span>
            <span class="stat-card-label">{{ card.label }}</span>
          </div>
          <div class="stat-card-trend" :class="card.trend" v-if="card.trend">
            {{ card.trendValue }}
          </div>
        </div>
      </div>

      <!-- User Charts -->
      <div class="charts-grid two-col">
        <div class="chart-card">
          <div class="chart-header">
            <div>
              <h3>Biểu đồ tăng trưởng</h3>
              <p>Người dùng mới theo tháng</p>
            </div>
          </div>
          <div class="chart-body">
            <canvas id="userGrowthChart"></canvas>
          </div>
        </div>

        <div class="chart-card">
          <div class="chart-header">
            <div>
              <h3>Phân bố vai trò</h3>
              <p>Tỷ lệ người dùng theo vai trò</p>
            </div>
          </div>
          <div class="chart-body">
            <canvas id="userRoleChart"></canvas>
          </div>
        </div>
      </div>

      <!-- User Table - DỮ LIỆU THẬT -->
      <div class="table-card">
        <div class="table-header">
          <h3>Danh sách người dùng gần đây</h3>
          <div class="table-actions">
            <input type="text" placeholder="🔍 Tìm kiếm..." class="search-input" v-model="userSearch">
          </div>
        </div>
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Người dùng</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Lần cuối</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="isLoadingUsers">
                <td colspan="5" class="loading-cell">
                  <div class="spinner-sm"></div>
                  Đang tải dữ liệu...
                </td>
              </tr>
              <tr v-else-if="filteredUsers.length === 0">
                <td colspan="5" class="empty-cell">Không có người dùng nào</td>
              </tr>
              <tr v-for="user in filteredUsers" :key="user.id">
                <td>#{{ user.id }}</td>
                <td>
                  <div class="user-cell">
                    <img :src="user.avatar || defaultAvatar" class="user-avatar-sm" @error="handleAvatarError" loading="lazy">
                    <div>
                      <div class="user-name">{{ user.fullName || user.username }}</div>
                      <div class="user-email">{{ user.email || user.username }}</div>
                    </div>
                  </div>
                </td>
                <td><span class="role-badge" :class="getRoleClass(user.role)">{{ user.role || 'User' }}</span></td>
                <td>
                  <span class="status-badge" :class="user.isLocked ? 'locked' : 'active'">
                    {{ user.isLocked ? '🔒 Đã khóa' : '✅ Hoạt động' }}
                  </span>
                </td>
                <td>{{ formatDate(user.lastLoginAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ============================================================ -->
    <!-- TAB 3: THỐNG KÊ SẢN PHẨM -->
    <!-- ============================================================ -->
    <div v-if="activeTab === 'products'" class="tab-panel">
      <div class="tab-header">
        <div>
          <h2>📦 Thống kê sản phẩm</h2>
          <p>Phân tích chi tiết về sản phẩm và tồn kho</p>
        </div>
        <div class="tab-actions">
          <button class="btn-export" @click="exportData('products')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Xuất báo cáo
          </button>
        </div>
      </div>

      <!-- Product Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card" v-for="card in productStatCards" :key="card.label">
          <div class="stat-card-icon" :style="{ background: card.iconBg }">
            <component :is="card.icon" />
          </div>
          <div class="stat-card-content">
            <span class="stat-card-value">{{ card.value }}</span>
            <span class="stat-card-label">{{ card.label }}</span>
          </div>
          <div class="stat-card-trend" :class="card.trend" v-if="card.trend">
            {{ card.trendValue }}
          </div>
        </div>
      </div>

      <!-- Product Charts -->
      <div class="charts-grid two-col">
        <div class="chart-card">
          <div class="chart-header">
            <div>
              <h3>Tình trạng tồn kho</h3>
              <p>Phân bố sản phẩm theo tình trạng</p>
            </div>
          </div>
          <div class="chart-body">
            <canvas id="inventoryStatusChart"></canvas>
          </div>
        </div>

        <div class="chart-card">
          <div class="chart-header">
            <div>
              <h3>Phân bố theo danh mục</h3>
              <p>Số lượng sản phẩm theo từng danh mục</p>
            </div>
          </div>
          <div class="chart-body">
            <canvas id="categoryChart"></canvas>
          </div>
        </div>
      </div>

      <!-- Product Table - DỮ LIỆU THẬT -->
      <div class="table-card">
        <div class="table-header">
          <h3>Danh sách sản phẩm gần đây</h3>
          <div class="table-actions">
            <input type="text" placeholder="🔍 Tìm kiếm..." class="search-input" v-model="productSearch">
            <select class="filter-select" v-model="productCategoryFilter">
              <option value="">Tất cả danh mục</option>
              <option v-for="cat in productCategories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>
        </div>
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Sản phẩm</th>
                <th>Danh mục</th>
                <th>Tồn kho</th>
                <th>Giá</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="isLoadingProducts">
                <td colspan="6" class="loading-cell">
                  <div class="spinner-sm"></div>
                  Đang tải dữ liệu...
                </td>
              </tr>
              <tr v-else-if="filteredProducts.length === 0">
                <td colspan="6" class="empty-cell">Không có sản phẩm nào</td>
              </tr>
              <tr v-for="product in filteredProducts" :key="product.id">
                <td>#{{ product.id }}</td>
                <td>
                  <div class="product-cell">
                    <img 
                      :src="getProductImage(product)" 
                      class="product-image-sm" 
                      @error="handleProductImageError"
                      loading="lazy"
                    >
                    <div>
                      <div class="product-name">{{ product.name || product.productName }}</div>
                      <div class="product-sku">SKU: {{ product.sku || product.code || 'N/A' }}</div>
                    </div>
                  </div>
                </td>
                <td><span class="category-badge">{{ product.category || 'Chưa phân loại' }}</span></td>
                <td>
                  <span class="stock-value" :class="getStockClass(product.stock || product.stockQuantity || 0)">
                    {{ product.stock || product.stockQuantity || 0 }}
                  </span>
                </td>
                <td>{{ formatCurrency(product.price || 0) }}</td>
                <td>
                  <span class="status-badge" :class="getStockStatus(product.stock || product.stockQuantity || 0)">
                    {{ getStockStatusText(product.stock || product.stockQuantity || 0) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ============================================================ -->
    <!-- TAB 4: ĐƠN HÀNG -->
    <!-- ============================================================ -->
    <div v-if="activeTab === 'orders'" class="tab-panel">
      <div class="tab-header">
        <div>
          <h2>📋 Thống kê đơn hàng</h2>
          <p>Phân tích chi tiết về đơn hàng và doanh thu</p>
        </div>
        <div class="tab-actions">
          <button class="btn-export" @click="exportData('orders')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Xuất báo cáo
          </button>
        </div>
      </div>

      <!-- Order Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card" v-for="card in orderStatCards" :key="card.label">
          <div class="stat-card-icon" :style="{ background: card.iconBg }">
            <component :is="card.icon" />
          </div>
          <div class="stat-card-content">
            <span class="stat-card-value">{{ card.value }}</span>
            <span class="stat-card-label">{{ card.label }}</span>
          </div>
          <div class="stat-card-trend" :class="card.trend" v-if="card.trend">
            {{ card.trendValue }}
          </div>
        </div>
      </div>

      <!-- Order Charts -->
      <div class="charts-grid">
        <div class="chart-card">
          <div class="chart-header">
            <div>
              <h3>Đơn hàng theo tháng</h3>
              <p>Số lượng đơn hàng trong 6 tháng gần nhất</p>
            </div>
          </div>
          <div class="chart-body">
            <canvas id="orderChart"></canvas>
          </div>
        </div>

        <div class="chart-card">
          <div class="chart-header">
            <div>
              <h3>Trạng thái đơn hàng</h3>
              <p>Phân bố đơn hàng theo trạng thái</p>
            </div>
          </div>
          <div class="chart-body">
            <canvas id="orderStatusChart"></canvas>
          </div>
        </div>
      </div>
    </div>
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

// Search filters
const userSearch = ref('');
const productSearch = ref('');
const productCategoryFilter = ref('');

// Loading states
const isLoadingUsers = ref(true);
const isLoadingProducts = ref(true);

const defaultAvatar = 'https://ui-avatars.com/api/?background=6366f1&color=fff&bold=true&name=User';
const defaultProductImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHJ4PSI4IiBmaWxsPSIjRTJFOEZGMCIvPjxwYXRoIGQ9Ik0yMCAxMkwyNiAyMEwyMCAyOEwxNCAyMEwyMCAxMloiIGZpbGw9IiM5M0E0RkYiLz48L3N2Zz4=';

// ==================== DATA ====================
const users = ref([]);
const products = ref([]);
const orders = ref([]);

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

// Filtered users
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

// Filtered products
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

// Product categories
const productCategories = computed(() => {
  const cats = new Set();
  products.value.forEach(p => {
    if (p.category) cats.add(p.category);
  });
  return Array.from(cats);
});

// ==================== TABS ====================
const tabs = [
  { key: 'overview', label: 'Tổng quan', icon: 'HomeIcon', badge: null },
  { key: 'users', label: 'Người dùng', icon: 'UsersIcon', badge: null },
  { key: 'products', label: 'Sản phẩm', icon: 'BoxIcon', badge: null },
  { key: 'orders', label: 'Đơn hàng', icon: 'ShoppingBagIcon', badge: null }
];

// ==================== QUICK STATS ====================
const quickStats = computed(() => [
  { 
    label: 'Tổng doanh thu', 
    value: formatCompactCurrency(orderStats.value.totalRevenue),
    icon: 'DollarIcon',
    color: 'linear-gradient(135deg, #667eea, #764ba2)',
    trend: 'up',
    change: '+12.5%'
  },
  { 
    label: 'Đơn hàng', 
    value: orderStats.value.totalOrders.toLocaleString(),
    icon: 'ShoppingBagIcon',
    color: 'linear-gradient(135deg, #f093fb, #f5576c)',
    trend: 'up',
    change: '+8.2%'
  },
  { 
    label: 'Sản phẩm', 
    value: productStats.value.totalProducts,
    icon: 'BoxIcon',
    color: 'linear-gradient(135deg, #4facfe, #00f2fe)',
    trend: 'up',
    change: '+5.7%'
  },
  { 
    label: 'Người dùng', 
    value: userStats.value.totalUsers,
    icon: 'UsersIcon',
    color: 'linear-gradient(135deg, #43e97b, #38f9d7)',
    trend: 'up',
    change: '+15.3%'
  }
]);

// ==================== STAT CARDS ====================
const overviewStats = computed(() => [
  {
    label: 'Tổng người dùng',
    value: userStats.value.totalUsers,
    icon: 'UsersIcon',
    iconBg: '#eef2ff',
    trend: 'up',
    trendValue: '+12%',
    progress: Math.min((userStats.value.totalUsers / 200) * 100, 100)
  },
  {
    label: 'Đơn hàng',
    value: orderStats.value.totalOrders.toLocaleString(),
    icon: 'ShoppingBagIcon',
    iconBg: '#ecfdf5',
    trend: 'up',
    trendValue: '+8%',
    progress: Math.min((orderStats.value.totalOrders / 500) * 100, 100)
  },
  {
    label: 'Doanh thu',
    value: formatCompactCurrency(orderStats.value.totalRevenue),
    icon: 'DollarIcon',
    iconBg: '#fffbeb',
    trend: 'up',
    trendValue: '+15%',
    progress: 78
  },
  {
    label: 'Sản phẩm',
    value: productStats.value.totalProducts,
    icon: 'BoxIcon',
    iconBg: '#f0fdf4',
    trend: 'up',
    trendValue: '+5%',
    progress: Math.min((productStats.value.totalProducts / 300) * 100, 100)
  }
]);

const userStatCards = computed(() => [
  { label: 'Tổng người dùng', value: userStats.value.totalUsers, icon: 'UsersIcon', iconBg: '#eef2ff' },
  { label: 'Quản trị viên', value: userStats.value.adminCount, icon: 'ShieldIcon', iconBg: '#fef2f2' },
  { label: 'Nhân viên', value: userStats.value.staffCount, icon: 'UserIcon', iconBg: '#ecfdf5' },
  { label: 'Tài khoản bị khóa', value: userStats.value.totalLocked, icon: 'LockIcon', iconBg: '#fef3c7', trend: 'down', trendValue: '-2%' }
]);

const productStatCards = computed(() => [
  { label: 'Tổng sản phẩm', value: productStats.value.totalProducts, icon: 'BoxIcon', iconBg: '#f0fdf4' },
  { label: 'Tổng tồn kho', value: productStats.value.totalStock.toLocaleString(), icon: 'PackageIcon', iconBg: '#ecfeff' },
  { label: 'Sắp hết hàng', value: productStats.value.lowStockCount, icon: 'AlertIcon', iconBg: '#fef3c7', trend: 'down', trendValue: '-3%' },
  { label: 'Hết hàng', value: productStats.value.outOfStock || 0, icon: 'XCircleIcon', iconBg: '#fef2f2', trend: 'down', trendValue: '-1%' }
]);

const orderStatCards = computed(() => [
  { label: 'Tổng đơn hàng', value: orderStats.value.totalOrders.toLocaleString(), icon: 'ShoppingBagIcon', iconBg: '#eef2ff' },
  { label: 'Doanh thu', value: formatCompactCurrency(orderStats.value.totalRevenue), icon: 'DollarIcon', iconBg: '#fffbeb' },
  { label: 'Đang xử lý', value: orderStats.value.pending || 0, icon: 'ClockIcon', iconBg: '#fef3c7' },
  { label: 'Hoàn thành', value: orderStats.value.completed || 0, icon: 'CheckIcon', iconBg: '#ecfdf5' }
]);

// ==================== RECENT ACTIVITIES ====================
const recentActivities = ref([
  { id: 1, text: 'Đăng nhập thành công', time: 'Vừa xong', type: 'success', icon: 'CheckIcon', status: 'completed', statusText: '✅ Hoàn thành' },
  { id: 2, text: 'Đơn hàng mới #ORD-2024-001', time: '5 phút trước', type: 'info', icon: 'ShoppingBagIcon', status: 'pending', statusText: '⏳ Đang xử lý' },
  { id: 3, text: 'Cập nhật sản phẩm: iPhone 15', time: '15 phút trước', type: 'warning', icon: 'BoxIcon', status: 'completed', statusText: '✅ Đã cập nhật' },
  { id: 4, text: 'Người dùng mới đăng ký', time: '30 phút trước', type: 'info', icon: 'UserIcon', status: 'completed', statusText: '✅ Thành công' }
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

// ==================== IMAGE HELPERS ====================
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

// ==================== FORMAT HELPERS ====================
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

// ==================== ROLE HELPERS ====================
function getRoleClass(role) {
  const map = { Admin: 'role-admin', Sales: 'role-sales', Warehouse: 'role-warehouse', User: 'role-user' };
  return map[role] || 'role-default';
}

function getStockClass(stock) {
  if (stock === 0) return 'stock-zero';
  if (stock <= 10) return 'stock-low';
  return 'stock-normal';
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
  
  // Update stats after loading data
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
    // Thử lấy dữ liệu thật với timeout 3s
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const res = await userApi.get('/users', { signal: controller.signal });
    clearTimeout(timeoutId);
    
    users.value = res.data || [];
    console.log('✅ Loaded real user data:', users.value.length);
  } catch (error) {
    console.warn('⚠️ Failed to load real users, using fallback data:', error.message);
    // Fallback data
    users.value = [
      { id: 1, username: 'admin', fullName: 'Nguyễn Văn A', email: 'admin@example.com', role: 'Admin', isLocked: false, lastLoginAt: new Date(), avatar: '' },
      { id: 2, username: 'sales1', fullName: 'Trần Thị B', email: 'sales1@example.com', role: 'Sales', isLocked: false, lastLoginAt: new Date(), avatar: '' },
      { id: 3, username: 'warehouse1', fullName: 'Lê Văn C', email: 'warehouse1@example.com', role: 'Warehouse', isLocked: true, lastLoginAt: new Date(), avatar: '' },
      { id: 4, username: 'sales2', fullName: 'Phạm Thị D', email: 'sales2@example.com', role: 'Sales', isLocked: false, lastLoginAt: new Date(), avatar: '' },
      { id: 5, username: 'user1', fullName: 'Hoàng Văn E', email: 'user1@example.com', role: 'User', isLocked: false, lastLoginAt: new Date(), avatar: '' }
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
    console.log('✅ Loaded real product data:', products.value.length);
  } catch (error) {
    console.warn('⚠️ Failed to load real products, using fallback data:', error.message);
    products.value = [
      { id: 1, name: 'iPhone 15 Pro Max', sku: 'IP15PM-001', category: 'Điện tử', stock: 45, price: 29990000, image: '' },
      { id: 2, name: 'Samsung Galaxy S24 Ultra', sku: 'SGS24-001', category: 'Điện tử', stock: 32, price: 25990000, image: '' },
      { id: 3, name: 'Tai nghe Sony WH-1000XM5', sku: 'SONY-001', category: 'Phụ kiện', stock: 15, price: 7990000, image: '' },
      { id: 4, name: 'Laptop Dell XPS 16', sku: 'DELL-001', category: 'Laptop', stock: 8, price: 45990000, image: '' },
      { id: 5, name: 'iPad Pro M4 12.9"', sku: 'IPAD-001', category: 'Điện tử', stock: 20, price: 30990000, image: '' },
      { id: 6, name: 'Áo thun Polo', sku: 'POLO-001', category: 'Thời trang', stock: 120, price: 450000, image: '' },
      { id: 7, name: 'Quần Jean Slim', sku: 'JEAN-001', category: 'Thời trang', stock: 85, price: 890000, image: '' }
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
    console.log('✅ Loaded real order stats');
  } catch (error) {
    console.warn('⚠️ Failed to load real order stats, using fallback data:', error.message);
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
  // Update user stats
  userStats.value = {
    totalUsers: users.value.length,
    adminCount: users.value.filter(u => u.role === 'Admin').length,
    staffCount: users.value.filter(u => u.role !== 'Admin').length,
    totalLocked: users.value.filter(u => u.isLocked).length
  };
  
  // Update product stats
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
    
    const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 320);
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.35)');
    gradient.addColorStop(0.5, 'rgba(99, 102, 241, 0.1)');
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0.01)');

    revenueChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
        datasets: [{
          label: 'Doanh thu',
          data: data,
          borderColor: '#6366f1',
          backgroundColor: gradient,
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#6366f1',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointHoverRadius: 7
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1e293b',
            cornerRadius: 12,
            padding: 14,
            callbacks: {
              label: (ctx) => 'Doanh thu: ' + ctx.raw.toLocaleString('vi-VN') + ' ₫'
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: '#f1f5f9', drawBorder: false },
            ticks: { callback: (v) => (v / 1000000).toFixed(0) + 'M', color: '#94a3b8', font: { size: 11 } }
          },
          x: {
            grid: { display: false },
            ticks: { color: '#94a3b8', font: { size: 11 } }
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
    
    const productNames = products.value.slice(0, 5).map(p => p.name || p.productName || 'Sản phẩm');
    const productData = products.value.slice(0, 5).map(p => Math.floor(Math.random() * 50) + 10);
    
    topProductsChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: productNames.length ? productNames : ['iPhone 15', 'Samsung S24', 'Laptop Dell', 'Tai nghe Sony', 'iPad Pro'],
        datasets: [{
          data: productData.length ? productData : [45, 38, 25, 30, 20],
          backgroundColor: ['rgba(99,102,241,0.9)', 'rgba(16,185,129,0.9)', 'rgba(245,158,11,0.9)', 'rgba(239,68,68,0.9)', 'rgba(139,92,246,0.9)'],
          borderWidth: 2,
          borderColor: '#fff',
          hoverOffset: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: { 
            position: 'bottom', 
            labels: { 
              padding: 16,
              usePointStyle: true,
              pointStyleWidth: 10,
              font: { size: 11 },
              color: '#64748b'
            } 
          },
          tooltip: {
            backgroundColor: '#1e293b',
            cornerRadius: 8,
            padding: 12,
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
    
    const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.3)');
    gradient.addColorStop(1, 'rgba(16, 185, 129, 0.01)');

    userGrowthChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
        datasets: [{
          label: 'Người dùng mới',
          data: [12, 18, 15, 22, 28, 35, 42, 38, 45, 52, 48, 58],
          backgroundColor: 'rgba(16, 185, 129, 0.7)',
          borderRadius: 6,
          borderSkipped: false
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
            callbacks: { label: (ctx) => 'Người dùng mới: ' + ctx.raw }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: '#f1f5f9', drawBorder: false },
            ticks: { color: '#94a3b8', font: { size: 11 } }
          },
          x: {
            grid: { display: false },
            ticks: { color: '#94a3b8', font: { size: 11 } }
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
        labels: ['Admin', 'Sales', 'Warehouse', 'User'],
        datasets: [{
          data: [
            userStats.value.adminCount || 1,
            userStats.value.staffCount * 0.6 || 5,
            userStats.value.staffCount * 0.4 || 3,
            0
          ],
          backgroundColor: ['#ef4444', '#10b981', '#f59e0b', '#6366f1'],
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
              padding: 16,
              usePointStyle: true,
              pointStyleWidth: 10,
              font: { size: 12 },
              color: '#64748b'
            }
          },
          tooltip: {
            backgroundColor: '#1e293b',
            cornerRadius: 8,
            padding: 12,
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
    
    const inStock = productStats.value.totalProducts - productStats.value.lowStockCount - productStats.value.outOfStock;
    
    inventoryStatusChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Còn hàng', 'Sắp hết', 'Hết hàng'],
        datasets: [{
          data: [
            Math.max(inStock, 0),
            productStats.value.lowStockCount || 0,
            productStats.value.outOfStock || 0
          ],
          backgroundColor: ['rgba(16,185,129,0.9)', 'rgba(245,158,11,0.9)', 'rgba(239,68,68,0.9)'],
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
              padding: 16,
              usePointStyle: true,
              pointStyleWidth: 10,
              font: { size: 12 },
              color: '#64748b'
            }
          },
          tooltip: {
            backgroundColor: '#1e293b',
            cornerRadius: 8,
            padding: 12,
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
    
    // Group products by category
    const categoryMap = {};
    products.value.forEach(p => {
      const cat = p.category || 'Chưa phân loại';
      categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    });
    
    const labels = Object.keys(categoryMap);
    const data = Object.values(categoryMap);
    
    const colors = ['rgba(99,102,241,0.8)', 'rgba(16,185,129,0.8)', 'rgba(245,158,11,0.8)', 'rgba(239,68,68,0.8)', 'rgba(139,92,246,0.8)'];
    
    categoryChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels.length ? labels : ['Điện tử', 'Thời trang', 'Phụ kiện', 'Laptop', 'Gia dụng'],
        datasets: [{
          label: 'Số lượng sản phẩm',
          data: data.length ? data : [45, 32, 28, 20, 15],
          backgroundColor: colors.slice(0, Math.max(labels.length, 5)),
          borderRadius: 6,
          borderSkipped: false
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
            padding: 12,
            callbacks: { label: (ctx) => 'Số lượng: ' + ctx.raw + ' sản phẩm' }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            grid: { color: '#f1f5f9', drawBorder: false },
            ticks: { color: '#94a3b8', font: { size: 11 } }
          },
          y: {
            grid: { display: false },
            ticks: { color: '#64748b', font: { size: 12 } }
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
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99,102,241,0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#6366f1'
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
            callbacks: { label: (ctx) => 'Đơn hàng: ' + ctx.raw }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: '#f1f5f9', drawBorder: false },
            ticks: { color: '#94a3b8', font: { size: 11 } }
          },
          x: {
            grid: { display: false },
            ticks: { color: '#94a3b8', font: { size: 11 } }
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
          backgroundColor: ['rgba(16,185,129,0.9)', 'rgba(245,158,11,0.9)', 'rgba(239,68,68,0.9)'],
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
              padding: 16,
              usePointStyle: true,
              pointStyleWidth: 10,
              font: { size: 12 },
              color: '#64748b'
            }
          },
          tooltip: {
            backgroundColor: '#1e293b',
            cornerRadius: 8,
            padding: 12,
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

// ==================== REFRESH ====================
async function refreshData() {
  isRefreshing.value = true;
  await loadAllData();
  setTimeout(() => {
    isRefreshing.value = false;
  }, 1000);
}

// ==================== EXPORT ====================
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

<!-- ============================================================ -->
<!-- STYLES (giữ nguyên từ file cũ) -->
<!-- ============================================================ -->
<style scoped>
/* ============================================================
   GLOBAL
   ============================================================ */
.dashboard-container {
  padding: 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #f8fafc 100%);
  min-height: 100vh;
}

/* ============================================================
   HEADER
   ============================================================ */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: white;
  border-radius: 16px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  border: 1px solid #f1f5f9;
}

.header-left {
  display: flex;
  align-items: center;
}

.greeting-avatar {
  position: relative;
  margin-right: 16px;
}

.greeting-avatar img {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  object-fit: cover;
  border: 2px solid #e2e8f0;
}

.online-dot {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 12px;
  height: 12px;
  background: #10b981;
  border-radius: 50%;
  border: 2px solid white;
}

.greeting-text h1 {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.greeting-word {
  color: #94a3b8;
  font-weight: 500;
  font-size: 16px;
  margin-right: 4px;
}

.greeting-name {
  color: #1e293b;
}

.greeting-sub {
  font-size: 13px;
  color: #94a3b8;
  margin: 4px 0 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.role-badge {
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.role-admin { background: #fef2f2; color: #ef4444; }
.role-sales { background: #ecfdf5; color: #10b981; }
.role-warehouse { background: #ecfeff; color: #06b6d4; }
.role-user { background: #f3f4f6; color: #6b7280; }
.role-default { background: #f3f4f6; color: #6b7280; }

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-date {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background: #f8fafc;
  border-radius: 10px;
}

.header-date svg {
  width: 20px;
  height: 20px;
  color: #6366f1;
}

.header-date div {
  display: flex;
  flex-direction: column;
}

.date-day {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
  text-transform: capitalize;
}

.date-full {
  font-size: 11px;
  color: #94a3b8;
}

.btn-refresh {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  color: #475569;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-refresh:hover {
  border-color: #6366f1;
  color: #6366f1;
  box-shadow: 0 2px 8px rgba(99,102,241,0.1);
}

.btn-refresh svg {
  width: 18px;
  height: 18px;
}

.spinning {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ============================================================
   QUICK STATS
   ============================================================ */
.quick-stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.quick-stat-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 20px;
  background: white;
  border-radius: 14px;
  border: 1px solid #f1f5f9;
  transition: all 0.3s;
  position: relative;
}

.quick-stat-item:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.05);
  transform: translateY(-2px);
}

.quick-stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.quick-stat-icon svg {
  width: 24px;
  height: 24px;
  color: white;
}

.quick-stat-info {
  flex: 1;
}

.quick-stat-number {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  display: block;
}

.quick-stat-label {
  font-size: 12px;
  color: #94a3b8;
}

.quick-stat-change {
  font-size: 12px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 12px;
}

.quick-stat-change.up { background: #ecfdf5; color: #059669; }
.quick-stat-change.down { background: #fef2f2; color: #dc2626; }

/* ============================================================
   TABS
   ============================================================ */
.dashboard-tabs {
  display: flex;
  gap: 4px;
  padding: 4px;
  background: white;
  border-radius: 14px;
  margin-bottom: 24px;
  border: 1px solid #f1f5f9;
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  background: transparent;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all 0.3s;
}

.tab-btn:hover {
  background: #f8fafc;
  color: #1e293b;
}

.tab-btn.active {
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white;
  box-shadow: 0 4px 12px rgba(99,102,241,0.25);
}

.tab-icon {
  width: 18px;
  height: 18px;
}

.tab-badge {
  background: rgba(255,255,255,0.2);
  padding: 1px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
}

.tab-btn:not(.active) .tab-badge {
  background: #e2e8f0;
  color: #64748b;
}

/* ============================================================
   TAB PANEL
   ============================================================ */
.tab-panel {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.tab-header h2 {
  font-size: 22px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.tab-header p {
  color: #94a3b8;
  margin: 4px 0 0;
  font-size: 14px;
}

.btn-export {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  color: #475569;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-export:hover {
  border-color: #6366f1;
  color: #6366f1;
}

.btn-export svg {
  width: 16px;
  height: 16px;
}

/* ============================================================
   STATS GRID
   ============================================================ */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 14px;
  padding: 20px;
  border: 1px solid #f1f5f9;
  transition: all 0.3s;
  position: relative;
}

.stat-card:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.05);
  transform: translateY(-2px);
}

.stat-card-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.stat-card-icon svg {
  width: 20px;
  height: 20px;
}

.stat-card-content {
  margin-bottom: 8px;
}

.stat-card-value {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  display: block;
}

.stat-card-label {
  font-size: 13px;
  color: #94a3b8;
}

.stat-card-trend {
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
}

.stat-card-trend.up { background: #ecfdf5; color: #059669; }
.stat-card-trend.down { background: #fef2f2; color: #dc2626; }

.stat-card-progress {
  margin-top: 12px;
}

.progress-track {
  height: 4px;
  background: #f1f5f9;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #6366f1, #818cf8);
  border-radius: 2px;
  transition: width 1s ease;
}

/* ============================================================
   CHARTS
   ============================================================ */
.charts-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
}

.charts-grid.two-col {
  grid-template-columns: 1fr 1fr;
}

.chart-card {
  background: white;
  border-radius: 14px;
  border: 1px solid #f1f5f9;
  overflow: hidden;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px 24px 0;
}

.chart-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.chart-header p {
  font-size: 12px;
  color: #94a3b8;
  margin: 4px 0 0;
}

.chart-body {
  padding: 20px 24px 24px;
  height: 320px;
}

.chart-body canvas {
  width: 100% !important;
  height: 100% !important;
}

.year-selector {
  display: flex;
  background: #f8fafc;
  border-radius: 8px;
  padding: 3px;
  border: 1px solid #e2e8f0;
}

.year-btn {
  padding: 4px 14px;
  border: none;
  background: transparent;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.year-btn.active {
  background: white;
  color: #6366f1;
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}

.year-btn:hover:not(.active) {
  color: #1e293b;
}

/* ============================================================
   ACTIVITY
   ============================================================ */
.activity-section {
  background: white;
  border-radius: 14px;
  border: 1px solid #f1f5f9;
  padding: 20px 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.btn-view-all {
  background: none;
  border: none;
  font-size: 13px;
  color: #6366f1;
  cursor: pointer;
  font-weight: 500;
}

.btn-view-all:hover {
  text-decoration: underline;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 16px;
  border-radius: 10px;
  transition: all 0.2s;
}

.activity-item:hover {
  background: #f8fafc;
}

.activity-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.activity-icon svg {
  width: 18px;
  height: 18px;
}

.activity-icon.success { background: #ecfdf5; color: #10b981; }
.activity-icon.info { background: #eef2ff; color: #6366f1; }
.activity-icon.warning { background: #fffbeb; color: #f59e0b; }

.activity-content {
  flex: 1;
}

.activity-text {
  font-size: 14px;
  color: #1e293b;
  margin: 0;
  font-weight: 500;
}

.activity-time {
  font-size: 12px;
  color: #94a3b8;
}

.activity-status {
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 12px;
}

.activity-status.completed { background: #ecfdf5; color: #059669; }
.activity-status.pending { background: #fffbeb; color: #d97706; }

/* ============================================================
   TABLES
   ============================================================ */
.table-card {
  background: white;
  border-radius: 14px;
  border: 1px solid #f1f5f9;
  overflow: hidden;
  margin-top: 24px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #f1f5f9;
}

.table-header h3 {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.table-actions {
  display: flex;
  gap: 10px;
}

.search-input {
  padding: 8px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 13px;
  outline: none;
  min-width: 200px;
  transition: all 0.2s;
}

.search-input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
}

.filter-select {
  padding: 8px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 13px;
  background: white;
  outline: none;
  cursor: pointer;
}

.table-responsive {
  overflow-x: auto;
  padding: 0 24px 24px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead th {
  text-align: left;
  padding: 12px 14px;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #f1f5f9;
}

tbody td {
  padding: 12px 14px;
  border-bottom: 1px solid #f8fafc;
  font-size: 14px;
  color: #1e293b;
}

tbody tr:hover {
  background: #f8fafc;
}

.user-cell, .product-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar-sm, .product-image-sm {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  object-fit: cover;
}

.user-name, .product-name {
  font-weight: 500;
  color: #1e293b;
}

.user-email, .product-sku {
  font-size: 12px;
  color: #94a3b8;
}

.status-badge {
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.active { background: #ecfdf5; color: #059669; }
.status-badge.locked { background: #fef2f2; color: #dc2626; }
.status-badge.in-stock { background: #ecfdf5; color: #059669; }
.status-badge.low-stock { background: #fffbeb; color: #d97706; }
.status-badge.out-of-stock { background: #fef2f2; color: #dc2626; }

.category-badge {
  padding: 2px 10px;
  background: #eef2ff;
  color: #6366f1;
  border-radius: 12px;
  font-size: 12px;
}

.stock-value {
  font-weight: 600;
}

.stock-value.stock-normal { color: #10b981; }
.stock-value.stock-low { color: #f59e0b; }
.stock-value.stock-zero { color: #ef4444; }

/* ============================================================
   RESPONSIVE
   ============================================================ */
@media (max-width: 1200px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .quick-stats-row { grid-template-columns: repeat(2, 1fr); }
  .charts-grid { grid-template-columns: 1fr; }
  .charts-grid.two-col { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
  .dashboard-container { padding: 16px; }
  .dashboard-header { flex-direction: column; gap: 16px; align-items: flex-start; }
  .header-right { width: 100%; flex-wrap: wrap; }
  .quick-stats-row { grid-template-columns: 1fr; }
  .stats-grid { grid-template-columns: 1fr; }
  .dashboard-tabs { flex-wrap: wrap; }
  .tab-btn { flex: 1 1 45%; font-size: 13px; padding: 10px 12px; }
  .table-actions { flex-direction: column; width: 100%; }
  .search-input { min-width: unset; width: 100%; }
}

/* Thêm style cho loading */
.loading-cell {
  text-align: center;
  padding: 40px 0;
  color: #94a3b8;
}

.empty-cell {
  text-align: center;
  padding: 40px 0;
  color: #94a3b8;
}

.spinner-sm {
  display: inline-block;
  width: 24px;
  height: 24px;
  border: 3px solid #e2e8f0;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-right: 12px;
  vertical-align: middle;
}
</style>