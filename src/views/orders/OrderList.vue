// OrderList.vue
<template>
  <div class="order-list">
    <div class="page-header">
      <div>
        <h2>Quản lý đơn hàng</h2>
        <p class="subtitle">Danh sách tất cả đơn hàng trong hệ thống</p>
      </div>
      <router-link to="/app/orders/create" class="btn btn-primary">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 5v14M5 12h14"/>
        </svg>
        Tạo đơn hàng
      </router-link>
    </div>

    <div class="filter-bar">
      <div class="search-wrapper">
        <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="M21 21l-4.35-4.35"/>
        </svg>
        <input
          v-model="search"
          placeholder="Tìm theo tên khách hàng..."
          class="search-input"
        />
      </div>
      <select v-model="filterStatus" class="filter-select">
        <option value="">Tất cả trạng thái</option>
        <option value="Pending">Chờ xử lý</option>
        <option value="Confirmed">Đã xác nhận</option>
        <option value="Processing">Đang xử lý</option>
        <option value="Completed">Hoàn thành</option>
        <option value="Cancelled">Đã hủy</option>
      </select>
    </div>

    <div class="stats-row">
      <div class="stat-card">
        <span class="stat-label">Tổng đơn</span>
        <span class="stat-value">{{ orders.length }}</span>
      </div>
      <div class="stat-card yellow">
        <span class="stat-label">Chờ xử lý</span>
        <span class="stat-value">{{ countByStatus('Pending') }}</span>
      </div>
      <div class="stat-card blue">
        <span class="stat-label">Đã xác nhận</span>
        <span class="stat-value">{{ countByStatus('Confirmed') }}</span>
      </div>
      <div class="stat-card green">
        <span class="stat-label">Hoàn thành</span>
        <span class="stat-value">{{ countByStatus('Completed') }}</span>
      </div>
    </div>

    <div v-if="loading" class="loading">Đang tải...</div>
    <div v-if="error" class="error-box">{{ error }}</div>

    <div v-if="!loading" class="table-wrapper">
      <table class="orders-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Khách hàng</th>
            <th>Tổng tiền</th>
            <th>Đã trả</th>
            <th>Còn nợ</th>
            <th>Trạng thái</th>
            <th>Ngày tạo</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filteredOrders.length === 0">
            <td colspan="8" class="empty">Không có đơn hàng nào</td>
          </tr>
          <tr v-for="order in filteredOrders" :key="order.id">
            <td><strong>#{{ order.id }}</strong></td>
            <td>{{ order.customerName || '—' }}</td>
            <td>{{ formatMoney(order.totalAmount) }}</td>
            <td class="success">{{ formatMoney(order.paidAmount) }}</td>
            <td :class="order.debtAmount > 0 ? 'danger' : ''">{{ formatMoney(order.debtAmount) }}</td>
            <td>
              <span :class="['badge', badgeClass(order.status)]">
                {{ statusLabel(order.status) }}
              </span>
            </td>
            <td>{{ formatDate(order.createdAt) }}</td>
            <td class="actions">
              <router-link :to="`/app/orders/${order.id}`" class="btn btn-sm btn-outline">
                Chi tiết
              </router-link>
              <button
                v-if="order.status === 'Pending'"
                @click="confirmOrder(order.id)"
                class="btn btn-sm btn-success"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
                Xác nhận
              </button>
              <button
                v-if="!['Completed','Cancelled'].includes(order.status)"
                @click="cancelOrder(order.id)"
                class="btn btn-sm btn-danger"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
                Hủy
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { orderApi } from '@/api/axios.js';

const orders = ref([]);
const loading = ref(false);
const error = ref('');
const search = ref('');
const filterStatus = ref('');

const fetchOrders = async () => {
  loading.value = true;
  error.value = '';
  try {
    const res = await orderApi.get('/orders');
    orders.value = Array.isArray(res.data) ? res.data : (res.data.data || []);
  } catch (e) {
    error.value = e.response?.data?.message || 'Không tải được đơn hàng';
  } finally {
    loading.value = false;
  }
};

const confirmOrder = async (id) => {
  if (!confirm('Xác nhận đơn hàng?')) return;
  try {
    await orderApi.put(`/orders/${id}/confirm`);
    await fetchOrders();
  } catch (e) {
    alert(e.response?.data?.message || e.message);
  }
};

const cancelOrder = async (id) => {
  if (!confirm('Xác nhận hủy đơn hàng?')) return;
  try {
    await orderApi.delete(`/orders/${id}`);
    await fetchOrders();
  } catch (e) {
    alert(e.response?.data?.message || e.message);
  }
};

const filteredOrders = computed(() =>
  orders.value.filter(o => {
    const matchSearch = !search.value ||
      (o.customerName || '').toLowerCase().includes(search.value.toLowerCase());
    const matchStatus = !filterStatus.value || o.status === filterStatus.value;
    return matchSearch && matchStatus;
  })
);

const countByStatus = (status) => orders.value.filter(o => o.status === status).length;
const formatMoney = (n) => Number(n || 0).toLocaleString('vi-VN') + ' đ';
const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '—';
const statusLabel = (s) => ({ Pending: 'Chờ xử lý', Confirmed: 'Đã xác nhận', Processing: 'Đang xử lý', Completed: 'Hoàn thành', Cancelled: 'Đã hủy' }[s] || s);
const badgeClass = (s) => ({ Pending: 'badge-yellow', Confirmed: 'badge-blue', Processing: 'badge-orange', Completed: 'badge-green', Cancelled: 'badge-gray' }[s] || 'badge-gray');

onMounted(fetchOrders);
</script>

<style scoped>
.order-list { padding: 24px; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
.page-header h2 { margin: 0 0 4px; font-size: 20px; }
.subtitle { margin: 0; color: #6b7280; font-size: 13px; }

.filter-bar { 
  display: flex; 
  gap: 12px; 
  margin-bottom: 16px; 
  flex-wrap: wrap;
}
.search-wrapper {
  flex: 1;
  position: relative;
  min-width: 200px;
}
.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}
.search-input { 
  width: 100%;
  padding: 8px 12px 8px 36px; 
  border: 1px solid #e5e7eb; 
  border-radius: 8px; 
  font-size: 13px; 
}
.filter-select { 
  padding: 8px 12px; 
  border: 1px solid #e5e7eb; 
  border-radius: 8px; 
  font-size: 13px; 
}

.stats-row { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
.stat-card { 
  flex: 1; 
  min-width: 120px;
  background: #f9fafb; 
  border: 1px solid #e5e7eb; 
  border-radius: 10px; 
  padding: 14px 18px; 
  display: flex; 
  flex-direction: column; 
  gap: 4px; 
}
.stat-card.yellow { background: #fefce8; border-color: #fde047; }
.stat-card.blue { background: #eff6ff; border-color: #93c5fd; }
.stat-card.green { background: #f0fdf4; border-color: #86efac; }
.stat-label { font-size: 12px; color: #6b7280; }
.stat-value { font-size: 24px; font-weight: 700; color: #111827; }

.table-wrapper { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden; overflow-x: auto; }
.orders-table { width: 100%; border-collapse: collapse; font-size: 13px; min-width: 700px; }
.orders-table th { background: #f9fafb; padding: 10px 14px; text-align: left; font-size: 11px; color: #6b7280; font-weight: 600; border-bottom: 1px solid #e5e7eb; }
.orders-table td { padding: 10px 14px; border-bottom: 1px solid #f3f4f6; }
.orders-table tr:last-child td { border-bottom: none; }
.empty { text-align: center; color: #9ca3af; padding: 40px !important; }

.actions { display: flex; gap: 6px; flex-wrap: wrap; }
.success { color: #16a34a; font-weight: 500; }
.danger { color: #dc2626; font-weight: 500; }

.badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
.badge-yellow { background: #fef9c3; color: #a16207; }
.badge-blue { background: #dbeafe; color: #1d4ed8; }
.badge-orange { background: #ffedd5; color: #c2410c; }
.badge-green { background: #dcfce7; color: #15803d; }
.badge-gray { background: #f3f4f6; color: #6b7280; }

.btn { 
  padding: 7px 14px; 
  border-radius: 6px; 
  border: none; 
  cursor: pointer; 
  font-size: 13px; 
  font-weight: 600; 
  text-decoration: none; 
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.btn-primary { background: #2563eb; color: #fff; }
.btn-outline { background: #fff; color: #374151; border: 1px solid #e5e7eb; }
.btn-success { background: #16a34a; color: #fff; }
.btn-danger { background: #dc2626; color: #fff; }
.btn-sm { padding: 4px 10px; font-size: 12px; }

.loading { text-align: center; padding: 60px; color: #6b7280; }
.error-box { background: #fee2e2; color: #b91c1c; padding: 12px 16px; border-radius: 8px; font-size: 13px; margin-bottom: 16px; }
</style>