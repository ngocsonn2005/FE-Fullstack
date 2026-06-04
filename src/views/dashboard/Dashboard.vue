<template>
  <div class="dashboard-container">
    <!-- Header -->
    <div class="dashboard-header mb-4">
      <h1 class="dashboard-title">
        📊 Tổng quan hệ thống
        <span class="badge bg-primary ms-2">{{ new Date().getFullYear() }}</span>
      </h1>
      <p class="text-muted">Chào mừng bạn trở lại! Dưới đây là thống kê tổng hợp từ hệ thống.</p>
    </div>

    <!-- Statistics Cards -->
    <div class="row g-4 mb-4">
      <!-- User Stats -->
      <div class="col-md-4">
        <div class="stat-card user-card">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <h3 class="stat-value">{{ userStats.totalUsers }}</h3>
            <p class="stat-label">Người dùng</p>
            <div class="stat-detail">
              <span class="badge bg-light text-danger">👑 Admin: {{ userStats.adminCount }}</span>
              <span class="badge bg-light text-success">👤 Staff: {{ userStats.staffCount }}</span>
            </div>
          </div>
          <div class="stat-trend">
            <i class="trend-up">📈</i>
            <span>+12%</span>
          </div>
        </div>
      </div>

      <!-- Order Stats -->
      <div class="col-md-4">
        <div class="stat-card order-card">
          <div class="stat-icon">🛒</div>
          <div class="stat-content">
            <h3 class="stat-value">{{ orderStats.totalOrders.toLocaleString() }}</h3>
            <p class="stat-label">Đơn hàng</p>
            <div class="stat-detail">
              <span class="badge bg-light text-success">{{ formatCurrency(orderStats.totalRevenue) }}</span>
            </div>
          </div>
          <div class="stat-trend">
            <i class="trend-up">📈</i>
            <span>+8%</span>
          </div>
        </div>
      </div>

      <!-- Product Stats -->
      <div class="col-md-4">
        <div class="stat-card product-card">
          <div class="stat-icon">📦</div>
          <div class="stat-content">
            <h3 class="stat-value">{{ productStats.totalProducts }}</h3>
            <p class="stat-label">Sản phẩm</p>
            <div class="stat-detail">
              <span class="badge bg-light text-warning">📊 Tồn kho: {{ productStats.totalStock }}</span>
            </div>
          </div>
          <div class="stat-trend">
            <i class="trend-up">📈</i>
            <span>+5%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="row g-4">
      <!-- Revenue Chart -->
      <div class="col-md-7">
        <div class="chart-card">
          <div class="chart-header">
            <div>
              <h5 class="chart-title">📈 Doanh thu theo tháng</h5>
              <p class="chart-subtitle">Biểu đồ doanh thu 12 tháng gần nhất</p>
            </div>
            <div class="chart-actions">
              <select class="form-select-sm" v-model="selectedYear">
                <option :value="2023">2023</option>
                <option :value="2024">2024</option>
                <option :value="2025">2025</option>
              </select>
            </div>
          </div>
          <div class="chart-body">
            <canvas id="revenueChart" style="width: 100%; height: 320px;"></canvas>
          </div>
        </div>
      </div>

      <!-- Top Products Chart -->
      <div class="col-md-5">
        <div class="chart-card">
          <div class="chart-header">
            <div>
              <h5 class="chart-title">🏆 Sản phẩm bán chạy</h5>
              <p class="chart-subtitle">Top 5 sản phẩm có doanh số cao nhất</p>
            </div>
          </div>
          <div class="chart-body">
            <canvas id="topProductsChart" style="width: 100%; height: 320px;"></canvas>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity (Optional) -->
    <div class="row mt-4">
      <div class="col-12">
        <div class="activity-card">
          <div class="activity-header">
            <h5 class="activity-title">🔄 Hoạt động gần đây</h5>
            <button class="btn-refresh" @click="refreshData">⟳ Làm mới</button>
          </div>
          <div class="activity-body">
            <div class="activity-item">
              <div class="activity-icon">✅</div>
              <div class="activity-content">
                <strong>Đăng nhập thành công</strong>
                <small>{{ new Date().toLocaleString('vi-VN') }}</small>
              </div>
            </div>
            <div class="activity-item">
              <div class="activity-icon">📊</div>
              <div class="activity-content">
                <strong>Dashboard đã được tải</strong>
                <small>Dữ liệu được cập nhật mới nhất</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue';
import { userApi, orderApi, productApi } from '@/api/axios';
import Chart from 'chart.js/auto';

const userStats = ref({ totalUsers: 0, adminCount: 0, staffCount: 0 });
const orderStats = ref({ totalOrders: 342, totalRevenue: 125000000 });
const productStats = ref({ totalProducts: 156, totalStock: 2340 });
const selectedYear = ref(2024);

let revenueChart = null;
let topProductsChart = null;

onMounted(async () => {
  await nextTick();
  await loadUserStats();
  await loadCharts();
});

watch(selectedYear, () => {
  updateRevenueChart();
});

async function loadUserStats() {
  try {
    const res = await userApi.get('/users');
    const users = res.data;
    userStats.value = {
      totalUsers: users.length,
      adminCount: users.filter(u => u.role === 'Admin').length,
      staffCount: users.filter(u => u.role !== 'Admin').length
    };
  } catch (error) {
    console.error('Error loading user stats:', error);
  }
}

async function loadCharts() {
  await updateRevenueChart();
  await updateTopProductsChart();
}

async function updateRevenueChart() {
  const monthlyData = {
    2023: [
      { month: 1, revenue: 10500000 }, { month: 2, revenue: 11800000 },
      { month: 3, revenue: 13200000 }, { month: 4, revenue: 14800000 },
      { month: 5, revenue: 15500000 }, { month: 6, revenue: 16900000 },
      { month: 7, revenue: 17500000 }, { month: 8, revenue: 19000000 },
      { month: 9, revenue: 20500000 }, { month: 10, revenue: 21800000 },
      { month: 11, revenue: 23000000 }, { month: 12, revenue: 26000000 }
    ],
    2024: [
      { month: 1, revenue: 12500000 }, { month: 2, revenue: 13800000 },
      { month: 3, revenue: 15200000 }, { month: 4, revenue: 16800000 },
      { month: 5, revenue: 17500000 }, { month: 6, revenue: 18900000 },
      { month: 7, revenue: 19500000 }, { month: 8, revenue: 21000000 },
      { month: 9, revenue: 22500000 }, { month: 10, revenue: 23800000 },
      { month: 11, revenue: 25000000 }, { month: 12, revenue: 28000000 }
    ],
    2025: [
      { month: 1, revenue: 14500000 }, { month: 2, revenue: 15800000 },
      { month: 3, revenue: 17200000 }, { month: 4, revenue: 18800000 },
      { month: 5, revenue: 19500000 }, { month: 6, revenue: 20900000 },
      { month: 7, revenue: 21500000 }, { month: 8, revenue: 23000000 },
      { month: 9, revenue: 24500000 }, { month: 10, revenue: 25800000 },
      { month: 11, revenue: 27000000 }, { month: 12, revenue: 30000000 }
    ]
  };

  const data = monthlyData[selectedYear.value];
  
  const ctx = document.getElementById('revenueChart');
  if (ctx) {
    if (revenueChart) revenueChart.destroy();
    revenueChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map(d => `T${d.month}`),
        datasets: [{
          label: 'Doanh thu (VNĐ)',
          data: data.map(d => d.revenue),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.05)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#3b82f6',
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => `Doanh thu: ${context.raw.toLocaleString('vi-VN')} ₫`
            }
          },
          legend: { position: 'top' }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { callback: (value) => value.toLocaleString('vi-VN') + ' ₫' }
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
          backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
          borderWidth: 0,
          hoverOffset: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { position: 'bottom', labels: { padding: 15, font: { size: 12 } } },
          tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${ctx.raw} đơn` } }
        }
      }
    });
  }
}

function refreshData() {
  loadUserStats();
  updateRevenueChart();
}

function formatCurrency(value) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
}
</script>

<style scoped>
.dashboard-container {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;
}

.dashboard-header {
  margin-bottom: 24px;
}

.dashboard-title {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
}

/* Stat Cards */
.stat-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 48px;
  opacity: 0.8;
}

.stat-content {
  flex: 1;
  margin-left: 15px;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  margin: 0;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
  margin: 5px 0 0 0;
}

.stat-detail {
  margin-top: 10px;
  display: flex;
  gap: 8px;
}

.stat-detail .badge {
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.stat-trend {
  text-align: right;
  font-size: 12px;
  opacity: 0.8;
}

.trend-up {
  color: #10b981;
}

/* Card màu sắc */
.user-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.order-card {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: white;
}

.product-card {
  background: linear-gradient(135deg, #f2994a 0%, #f2c94c 100%);
  color: white;
}

/* Chart Cards */
.chart-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
  overflow: hidden;
  transition: all 0.3s ease;
}

.chart-card:hover {
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.1);
}

.chart-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.chart-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.chart-subtitle {
  font-size: 13px;
  color: #64748b;
  margin: 4px 0 0 0;
}

.chart-actions select {
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  background: white;
  font-size: 14px;
  cursor: pointer;
}

.chart-body {
  padding: 20px;
}

/* Activity Card */
.activity-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
  overflow: hidden;
}

.activity-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.activity-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.btn-refresh {
  background: #f1f5f9;
  border: none;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-refresh:hover {
  background: #e2e8f0;
}

.activity-body {
  padding: 8px 0;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px 20px;
  border-bottom: 1px solid #f1f5f9;
  transition: background 0.2s;
}

.activity-item:hover {
  background: #f8fafc;
}

.activity-icon {
  font-size: 24px;
}

.activity-content {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.activity-content strong {
  color: #1e293b;
  font-size: 14px;
}

.activity-content small {
  color: #64748b;
  font-size: 12px;
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard-container { padding: 16px; }
  .col-md-4, .col-md-5, .col-md-7 { width: 100%; margin-bottom: 16px; }
  .stat-card { padding: 16px; }
  .stat-value { font-size: 24px; }
  .stat-icon { font-size: 36px; }
}

/* Grid System */
.row {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -12px;
}

.col-md-4, .col-md-5, .col-md-7, .col-12 {
  padding: 0 12px;
}

.col-md-4 { width: 33.33%; }
.col-md-5 { width: 41.66%; }
.col-md-7 { width: 58.33%; }
.col-12 { width: 100%; }

.mb-4 { margin-bottom: 24px; }
.mt-4 { margin-top: 24px; }
.ms-2 { margin-left: 8px; }

.badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.bg-primary { background: #3b82f6; color: white; }
.bg-light { background: rgba(255, 255, 255, 0.2); }
.text-danger { color: #dc2626; }
.text-success { color: #10b981; }
.text-warning { color: #f59e0b; }

.text-muted {
  color: #64748b;
  font-size: 14px;
}
</style>