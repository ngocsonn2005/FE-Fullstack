<template>
  <div class="dashboard-container">
    <!-- Welcome Header -->
    <div class="welcome-section">
      <div class="welcome-content">
        <div class="welcome-avatar">
          <img :src="userAvatar" alt="Avatar" @error="handleAvatarError">
        </div>
        <div class="welcome-text">
          <h1 class="welcome-title">
            <span class="greeting">{{ greeting }}</span>
            <span class="wave-emoji">👋</span>
          </h1>
          <h2 class="welcome-name">{{ authStore?.fullName || 'Admin' }}</h2>
          <p class="welcome-subtitle">Chào mừng bạn trở lại. Dưới đây là tổng quan hệ thống hôm nay.</p>
        </div>
      </div>
      <div class="welcome-actions">
        <div class="welcome-date">
          <svg class="date-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <span>{{ currentDate }}</span>
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
    </div>

    <!-- Stats Overview -->
    <div class="stats-overview">
      <div class="stat-card users">
        <div class="stat-card-pattern"></div>
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
            <span>12%</span>
          </div>
        </div>
        <div class="stat-info">
          <span class="stat-value counter">{{ animatedUserCount }}</span>
          <span class="stat-label">Tổng người dùng</span>
        </div>
        <div class="stat-footer">
          <div class="stat-sub">
            <span class="sub-dot admin"></span>
            <span>Admin: <strong>{{ userStats.adminCount }}</strong></span>
          </div>
          <div class="stat-sub">
            <span class="sub-dot staff"></span>
            <span>Staff: <strong>{{ userStats.staffCount }}</strong></span>
          </div>
        </div>
        <div class="stat-progress">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: (userStats.adminCount / userStats.totalUsers * 100) + '%' }"></div>
          </div>
        </div>
      </div>

      <div class="stat-card orders">
        <div class="stat-card-pattern"></div>
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
            <span>8%</span>
          </div>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ orderStats.totalOrders.toLocaleString() }}</span>
          <span class="stat-label">Tổng đơn hàng</span>
        </div>
        <div class="stat-footer">
          <div class="stat-revenue">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
            {{ formatCurrency(orderStats.totalRevenue) }}
          </div>
        </div>
      </div>

      <div class="stat-card products">
        <div class="stat-card-pattern"></div>
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
            <span>5%</span>
          </div>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ productStats.totalProducts }}</span>
          <span class="stat-label">Tổng sản phẩm</span>
        </div>
        <div class="stat-footer">
          <div class="stat-stock-info">
            <div class="stock-item">
              <span class="stock-label">Tồn kho</span>
              <span class="stock-value">{{ productStats.totalStock.toLocaleString() }}</span>
            </div>
            <div class="stock-item warning">
              <span class="stock-label">Sắp hết</span>
              <span class="stock-value">{{ productStats.lowStockCount }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="charts-section">
      <div class="chart-card main-chart">
        <div class="chart-card-header">
          <div>
            <h3 class="chart-card-title">Doanh thu theo tháng</h3>
            <p class="chart-card-subtitle">Biểu đồ doanh thu 12 tháng - {{ selectedYear }}</p>
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
            <p class="chart-card-subtitle">Top 5 sản phẩm có doanh số cao nhất</p>
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
        <div class="quick-stats-header">
          <h3 class="section-title">Chỉ số nhanh</h3>
          <button class="more-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
              <circle cx="12" cy="12" r="1"/>
              <circle cx="19" cy="12" r="1"/>
              <circle cx="5" cy="12" r="1"/>
            </svg>
          </button>
        </div>
        <div class="quick-stats-grid">
          <div class="quick-stat">
            <div class="quick-stat-icon blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <div class="quick-stat-info">
              <span class="quick-stat-value">{{ formatCompactCurrency(orderStats.totalRevenue) }}</span>
              <span class="quick-stat-label">Doanh thu</span>
            </div>
            <div class="quick-stat-trend up">+12.5%</div>
          </div>
          <div class="quick-stat">
            <div class="quick-stat-icon green">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </div>
            <div class="quick-stat-info">
              <span class="quick-stat-value">{{ formatCompactCurrency(orderStats.totalRevenue / orderStats.totalOrders) }}</span>
              <span class="quick-stat-label">TB/đơn hàng</span>
            </div>
            <div class="quick-stat-trend up">+5.2%</div>
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
            <div class="quick-stat-trend neutral">Ổn định</div>
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
            <div class="quick-stat-trend up">+15.7%</div>
          </div>
        </div>
      </div>

      <div class="recent-activity">
        <div class="activity-header">
          <h3 class="section-title">Hoạt động gần đây</h3>
          <button class="more-btn">Xem tất cả</button>
        </div>
        <div class="activity-list">
          <div class="activity-item">
            <div class="activity-icon-wrapper success">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <div class="activity-content">
              <p class="activity-text">Đăng nhập thành công</p>
              <span class="activity-time">{{ currentTime }}</span>
            </div>
          </div>
          <div class="activity-item">
            <div class="activity-icon-wrapper info">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7" rx="1"/>
                <rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/>
                <rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
            </div>
            <div class="activity-content">
              <p class="activity-text">Dashboard được tải</p>
              <span class="activity-time">Dữ liệu cập nhật mới nhất</span>
            </div>
          </div>
          <div class="activity-item">
            <div class="activity-icon-wrapper warning">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
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

const userStats = ref({ totalUsers: 0, adminCount: 0, staffCount: 0 });
const orderStats = ref({ totalOrders: 0, totalRevenue: 0 });
const productStats = ref({ totalProducts: 0, totalStock: 0, lowStockCount: 0 });
const selectedYear = ref(2024);
const isRefreshing = ref(false);
const animatedUserCount = ref(0);

const defaultAvatar = 'https://ui-avatars.com/api/?background=6366f1&color=fff&bold=true&name=User';

const userAvatar = computed(() => authStore.user?.avatar || defaultAvatar);

const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Chào buổi sáng';
  if (hour < 17) return 'Chào buổi chiều';
  return 'Chào buổi tối';
});

const currentDate = computed(() => {
  return new Date().toLocaleDateString('vi-VN', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
});

const currentTime = computed(() => {
  return new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
});

let revenueChart = null;
let topProductsChart = null;

onMounted(async () => {
  await nextTick();
  await loadAllData();
  animateCounters();
});

watch(selectedYear, () => {
  updateRevenueChart();
});

async function loadAllData() {
  await Promise.all([
    loadUserStats(),
    loadOrderStats(),
    loadProductStats(),
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

function animateCounters() {
  const target = userStats.value.totalUsers;
  const duration = 1000;
  const steps = 30;
  const increment = target / steps;
  let current = 0;
  
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      animatedUserCount.value = target;
      clearInterval(timer);
    } else {
      animatedUserCount.value = Math.floor(current);
    }
  }, duration / steps);
}

async function loadCharts() {
  await updateRevenueChart();
  await updateTopProductsChart();
}

async function updateRevenueChart() {
  const monthlyData = {
    2023: [10500000, 11800000, 13200000, 14800000, 15500000, 16900000, 17500000, 19000000, 20500000, 21800000, 23000000, 26000000],
    2024: [12500000, 13800000, 15200000, 16800000, 17500000, 18900000, 19500000, 21000000, 22500000, 23800000, 25000000, 28000000],
    2025: [14500000, 15800000, 17200000, 18800000, 19500000, 20900000, 21500000, 23000000, 24500000, 25800000, 27000000, 30000000]
  };

  const data = monthlyData[selectedYear.value];
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
          pointRadius: 5,
          pointBackgroundColor: '#6366f1',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointHoverRadius: 8,
          pointHoverBackgroundColor: '#4f46e5'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index'
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1e293b',
            titleColor: '#fff',
            bodyColor: '#e2e8f0',
            cornerRadius: 12,
            padding: 14,
            displayColors: false,
            callbacks: {
              label: (ctx) => 'Doanh thu: ' + ctx.raw.toLocaleString('vi-VN') + ' ₫'
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: '#f1f5f9', drawBorder: false },
            ticks: {
              callback: (value) => (value / 1000000).toFixed(0) + 'M',
              font: { size: 11 },
              color: '#94a3b8'
            }
          },
          x: {
            grid: { display: false },
            ticks: { font: { size: 11 }, color: '#94a3b8' }
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
    
    topProductsChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['iPhone 15', 'Samsung S24', 'Laptop Dell', 'Tai nghe Sony', 'iPad Pro'],
        datasets: [{
          data: [45, 38, 25, 30, 20],
          backgroundColor: [
            'rgba(99, 102, 241, 0.9)',
            'rgba(16, 185, 129, 0.9)',
            'rgba(245, 158, 11, 0.9)',
            'rgba(239, 68, 68, 0.9)',
            'rgba(139, 92, 246, 0.9)'
          ],
          borderWidth: 3,
          borderColor: '#fff',
          hoverOffset: 15,
          borderRadius: 4
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
              padding: 24,
              usePointStyle: true,
              pointStyleWidth: 10,
              pointStyleHeight: 10,
              font: { size: 12 },
              color: '#64748b'
            } 
          },
          tooltip: {
            backgroundColor: '#1e293b',
            cornerRadius: 8,
            padding: 12,
            callbacks: { 
              label: (ctx) => ' ' + ctx.label + ': ' + ctx.raw + ' đơn hàng' 
            }
          }
        }
      }
    });
  }
}

async function refreshData() {
  isRefreshing.value = true;
  await loadAllData();
  animateCounters();
  setTimeout(() => {
    isRefreshing.value = false;
  }, 1000);
}

function handleAvatarError(e) {
  e.target.src = defaultAvatar;
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
</script>

<style scoped>
.dashboard-container {
  padding: 28px;
  background: linear-gradient(135deg, #f8fafc 0%, #eff6ff 50%, #f0f9ff 100%);
  min-height: 100vh;
}

/* ==================== WELCOME SECTION ==================== */
.welcome-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 20px;
}

.welcome-content {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.welcome-avatar img {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  object-fit: cover;
  border: 2px solid #e2e8f0;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
}

.welcome-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.greeting {
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
}

.wave-emoji {
  display: inline-block;
  animation: wave 2s infinite;
  transform-origin: 70% 70%;
}

@keyframes wave {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(15deg); }
  75% { transform: rotate(-10deg); }
}

.welcome-name {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.welcome-subtitle {
  font-size: 14px;
  color: #94a3b8;
  margin: 2px 0 0 0;
}

.welcome-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
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
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  border: 1px solid #f1f5f9;
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
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  color: #475569;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}

.refresh-btn:hover {
  border-color: #6366f1;
  color: #6366f1;
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.12);
  transform: translateY(-1px);
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

/* ==================== STATS OVERVIEW ==================== */
.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 20px;
  margin-bottom: 28px;
}

.stat-card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
  border: 1px solid #f1f5f9;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.stat-card::after {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  opacity: 0.03;
  transition: all 0.5s;
}

.stat-card.users::after { background: #6366f1; }
.stat-card.orders::after { background: #10b981; }
.stat-card.products::after { background: #f59e0b; }

.stat-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 40px rgba(0,0,0,0.08);
}

.stat-card:hover::after {
  transform: scale(1.5);
}

.stat-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  position: relative;
  z-index: 1;
}

.stat-icon-box {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.stat-icon-box svg {
  width: 24px;
  height: 24px;
}

.stat-card.users .stat-icon-box { background: linear-gradient(135deg, #eef2ff, #e0e7ff); color: #6366f1; }
.stat-card.orders .stat-icon-box { background: linear-gradient(135deg, #ecfdf5, #d1fae5); color: #10b981; }
.stat-card.products .stat-icon-box { background: linear-gradient(135deg, #fffbeb, #fef3c7); color: #f59e0b; }

.stat-card:hover .stat-icon-box {
  transform: scale(1.08);
}

.stat-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.stat-badge.up {
  background: #ecfdf5;
  color: #059669;
}

.stat-info {
  margin-bottom: 16px;
  position: relative;
  z-index: 1;
}

.stat-value {
  font-size: 36px;
  font-weight: 800;
  color: #0f172a;
  display: block;
  line-height: 1.1;
  letter-spacing: -1px;
}

.stat-label {
  font-size: 14px;
  color: #64748b;
  margin-top: 6px;
  display: block;
  font-weight: 500;
}

.stat-footer {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  position: relative;
  z-index: 1;
}

.stat-sub {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #64748b;
}

.stat-sub strong {
  color: #334155;
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
  display: flex;
  align-items: center;
  gap: 6px;
}

.stat-stock-info {
  display: flex;
  gap: 24px;
  width: 100%;
}

.stock-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stock-label {
  font-size: 12px;
  color: #94a3b8;
}

.stock-value {
  font-size: 15px;
  font-weight: 600;
  color: #334155;
}

.stock-item.warning .stock-value {
  color: #f59e0b;
}

/* Progress Bar */
.stat-progress {
  margin-top: 16px;
  position: relative;
  z-index: 1;
}

.progress-bar {
  height: 4px;
  background: #f1f5f9;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #6366f1, #818cf8);
  border-radius: 2px;
  transition: width 1.5s ease;
}

/* ==================== CHARTS ==================== */
.charts-section {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 20px;
  margin-bottom: 28px;
}

.chart-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
  border: 1px solid #f1f5f9;
  transition: all 0.35s ease;
}

.chart-card:hover {
  box-shadow: 0 12px 30px rgba(0,0,0,0.06);
}

.chart-card-header {
  padding: 24px 24px 0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
}

.chart-card-title {
  font-size: 17px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 4px;
}

.chart-card-subtitle {
  font-size: 13px;
  color: #94a3b8;
  margin: 0;
}

.chart-actions {
  display: flex;
  gap: 8px;
}

.year-selector {
  display: flex;
  background: #f8fafc;
  border-radius: 10px;
  padding: 4px;
  border: 1px solid #e2e8f0;
}

.year-btn {
  padding: 7px 16px;
  border: none;
  background: transparent;
  border-radius: 8px;
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
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}

.year-btn:hover:not(.active) {
  color: #334155;
}

.chart-card-body {
  padding: 24px;
}

.chart-card-body canvas {
  width: 100% !important;
  height: 340px !important;
}

/* ==================== BOTTOM SECTION ==================== */
.bottom-section {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 20px;
}

.quick-stats,
.recent-activity {
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
  border: 1px solid #f1f5f9;
}

.quick-stats-header,
.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.more-btn {
  background: none;
  border: 1px solid #e2e8f0;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;
}

.more-btn:hover {
  border-color: #6366f1;
  color: #6366f1;
  background: #f8fafc;
}

.quick-stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.quick-stat {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 14px;
  transition: all 0.25s;
  position: relative;
}

.quick-stat:hover {
  background: #f1f5f9;
  transform: translateX(2px);
}

.quick-stat-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
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
.quick-stat-icon.green { background: #ecfdf5; color: #10b981; }
.quick-stat-icon.purple { background: #faf5ff; color: #8b5cf6; }
.quick-stat-icon.orange { background: #fff7ed; color: #f97316; }

.quick-stat-info {
  display: flex;
  flex-direction: column;
  flex: 1;
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

.quick-stat-trend {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 12px;
  position: absolute;
  top: 14px;
  right: 14px;
}

.quick-stat-trend.up { background: #ecfdf5; color: #059669; }
.quick-stat-trend.down { background: #fef2f2; color: #dc2626; }
.quick-stat-trend.neutral { background: #f8fafc; color: #64748b; }

/* Activity */
.activity-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 14px;
  border-radius: 12px;
  transition: all 0.2s;
}

.activity-item:hover {
  background: #f8fafc;
}

.activity-icon-wrapper {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.activity-icon-wrapper svg {
  width: 18px;
  height: 18px;
}

.activity-icon-wrapper.success { background: #ecfdf5; color: #10b981; }
.activity-icon-wrapper.info { background: #eef2ff; color: #6366f1; }
.activity-icon-wrapper.warning { background: #fffbeb; color: #f59e0b; }

.activity-content {
  flex: 1;
}

.activity-text {
  font-size: 14px;
  color: #1e293b;
  margin: 0 0 3px;
  font-weight: 500;
}

.activity-time {
  font-size: 12px;
  color: #94a3b8;
}

/* ==================== RESPONSIVE ==================== */
@media (max-width: 1200px) {
  .charts-section,
  .bottom-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 16px;
  }
  
  .welcome-section {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .welcome-actions {
    width: 100%;
    flex-direction: column;
  }
  
  .stats-overview {
    grid-template-columns: 1fr;
  }
  
  .quick-stats-grid {
    grid-template-columns: 1fr;
  }
  
  .stat-value {
    font-size: 28px;
  }
  
  .welcome-name {
    font-size: 20px;
  }
}
</style>