<template>
  <div class="order-list">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>🛒 Quản lý đơn hàng</h1>
      <router-link to="/orders/create" class="btn btn-primary">
        + Tạo đơn hàng
      </router-link>
    </div>

    <!-- Thống kê nhanh -->
    <div class="row g-3 mb-4">
      <div class="col-md-3">
        <div class="stat-card bg-primary text-white">
          <div class="stat-value">{{ stats.totalOrders }}</div>
          <div class="stat-label">Tổng đơn hàng</div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="stat-card bg-success text-white">
          <div class="stat-value">{{ formatCurrency(stats.totalRevenue) }}</div>
          <div class="stat-label">Doanh thu</div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="stat-card bg-warning text-white">
          <div class="stat-value">{{ formatCurrency(stats.totalDebt) }}</div>
          <div class="stat-label">Công nợ</div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="stat-card bg-info text-white">
          <div class="stat-value">{{ stats.todayOrders }}</div>
          <div class="stat-label">Hôm nay</div>
        </div>
      </div>
    </div>

    <!-- Bộ lọc -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row">
          <div class="col-md-3">
            <input type="text" class="form-control" v-model="searchKeyword" placeholder="🔍 Tìm kiếm...">
          </div>
          <div class="col-md-3">
            <select class="form-select" v-model="filterStatus">
              <option value="">Tất cả trạng thái</option>
              <option value="completed">Hoàn thành</option>
              <option value="pending">Chờ xử lý</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>
          <div class="col-md-2">
            <button class="btn btn-outline-secondary w-100" @click="refreshData">🔄 Làm mới</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Bảng đơn hàng -->
    <div class="card">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-dark">
              <tr>
                <th>Mã ĐH</th>
                <th>Khách hàng</th>
                <th>Tổng tiền</th>
                <th>Đã trả</th>
                <th>Công nợ</th>
                <th>Giảm giá</th>
                <th>Ngày tạo</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in orders" :key="order.id">
                <td class="fw-bold">#{{ order.id }}</td>
                <td>{{ order.customerName || `KH-${order.customerId}` }}</td>
                <td class="text-primary fw-bold">{{ formatCurrency(order.totalAmount) }}</td>
                <td class="text-success">{{ formatCurrency(order.paidAmount) }}</td>
                <td :class="order.debtAmount > 0 ? 'text-danger' : 'text-muted'">
                  {{ formatCurrency(order.debtAmount) }}
                </td>
                <td>{{ order.discountPercent || 0 }}%</td>
                <td>{{ formatDate(order.createdAt) }}</td>
                <td>
                  <button class="btn btn-sm btn-outline-info me-1" @click="viewDetail(order)" title="Chi tiết">
                    👁️
                  </button>
                  <button class="btn btn-sm btn-outline-danger" @click="deleteOrder(order.id)" title="Xóa" v-if="isAdmin">
                    🗑️
                  </button>
                </td>
              </tr>
              <tr v-if="orders.length === 0">
                <td colspan="8" class="text-center py-5 text-muted">Không có đơn hàng nào</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal chi tiết -->
    <div class="modal" :class="{ show: showDetailModal }" v-if="showDetailModal">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header bg-info text-white">
            <h5 class="modal-title">📋 Chi tiết đơn hàng #{{ selectedOrder?.id }}</h5>
            <button class="btn-close btn-close-white" @click="showDetailModal = false"></button>
          </div>
          <div class="modal-body">
            <div class="row mb-3">
              <div class="col-md-6">
                <strong>Khách hàng:</strong> {{ selectedOrder?.customerName || `KH-${selectedOrder?.customerId}` }}
              </div>
              <div class="col-md-6">
                <strong>Ngày tạo:</strong> {{ formatDate(selectedOrder?.createdAt) }}
              </div>
            </div>
            <table class="table table-sm">
              <thead>
                <tr><th>Sản phẩm</th><th>Số lượng</th><th>Đơn giá</th><th>Thành tiền</th></tr>
              </thead>
              <tbody>
                <tr v-for="item in selectedOrder?.orderDetails" :key="item.id">
                  <td>Sản phẩm #{{ item.productId }}</td>
                  <td>{{ item.quantity }}</td>
                  <td>{{ formatCurrency(item.price) }}</td>
                  <td>{{ formatCurrency(item.price * item.quantity) }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr><td colspan="3" class="text-end fw-bold">Tổng tiền:</td><td class="fw-bold">{{ formatCurrency(selectedOrder?.totalAmount) }}</td></tr>
                <tr><td colspan="3" class="text-end">Giảm giá ({{ selectedOrder?.discountPercent || 0 }}%):</td><td class="text-danger">-{{ formatCurrency(selectedOrder?.discountAmount) }}</td></tr>
                <tr><td colspan="3" class="text-end">Đã thanh toán:</td><td class="text-success">{{ formatCurrency(selectedOrder?.paidAmount) }}</td></tr>
                <tr><td colspan="3" class="text-end fw-bold">Công nợ:</td><td :class="selectedOrder?.debtAmount > 0 ? 'text-danger fw-bold' : 'text-muted'">{{ formatCurrency(selectedOrder?.debtAmount) }}</td></tr>
              </tfoot>
            </table>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="showDetailModal = false">Đóng</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { orderApi } from '@/api/axios';

const orders = ref([]);
const stats = ref({ totalOrders: 0, totalRevenue: 0, totalDebt: 0, todayOrders: 0 });
const searchKeyword = ref('');
const filterStatus = ref('');
const showDetailModal = ref(false);
const selectedOrder = ref(null);
const isAdmin = localStorage.getItem('role') === 'Admin';

onMounted(() => {
  loadOrders();
  loadStats();
});

async function loadOrders() {
  try {
    const res = await orderApi.get('/orders');
    orders.value = res.data;
  } catch (error) {
    console.error('Error loading orders:', error);
  }
}

async function loadStats() {
  try {
    const res = await orderApi.get('/orders/stats');
    stats.value = res.data;
  } catch (error) {
    // Mock data
    stats.value = { totalOrders: 45, totalRevenue: 125000000, totalDebt: 25000000, todayOrders: 3 };
  }
}

function viewDetail(order) {
  selectedOrder.value = order;
  showDetailModal.value = true;
}

async function deleteOrder(id) {
  if (confirm('Bạn có chắc muốn xóa đơn hàng này?')) {
    try {
      await orderApi.delete(`/orders/${id}`);
      await loadOrders();
      alert('Xóa thành công!');
    } catch (error) {
      alert('Xóa thất bại!');
    }
  }
}

function refreshData() {
  loadOrders();
  loadStats();
}

function formatCurrency(value) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);
}

function formatDate(dateString) {
  if (!dateString) return '--/--/----';
  return new Date(dateString).toLocaleDateString('vi-VN');
}
</script>

<style scoped>
.order-list { padding: 20px; }
.stat-card { padding: 15px; border-radius: 10px; text-align: center; }
.stat-value { font-size: 28px; font-weight: bold; }
.stat-label { font-size: 14px; opacity: 0.9; margin-top: 5px; }
.modal.show { display: block; background: rgba(0,0,0,0.5); }
.bg-primary { background: linear-gradient(135deg, #667eea, #764ba2); }
.bg-success { background: linear-gradient(135deg, #11998e, #38ef7d); }
.bg-warning { background: linear-gradient(135deg, #f2994a, #f2c94c); }
.bg-info { background: linear-gradient(135deg, #2193b0, #6dd5ed); }
.text-white { color: white; }
</style>