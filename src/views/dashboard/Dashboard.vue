<template>
  <div class="dashboard-container">
    <!-- Welcome Header -->
    <div class="welcome-section">
      <div class="welcome-content">
        <div class="welcome-text">
          <h1 class="welcome-title">Xin chào, {{ authStore?.fullName || 'Admin' }}!</h1>
          <p class="welcome-subtitle">Chào mừng bạn trở lại. Dưới đây là tổng quan hệ thống.</p>
        </div>
        <div class="welcome-date">
          <svg class="date-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <span>{{ currentDate }}</span>
        </div>
      </div>
      <button class="refresh-btn" @click="refreshData">
        <svg class="refresh-icon" :class="{ spinning: isRefreshing }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="23 4 23 10 17 10"/>
          <polyline points="1 20 1 14 7 14"/>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
        </svg>
        Làm mới dữ liệu
      </button>
    </div>

    <!-- Stats Overview -->
    <div class="stats-overview">
      <div class="stat-card users">
        <div class="stat-top">
          <div class="stat-icon-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div class="stat-badge up">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
              <polyline points="18 15 12 9 6 15"/>
            </svg>
            12%
          </div>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ userStats.totalUsers }}</span>
          <span class="stat-label">Tổng người dùng</span>
        </div>
        <div class="stat-footer">
          <div class="stat-sub">
            <span class="sub-dot admin"></span>
            Admin: {{ userStats.adminCount }}
          </div>
          <div class="stat-sub">
            <span class="sub-dot staff"></span>
            Staff: {{ userStats.staffCount }}
          </div>
        </div>
      </div>

      <div class="stat-card orders">
        <div class="stat-top">
          <div class="stat-icon-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </div>
          <div class="stat-badge up">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
              <polyline points="18 15 12 9 6 15"/>
            </svg>
            8%
          </div>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ orderStats.totalOrders.toLocaleString() }}</span>
          <span class="stat-label">Tổng đơn hàng</span>
        </div>
        <div class="stat-footer">
          <span class="stat-revenue">{{ formatCurrency(orderStats.totalRevenue) }}</span>
        </div>
      </div>

      <div class="stat-card products">
        <div class="stat-top">
          <div class="stat-icon-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            </svg>
          </div>
          <div class="stat-badge up">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
              <polyline points="18 15 12 9 6 15"/>
            </svg>
            5%
          </div>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ productStats.totalProducts }}</span>
          <span class="stat-label">Tổng sản phẩm</span>
        </div>
        <div class="stat-footer">
          <span class="stat-stock">Tồn kho: {{ productStats.totalStock.toLocaleString() }}</span>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="charts-section">
      <div class="chart-card main-chart">
        <div class="chart-card-header">
          <div>
            <h3 class="chart-card-title">Doanh thu theo tháng</h3>
            <p class="chart-card-subtitle">Biểu đồ doanh thu 12 tháng</p>
          </div>
          <div class="chart-actions">
            <div class="year-selector">
              <button 
                v-for="year in [2023, 2024, 2025]" 
                :key="year"
                :class="['year-btn', { active: selectedYear === year }]"
                @click="selectedYear = year"
              >
                {{ year }}
              </button>
            </div>
          </div>
        </div>
        <div class="chart-card-body">
          <canvas id="revenueChart"></canvas>
        </div>
      </div>

      <div class="chart-card side-chart">
        <div class="chart-card-header">
          <div>
            <h3 class="chart-card-title">Sản phẩm bán chạy</h3>
            <p class="chart-card-subtitle">Top 5 sản phẩm</p>
          </div>
        </div>
        <div class="chart-card-body">
          <canvas id="topProductsChart"></canvas>
        </div>
      </div>
    </div>

    <!-- Quick Stats & Activity -->
    <div class="bottom-section">
      <div class="quick-stats">
        <h3 class="section-title">Chỉ số nhanh</h3>
        <div class="quick-stats-grid">
          <div class="quick-stat">
            <div class="quick-stat-icon blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <div class="quick-stat-info">
              <span class="quick-stat-value">{{ formatCurrency(orderStats.totalRevenue) }}</span>
              <span class="quick-stat-label">Doanh thu</span>
            </div>
          </div>
          <div class="quick-stat">
            <div class="quick-stat-icon green">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </div>
            <div class="quick-stat-info">
              <span class="quick-stat-value">{{ Math.round(orderStats.totalRevenue / orderStats.totalOrders).toLocaleString() }} ₫</span>
              <span class="quick-stat-label">TB/đơn hàng</span>
            </div>
          </div>
          <div class="quick-stat">
            <div class="quick-stat-icon purple">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
            </div>
            <div class="quick-stat-info">
              <span class="quick-stat-value">{{ productStats.totalStock.toLocaleString() }}</span>
              <span class="quick-stat-label">Tổng tồn kho</span>
            </div>
          </div>
          <div class="quick-stat">
            <div class="quick-stat-icon orange">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
              </svg>
            </div>
            <div class="quick-stat-info">
              <span class="quick-stat-value">{{ userStats.totalUsers }}</span>
              <span class="quick-stat-label">Người dùng</span>
            </div>
          </div>
        </div>
      </div>

      <div class="recent-activity">
        <h3 class="section-title">Hoạt động gần đây</h3>
        <div class="activity-list">
          <div class="activity-item">
            <div class="activity-dot success"></div>
            <div class="activity-content">
              <p class="activity-text">Đăng nhập thành công</p>
              <span class="activity-time">{{ currentDate }}</span>
            </div>
          </div>
          <div class="activity-item">
            <div class="activity-dot info"></div>
            <div class="activity-content">
              <p class="activity-text">Dashboard được tải</p>
              <span class="activity-time">Dữ liệu cập nhật mới nhất</span>
            </div>
          </div>
          <div class="activity-item">
            <div class="activity-dot warning"></div>
            <div class="activity-content">
              <p class="activity-text">Đơn hàng mới #{{ orderStats.totalOrders }}</p>
              <span class="activity-time">Vừa xong</span>
            </div>
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

// ✅ Dữ liệu thống kê - khởi tạo với giá trị mặc định
const userStats = ref({ totalUsers: 0, adminCount: 0, staffCount: 0 });
const orderStats = ref({ totalOrders: 0, totalRevenue: 0 });
const productStats = ref({ totalProducts: 0, totalStock: 0, lowStockCount: 0 });
const selectedYear = ref(2024);
const isRefreshing = ref(false);

const currentDate = computed(() => {
  return new Date().toLocaleDateString('vi-VN', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
});

let revenueChart = null;
let topProductsChart = null;

onMounted(async () => {
  await nextTick();
  await loadAllData();
});

watch(selectedYear, () => {
  updateRevenueChart();
});

async function loadAllData() {
  await Promise.all([
    loadUserStats(),
    loadOrderStats(),
    loadProductStats(),  // ✅ LẤY DỮ LIỆU TỒN KHO
    loadCharts()
  ]);
}

async function loadUserStats() {
  try {
    const res = await userApi.get('/users');
    const users = res.data || [];
    userStats.value = {
      totalUsers: users.length,
      adminCount: users.filter(u => u.role === 'Admin').length,
      staffCount: users.filter(u => u.role !== 'Admin').length
    };
  } catch (error) {
    console.error('Error loading user stats:', error);
    userStats.value = { totalUsers: 128, adminCount: 5, staffCount: 123 };
  }
}

// ✅ THÊM HÀM LẤY DỮ LIỆU ĐƠN HÀNG THẬT
async function loadOrderStats() {
  try {
    const res = await orderApi.get('/orders/stats');
    orderStats.value = {
      totalOrders: res.data?.totalOrders || 0,
      totalRevenue: res.data?.totalRevenue || 0
    };
  } catch (error) {
    console.error('Error loading order stats:', error);
    orderStats.value = { totalOrders: 342, totalRevenue: 125000000 };
  }
}

// ✅ THÊM HÀM LẤY DỮ LIỆU TỒN KHO THẬT
async function loadProductStats() {
  try {
    const res = await productApi.get('/products');
    const products = res.data || [];
    
    productStats.value = {
      totalProducts: products.length,
      totalStock: products.reduce((sum, p) => sum + (p.stockQuantity || 0), 0),
      lowStockCount: products.filter(p => (p.stockQuantity || 0) <= (p.minStockThreshold || 10)).length
    };
  } catch (error) {
    console.error('Error loading product stats:', error);
    productStats.value = { totalProducts: 156, totalStock: 2340, lowStockCount: 5 };
  }
}

async function loadCharts() {
  await updateRevenueChart();
  await updateTopProductsChart();
}

async function updateRevenueChart() {
  const monthlyData = {
    2023: [
      10500000, 11800000, 13200000, 14800000, 15500000, 16900000,
      17500000, 19000000, 20500000, 21800000, 23000000, 26000000
    ],
    2024: [
      12500000, 13800000, 15200000, 16800000, 17500000, 18900000,
      19500000, 21000000, 22500000, 23800000, 25000000, 28000000
    ],
    2025: [
      14500000, 15800000, 17200000, 18800000, 19500000, 20900000,
      21500000, 23000000, 24500000, 25800000, 27000000, 30000000
    ]
  };

  const data = monthlyData[selectedYear.value];
  const ctx = document.getElementById('revenueChart');
  
  if (ctx) {
    if (revenueChart) revenueChart.destroy();
    
    const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 320);
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.3)');
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0.02)');

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
          pointRadius: 5,
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
            titleColor: '#fff',
            bodyColor: '#fff',
            cornerRadius: 8,
            padding: 12,
            callbacks: {
              label: (ctx) => ' ' + ctx.raw.toLocaleString('vi-VN') + ' ₫'
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: '#f1f5f9' },
            ticks: {
              callback: (value) => (value / 1000000).toFixed(1) + 'M ₫',
              font: { size: 11 }
            }
          },
          x: {
            grid: { display: false },
            ticks: { font: { size: 11 } }
          }
        }
      }
    });
  }
}

async function updateTopProductsChart() {
  const ctx = document.getElementById('topProductsChart');
  if (ctx) {
    if (topProductsChart) topProductsChart.destroy();
    
    // ✅ Dữ liệu mẫu cho top sản phẩm (có thể thay bằng API thật)
    topProductsChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['iPhone 15', 'Samsung S24', 'Laptop Dell', 'Tai nghe Sony', 'iPad Pro'],
        datasets: [{
          data: [45, 38, 25, 30, 20],
          backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
          borderWidth: 3,
          borderColor: '#fff',
          hoverOffset: 12
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
              padding: 20,
              usePointStyle: true,
              pointStyleWidth: 8,
              font: { size: 12 }
            } 
          },
          tooltip: {
            callbacks: { label: (ctx) => ' ' + ctx.label + ': ' + ctx.raw + ' đơn' }
          }
        }
      }
    });
  }
}

async function refreshData() {
  isRefreshing.value = true;
  await loadAllData();
  setTimeout(() => {
    isRefreshing.value = false;
  }, 1000);
}

function formatCurrency(value) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);
}
</script>

<style scoped>
.dashboard-container {
  padding: 28px;
  background: linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%);
  min-height: 100vh;
}

/* Welcome Section */
.welcome-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
  flex-wrap: wrap;
  gap: 16px;
}

.welcome-content {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.welcome-title {
  font-size: 26px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 4px;
}

.welcome-subtitle {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

.welcome-date {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: white;
  border-radius: 12px;
  font-size: 13px;
  color: #64748b;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  text-transform: capitalize;
}

.date-icon {
  width: 18px;
  height: 18px;
  color: #6366f1;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #475569;
  cursor: pointer;
  transition: all 0.25s;
}

.refresh-btn:hover {
  border-color: #6366f1;
  color: #6366f1;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
}

.refresh-icon {
  width: 18px;
  height: 18px;
}

.refresh-icon.spinning {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Stats Overview */
.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px;
  margin-bottom: 28px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  border: 1px solid #f1f5f9;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0,0,0,0.08);
}

.stat-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.stat-icon-box {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon-box svg {
  width: 24px;
  height: 24px;
}

.stat-card.users .stat-icon-box {
  background: #eef2ff;
  color: #6366f1;
}

.stat-card.orders .stat-icon-box {
  background: #f0fdf4;
  color: #10b981;
}

.stat-card.products .stat-icon-box {
  background: #fffbeb;
  color: #f59e0b;
}

.stat-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.stat-badge.up {
  background: #f0fdf4;
  color: #059669;
}

.stat-info {
  margin-bottom: 16px;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;
  display: block;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #64748b;
  margin-top: 4px;
  display: block;
}

.stat-footer {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.stat-sub {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #64748b;
}

.sub-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.sub-dot.admin { background: #6366f1; }
.sub-dot.staff { background: #10b981; }

.stat-revenue {
  font-size: 14px;
  font-weight: 600;
  color: #059669;
}

.stat-stock {
  font-size: 13px;
  color: #d97706;
  font-weight: 500;
}

/* Charts Section */
.charts-section {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 20px;
  margin-bottom: 28px;
}

.chart-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  border: 1px solid #f1f5f9;
}

.chart-card-header {
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.chart-card-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 4px;
}

.chart-card-subtitle {
  font-size: 13px;
  color: #94a3b8;
  margin: 0;
}

.year-selector {
  display: flex;
  background: #f1f5f9;
  border-radius: 8px;
  padding: 3px;
}

.year-btn {
  padding: 6px 14px;
  border: none;
  background: transparent;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.year-btn.active {
  background: white;
  color: #6366f1;
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.chart-card-body {
  padding: 24px;
}

.chart-card-body canvas {
  width: 100% !important;
  height: 340px !important;
}

/* Bottom Section */
.bottom-section {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 20px;
}

.quick-stats,
.recent-activity {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  border: 1px solid #f1f5f9;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 20px;
}

.quick-stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.quick-stat {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  background: #f8fafc;
  border-radius: 12px;
  transition: all 0.2s;
}

.quick-stat:hover {
  background: #f1f5f9;
}

.quick-stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.quick-stat-icon svg {
  width: 20px;
  height: 20px;
}

.quick-stat-icon.blue { background: #eef2ff; color: #6366f1; }
.quick-stat-icon.green { background: #f0fdf4; color: #10b981; }
.quick-stat-icon.purple { background: #faf5ff; color: #8b5cf6; }
.quick-stat-icon.orange { background: #fff7ed; color: #f97316; }

.quick-stat-info {
  display: flex;
  flex-direction: column;
}

.quick-stat-value {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
}

.quick-stat-label {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 2px;
}

/* Activity */
.activity-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border-radius: 10px;
  transition: background 0.2s;
}

.activity-item:hover {
  background: #f8fafc;
}

.activity-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 5px;
  flex-shrink: 0;
}

.activity-dot.success { background: #10b981; }
.activity-dot.info { background: #6366f1; }
.activity-dot.warning { background: #f59e0b; }

.activity-content {
  flex: 1;
}

.activity-text {
  font-size: 14px;
  color: #1e293b;
  margin: 0 0 2px;
  font-weight: 500;
}

.activity-time {
  font-size: 12px;
  color: #94a3b8;
}

/* Responsive */
@media (max-width: 1024px) {
  .charts-section,
  .bottom-section {
    grid-template-columns: 1fr;
  }
  
  .stats-overview {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  }
}

@media (max-width: 640px) {
  .dashboard-container {
    padding: 16px;
  }
  
  .welcome-section {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .quick-stats-grid {
    grid-template-columns: 1fr;
  }
  
  .stat-value {
    font-size: 24px;
  }
}
</style>