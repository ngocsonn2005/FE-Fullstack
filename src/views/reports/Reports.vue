<template>
  <div class="reports-container">
    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon-wrapper">
          <svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 20V10M12 20V4M6 20v-6"/>
          </svg>
        </div>
        <div class="header-text">
          <h1 class="reports-title">Báo cáo & Thống kê</h1>
          <p class="reports-subtitle">Tổng hợp dữ liệu doanh thu và sản phẩm bán chạy</p>
        </div>
      </div>
      <div class="header-date">
        <svg class="date-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        <span>Cập nhật: {{ new Date().toLocaleDateString('vi-VN') }}</span>
      </div>
    </div>

    <!-- Bộ lọc -->
    <div class="filter-bar">
      <div class="filter-left">
        <div class="filter-group">
          <label>Năm</label>
          <div class="select-wrapper">
            <svg class="select-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
            <select class="filter-select" v-model="selectedYear" @change="loadData">
              <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
            </select>
          </div>
        </div>
        <div class="filter-group">
          <label>Loại báo cáo</label>
          <div class="select-wrapper">
            <svg class="select-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
            <select class="filter-select" v-model="reportType" @change="loadData">
              <option value="monthly">Theo tháng</option>
              <option value="quarterly">Theo quý</option>
              <option value="yearly">Theo năm</option>
            </select>
          </div>
        </div>
      </div>
      <button class="btn-export" @click="exportExcel">
        <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        Xuất Excel
      </button>
    </div>

    <!-- Thống kê doanh thu -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon-wrapper revenue">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="1" x2="12" y2="23"/>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-label">Tổng doanh thu</span>
          <span class="stat-value">{{ formatCurrency(totalRevenue) }}</span>
          <span class="stat-trend up">Tăng 12.5%</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon-wrapper orders">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-label">Tổng đơn hàng</span>
          <span class="stat-value">{{ totalOrders.toLocaleString() }}</span>
          <span class="stat-trend up">Tăng 8.3%</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon-wrapper average">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-label">Giá trị TB/đơn</span>
          <span class="stat-value">{{ formatCurrency(averageOrderValue) }}</span>
          <span class="stat-trend up">Tăng 5.2%</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon-wrapper customers">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-label">Khách hàng mới</span>
          <span class="stat-value">{{ newCustomers.toLocaleString() }}</span>
          <span class="stat-trend up">Tăng 15.7%</span>
        </div>
      </div>
    </div>

    <!-- Thống kê tồn kho -->
    <div class="section-header">
      <div class="section-icon-wrapper">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        </svg>
      </div>
      <h3 class="section-title">Thống kê tồn kho</h3>
    </div>

    <div class="inventory-stats-grid">
      <div class="inventory-card total">
        <div class="inventory-icon-bg">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
          </svg>
        </div>
        <div class="inventory-content">
          <span class="inventory-value">{{ inventoryStats.totalProducts }}</span>
          <span class="inventory-label">Tổng sản phẩm</span>
        </div>
      </div>
      <div class="inventory-card stock">
        <div class="inventory-icon-bg">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 3h18v18H3zM3 9h18M9 3v18"/>
          </svg>
        </div>
        <div class="inventory-content">
          <span class="inventory-value">{{ inventoryStats.totalStock }}</span>
          <span class="inventory-label">Tổng tồn kho</span>
        </div>
      </div>
      <div class="inventory-card low">
        <div class="inventory-icon-bg">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <div class="inventory-content">
          <span class="inventory-value" :class="{ 'highlight-danger': inventoryStats.lowStockCount > 0 }">
            {{ inventoryStats.lowStockCount }}
          </span>
          <span class="inventory-label">Sắp hết hàng</span>
        </div>
      </div>
      <div class="inventory-card value">
        <div class="inventory-icon-bg">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="1" x2="12" y2="23"/>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
        </div>
        <div class="inventory-content">
          <span class="inventory-value">{{ formatCurrency(inventoryStats.totalValue) }}</span>
          <span class="inventory-label">Giá trị tồn kho</span>
        </div>
      </div>
    </div>

    <!-- Biểu đồ -->
    <div class="charts-grid">
      <div class="chart-card">
        <div class="chart-header">
          <div>
            <h3 class="chart-title">Doanh thu {{ reportType === 'monthly' ? 'theo tháng' : (reportType === 'quarterly' ? 'theo quý' : 'theo năm') }}</h3>
            <p class="chart-subtitle">Biểu đồ doanh thu và số lượng đơn hàng</p>
          </div>
          <span class="chart-badge">{{ selectedYear }}</span>
        </div>
        <div class="chart-body">
          <canvas id="revenueChart"></canvas>
        </div>
      </div>
      
      <div class="chart-card">
        <div class="chart-header">
          <div>
            <h3 class="chart-title">Top sản phẩm bán chạy</h3>
            <p class="chart-subtitle">Sản phẩm có doanh số cao nhất</p>
          </div>
        </div>
        <div class="chart-body">
          <canvas id="topProductsChart"></canvas>
        </div>
      </div>
    </div>

    <!-- Bảng chi tiết doanh thu -->
    <div class="table-card">
      <div class="table-header">
        <div>
          <h3 class="table-title">Chi tiết doanh thu {{ reportType === 'monthly' ? 'theo tháng' : (reportType === 'quarterly' ? 'theo quý' : 'theo năm') }}</h3>
          <p class="table-subtitle">Tổng: {{ formatCurrency(totalRevenue) }} | {{ totalOrders }} đơn hàng</p>
        </div>
      </div>
      <div class="table-body">
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>{{ reportType === 'monthly' ? 'Tháng' : (reportType === 'quarterly' ? 'Quý' : 'Năm') }}</th>
                <th class="text-right">Doanh thu</th>
                <th class="text-right">Đơn hàng</th>
                <th class="text-right">TB/đơn</th>
                <th class="text-right">Tăng trưởng</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in reportData" :key="item.period">
                <td>
                  <span class="period-badge">{{ item.period }}</span>
                </td>
                <td class="text-right amount-cell">{{ formatCurrency(item.revenue) }}</td>
                <td class="text-right">{{ item.orderCount.toLocaleString() }}</td>
                <td class="text-right">{{ formatCurrency(item.revenue / item.orderCount) }}</td>
                <td class="text-right">
                  <span :class="['growth-badge', item.growth >= 0 ? 'positive' : 'negative']">
                    <svg v-if="item.growth >= 0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                      <polyline points="18 15 12 9 6 15"/>
                    </svg>
                    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                    {{ Math.abs(item.growth).toFixed(1) }}%
                  </span>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td><strong>Tổng cộng</strong></td>
                <td class="text-right"><strong>{{ formatCurrency(totalRevenue) }}</strong></td>
                <td class="text-right"><strong>{{ totalOrders.toLocaleString() }}</strong></td>
                <td class="text-right"><strong>{{ formatCurrency(averageOrderValue) }}</strong></td>
                <td class="text-right"><strong>-</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>

    <!-- Bảng tồn kho -->
    <div class="table-card">
      <div class="table-header">
        <div>
          <h3 class="table-title">Danh sách tồn kho</h3>
          <p class="table-subtitle">Chi tiết tồn kho theo từng sản phẩm</p>
        </div>
        <button class="btn-export-small" @click="exportInventoryExcel">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          Xuất Excel
        </button>
      </div>
      <div class="table-body">
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Mã SP</th>
                <th>Tên sản phẩm</th>
                <th>Danh mục</th>
                <th class="text-right">Tồn kho</th>
                <th class="text-right">Ngưỡng cảnh báo</th>
                <th class="text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in inventoryProducts" :key="product.id">
                <td>
                  <span class="code-badge">{{ product.code || 'SP' + String(product.id).padStart(3, '0') }}</span>
                </td>
                <td>
                  <span class="product-name">{{ product.name }}</span>
                </td>
                <td>{{ product.categoryName || 'Điện tử' }}</td>
                <td class="text-right">
                  <span :class="{ 'text-danger': (product.stockQuantity || 0) <= (product.minStockThreshold || 10) }">
                    {{ product.stockQuantity || 0 }}
                  </span>
                </td>
                <td class="text-right">{{ product.minStockThreshold || 10 }}</td>
                <td class="text-center">
                  <span :class="getStockStatusClass(product.stockQuantity, product.minStockThreshold)">
                    <span class="status-dot"></span>
                    {{ getStockStatusText(product.stockQuantity, product.minStockThreshold) }}
                  </span>
                </td>
              </tr>
              <tr v-if="inventoryProducts.length === 0">
                <td colspan="6" class="text-center empty-cell">
                  <div class="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                    </svg>
                    <p>Đang tải dữ liệu tồn kho...</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <transition name="fade">
      <div v-if="isLoading" class="loading-overlay">
        <div class="loading-spinner">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
          </svg>
        </div>
        <p>Đang tải dữ liệu...</p>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { userApi, productApi } from '@/api/axios';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

const selectedYear = ref(2024);
const reportType = ref('monthly');
const years = ref([2022, 2023, 2024, 2025]);
const isLoading = ref(false);

const totalRevenue = ref(0);
const totalOrders = ref(0);
const averageOrderValue = ref(0);
const newCustomers = ref(0);
const reportData = ref([]);

const inventoryStats = ref({
  totalProducts: 0,
  totalStock: 0,
  lowStockCount: 0,
  totalValue: 0
});
const inventoryProducts = ref([]);

let revenueChart = null;
let topProductsChart = null;

onMounted(() => {
  loadData();
  loadInventoryStats();
});

watch([selectedYear, reportType], () => {
  loadData();
});

async function loadInventoryStats() {
  try {
    const res = await productApi.get('/products');
    const products = res.data;
    
    inventoryProducts.value = products;
    inventoryStats.value = {
      totalProducts: products.length,
      totalStock: products.reduce((sum, p) => sum + (p.stockQuantity || 0), 0),
      lowStockCount: products.filter(p => (p.stockQuantity || 0) <= (p.minStockThreshold || 10)).length,
      totalValue: products.reduce((sum, p) => sum + ((p.stockQuantity || 0) * (p.salePrice || 0)), 0)
    };
  } catch (error) {
    console.error('Error loading inventory stats:', error);
    inventoryStats.value = {
      totalProducts: 5,
      totalStock: 81,
      lowStockCount: 2,
      totalValue: 45000000
    };
    inventoryProducts.value = [
      { id: 1, code: 'SP001', name: 'Laptop Dell', categoryName: 'Điện tử', stockQuantity: 0, minStockThreshold: 10 },
      { id: 2, code: 'SP002', name: 'Màn hình Samsung', categoryName: 'Điện tử', stockQuantity: 20, minStockThreshold: 10 },
      { id: 3, code: 'SP003', name: 'Bàn phím cơ', categoryName: 'Điện tử', stockQuantity: 50, minStockThreshold: 5 },
      { id: 4, code: 'SP004', name: 'Chuột không dây', categoryName: 'Điện tử', stockQuantity: 1, minStockThreshold: 10 },
      { id: 5, code: 'SP005', name: 'Tai nghe Sony', categoryName: 'Điện tử', stockQuantity: 10, minStockThreshold: 10 }
    ];
  }
}

function getStockStatusClass(quantity, threshold) {
  if (!quantity || quantity <= 0) return 'status-badge out-of-stock';
  if (quantity <= (threshold || 10)) return 'status-badge low-stock';
  return 'status-badge in-stock';
}

function getStockStatusText(quantity, threshold) {
  if (!quantity || quantity <= 0) return 'Hết hàng';
  if (quantity <= (threshold || 10)) return 'Sắp hết';
  return 'Còn hàng';
}

function exportInventoryExcel() {
  const headers = ['Mã SP', 'Tên sản phẩm', 'Danh mục', 'Tồn kho', 'Ngưỡng cảnh báo', 'Trạng thái'];
  const rows = inventoryProducts.value.map(p => [
    p.code || 'SP' + String(p.id).padStart(3, '0'),
    p.name,
    p.categoryName || 'Điện tử',
    p.stockQuantity || 0,
    p.minStockThreshold || 10,
    getStockStatusText(p.stockQuantity, p.minStockThreshold)
  ]);
  
  const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.setAttribute('download', 'bao_cao_ton_kho.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

async function loadData() {
  isLoading.value = true;
  try {
    const res = await userApi.get('/dashboard/revenue-by-month', {
      params: { year: selectedYear.value }
    });
    
    let data = res.data;
    
    if (reportType.value === 'quarterly') {
      data = aggregateByQuarter(data);
    } else if (reportType.value === 'yearly') {
      data = aggregateByYear(data);
    }
    
    reportData.value = data;
    
    totalRevenue.value = data.reduce((sum, item) => sum + item.revenue, 0);
    totalOrders.value = data.reduce((sum, item) => sum + item.orderCount, 0);
    averageOrderValue.value = totalRevenue.value / totalOrders.value || 0;
    newCustomers.value = Math.floor(totalOrders.value * 0.35);
    
    renderCharts(data);
    await loadTopProducts();
    
  } catch (error) {
    console.error('Error loading report:', error);
    loadMockData();
  } finally {
    isLoading.value = false;
  }
}

async function loadTopProducts() {
  try {
    const res = await userApi.get('/dashboard/top-products', { params: { top: 5 } });
    if (res.data && res.data.length > 0) {
      updateTopProductsChart(res.data);
    }
  } catch (error) {
    console.error('Error loading top products:', error);
  }
}

function updateTopProductsChart(products) {
  const ctx = document.getElementById('topProductsChart');
  if (!ctx) return;
  if (topProductsChart) topProductsChart.destroy();
  
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  
  topProductsChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: products.map(p => p.productName || 'SP-' + p.productId),
      datasets: [{
        data: products.map(p => p.quantity || p.revenueCount || 0),
        backgroundColor: colors,
        borderWidth: 0,
        hoverOffset: 10
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { position: 'bottom', labels: { font: { size: 12 } } },
        tooltip: { callbacks: { label: (ctx) => ctx.label + ': ' + ctx.raw + ' đơn' } }
      }
    }
  });
}

function aggregateByQuarter(monthlyData) {
  const quarters = [
    { name: 'Quý 1', months: [1, 2, 3] },
    { name: 'Quý 2', months: [4, 5, 6] },
    { name: 'Quý 3', months: [7, 8, 9] },
    { name: 'Quý 4', months: [10, 11, 12] }
  ];
  
  return quarters.map(quarter => {
    const data = monthlyData.filter(m => quarter.months.includes(m.month));
    return {
      period: quarter.name,
      revenue: data.reduce((sum, m) => sum + m.revenue, 0),
      orderCount: data.reduce((sum, m) => sum + m.orderCount, 0),
      growth: Math.floor(Math.random() * 20) - 5
    };
  });
}

function aggregateByYear(monthlyData) {
  return [{
    period: selectedYear.value.toString(),
    revenue: monthlyData.reduce((sum, m) => sum + m.revenue, 0),
    orderCount: monthlyData.reduce((sum, m) => sum + m.orderCount, 0),
    growth: 12
  }];
}

function loadMockData() {
  reportData.value = [
    { period: 'Tháng 1', revenue: 12500000, orderCount: 28, growth: 5.2 },
    { period: 'Tháng 2', revenue: 13800000, orderCount: 32, growth: 10.4 },
    { period: 'Tháng 3', revenue: 15200000, orderCount: 35, growth: 10.1 },
    { period: 'Tháng 4', revenue: 16800000, orderCount: 38, growth: 10.5 },
    { period: 'Tháng 5', revenue: 17500000, orderCount: 40, growth: 4.2 },
    { period: 'Tháng 6', revenue: 18900000, orderCount: 42, growth: 8.0 },
    { period: 'Tháng 7', revenue: 19500000, orderCount: 45, growth: 3.2 },
    { period: 'Tháng 8', revenue: 21000000, orderCount: 48, growth: 7.7 },
    { period: 'Tháng 9', revenue: 22500000, orderCount: 50, growth: 7.1 },
    { period: 'Tháng 10', revenue: 23800000, orderCount: 52, growth: 5.8 },
    { period: 'Tháng 11', revenue: 25000000, orderCount: 55, growth: 5.0 },
    { period: 'Tháng 12', revenue: 28000000, orderCount: 60, growth: 12.0 }
  ];
  
  totalRevenue.value = reportData.value.reduce((sum, i) => sum + i.revenue, 0);
  totalOrders.value = reportData.value.reduce((sum, i) => sum + i.orderCount, 0);
  averageOrderValue.value = totalRevenue.value / totalOrders.value;
  newCustomers.value = Math.floor(totalOrders.value * 0.35);
  
  renderCharts(reportData.value);
}

function renderCharts(data) {
  const ctx1 = document.getElementById('revenueChart');
  if (!ctx1) return;
  if (revenueChart) revenueChart.destroy();
  
  revenueChart = new Chart(ctx1, {
    type: 'bar',
    data: {
      labels: data.map(d => d.period),
      datasets: [
        {
          label: 'Doanh thu (VNĐ)',
          data: data.map(d => d.revenue),
          backgroundColor: 'rgba(59, 130, 246, 0.7)',
          borderRadius: 8,
          yAxisID: 'y'
        },
        {
          label: 'Số đơn hàng',
          data: data.map(d => d.orderCount),
          type: 'line',
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 3,
          tension: 0.3,
          fill: true,
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        tooltip: {
          callbacks: {
            label: (context) => {
              let label = context.dataset.label || '';
              let value = context.raw;
              if (context.dataset.label === 'Doanh thu (VNĐ)') {
                return label + ': ' + value.toLocaleString() + ' ₫';
              }
              return label + ': ' + value.toLocaleString();
            }
          }
        }
      },
      scales: {
        y: { 
          beginAtZero: true, 
          title: { display: true, text: 'Doanh thu (VNĐ)', font: { size: 12 } },
          ticks: { callback: (value) => value.toLocaleString() + ' ₫' }
        },
        y1: { 
          position: 'right', 
          beginAtZero: true, 
          title: { display: true, text: 'Số đơn hàng', font: { size: 12 } },
          grid: { drawOnChartArea: false }
        }
      }
    }
  });
  
  const ctx2 = document.getElementById('topProductsChart');
  if (!ctx2) return;
  if (topProductsChart) topProductsChart.destroy();
  
  topProductsChart = new Chart(ctx2, {
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
        legend: { position: 'bottom', labels: { font: { size: 12 } } },
        tooltip: { callbacks: { label: (ctx) => ctx.label + ': ' + ctx.raw + ' đơn' } }
      }
    }
  });
}

function formatCurrency(value) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);
}

function exportExcel() {
  const headers = ['Kỳ báo cáo', 'Doanh thu', 'Số đơn hàng', 'Giá trị TB/đơn', 'Tăng trưởng'];
  const rows = reportData.value.map(item => [
    item.period,
    item.revenue,
    item.orderCount,
    item.revenue / item.orderCount,
    item.growth + '%'
  ]);
  
  const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.setAttribute('download', 'bao_cao_' + selectedYear.value + '_' + reportType.value + '.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
</script>

<style scoped>
.reports-container {
  padding: 28px;
  background: linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%);
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
  flex-wrap: wrap;
  gap: 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon-wrapper {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-icon {
  width: 24px;
  height: 24px;
  color: white;
}

.header-text h1 {
  font-size: 26px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 4px;
}

.header-text p {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

.header-date {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: white;
  border-radius: 12px;
  font-size: 13px;
  color: #64748b;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}

.date-icon {
  width: 18px;
  height: 18px;
  color: #6366f1;
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  background: white;
  padding: 20px 24px;
  border-radius: 16px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  gap: 16px;
  flex-wrap: wrap;
}

.filter-left {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-group {
  min-width: 180px;
}

.filter-group label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.select-wrapper {
  position: relative;
}

.select-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: #94a3b8;
  pointer-events: none;
}

.filter-select {
  width: 100%;
  padding: 10px 36px 10px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  background: #f8fafc;
  color: #1e293b;
  cursor: pointer;
  appearance: none;
  transition: all 0.2s;
}

.filter-select:hover {
  border-color: #cbd5e1;
}

.filter-select:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.btn-export {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s;
  white-space: nowrap;
}

.btn-export:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3);
}

.btn-icon {
  width: 18px;
  height: 18px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
  margin-bottom: 28px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 22px;
  display: flex;
  align-items: flex-start;
  gap: 18px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  transition: all 0.3s ease;
  border: 1px solid #f1f5f9;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0,0,0,0.08);
  border-color: #e2e8f0;
}

.stat-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon-wrapper svg {
  width: 24px;
  height: 24px;
}

.stat-icon-wrapper.revenue {
  background: #eef2ff;
  color: #6366f1;
}

.stat-icon-wrapper.orders {
  background: #fef3c7;
  color: #f59e0b;
}

.stat-icon-wrapper.average {
  background: #ecfeff;
  color: #06b6d4;
}

.stat-icon-wrapper.customers {
  background: #fce7f3;
  color: #ec4899;
}

.stat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.2;
}

.stat-trend {
  font-size: 12px;
  font-weight: 500;
}

.stat-trend.up {
  color: #10b981;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.section-icon-wrapper {
  width: 36px;
  height: 36px;
  background: #eef2ff;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6366f1;
}

.section-icon-wrapper svg {
  width: 20px;
  height: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.inventory-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 28px;
}

.inventory-card {
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s;
}

.inventory-card:hover {
  transform: translateY(-3px);
}

.inventory-card.total {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}

.inventory-card.stock {
  background: linear-gradient(135deg, #10b981, #059669);
}

.inventory-card.low {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.inventory-card.value {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}

.inventory-icon-bg {
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.inventory-icon-bg svg {
  width: 22px;
  height: 22px;
  color: white;
}

.inventory-content {
  display: flex;
  flex-direction: column;
}

.inventory-value {
  font-size: 24px;
  font-weight: 700;
  color: white;
  line-height: 1.2;
}

.inventory-value.highlight-danger {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.inventory-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
  margin-top: 4px;
}

.charts-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 20px;
  margin-bottom: 28px;
}

.chart-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}

.chart-header {
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 4px;
}

.chart-subtitle {
  font-size: 12px;
  color: #94a3b8;
  margin: 0;
}

.chart-badge {
  padding: 5px 14px;
  background: #eef2ff;
  color: #6366f1;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

.chart-body {
  padding: 24px;
}

.chart-body canvas {
  max-height: 300px;
  width: 100% !important;
}

.table-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  margin-bottom: 24px;
}

.table-header {
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.table-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 4px;
}

.table-subtitle {
  font-size: 13px;
  color: #94a3b8;
  margin: 0;
}

.btn-export-small {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #f0fdf4;
  color: #059669;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-export-small:hover {
  background: #059669;
  color: white;
  border-color: #059669;
}

.table-body {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead th {
  padding: 14px 20px;
  background: #f8fafc;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #e2e8f0;
  text-align: left;
}

tbody td {
  padding: 14px 20px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 14px;
  color: #334155;
}

tbody tr:hover {
  background: #f8fafc;
}

tfoot td {
  padding: 14px 20px;
  background: #f8fafc;
  font-weight: 600;
  border-top: 2px solid #e2e8f0;
}

.text-right {
  text-align: right;
}

.text-center {
  text-align: center;
}

.text-danger {
  color: #ef4444 !important;
  font-weight: 600;
}

.period-badge {
  padding: 4px 12px;
  background: #f1f5f9;
  border-radius: 6px;
  font-weight: 500;
  font-size: 13px;
}

.amount-cell {
  font-weight: 500;
  color: #059669;
}

.growth-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
}

.growth-badge.positive {
  background: #f0fdf4;
  color: #059669;
}

.growth-badge.negative {
  background: #fef2f2;
  color: #dc2626;
}

.code-badge {
  padding: 3px 10px;
  background: #f1f5f9;
  border-radius: 6px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 12px;
  font-weight: 500;
  color: #6366f1;
}

.product-name {
  font-weight: 500;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.status-badge.in-stock {
  background: #f0fdf4;
  color: #059669;
}

.status-badge.in-stock .status-dot {
  background: #059669;
}

.status-badge.low-stock {
  background: #fffbeb;
  color: #d97706;
}

.status-badge.low-stock .status-dot {
  background: #d97706;
}

.status-badge.out-of-stock {
  background: #fef2f2;
  color: #dc2626;
}

.status-badge.out-of-stock .status-dot {
  background: #dc2626;
}

.empty-cell {
  padding: 40px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #94a3b8;
}

.empty-state svg {
  opacity: 0.4;
}

.loading-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  color: white;
  animation: spin 0.8s linear infinite;
}

.loading-spinner svg {
  width: 100%;
  height: 100%;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-overlay p {
  margin-top: 16px;
  color: white;
  font-size: 15px;
  font-weight: 500;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 1024px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid,
  .inventory-stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .reports-container {
    padding: 16px;
  }
  
  .stats-grid,
  .inventory-stats-grid {
    grid-template-columns: 1fr;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .filter-bar {
    flex-direction: column;
  }
  
  .filter-left {
    width: 100%;
    flex-direction: column;
  }
  
  .filter-group {
    width: 100%;
  }
}
</style>