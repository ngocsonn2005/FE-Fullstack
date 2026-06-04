<template>
  <div class="order-detail">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>📋 Chi tiết đơn hàng #{{ order?.id }}</h1>
      <div>
        <router-link to="/orders" class="btn btn-secondary me-2">← Quay lại</router-link>
        <button v-if="order?.debtAmount > 0" class="btn btn-success" @click="openPaymentModal">
          💰 Thanh toán công nợ
        </button>
      </div>
    </div>

    <div class="row">
      <div class="col-md-6">
        <div class="card mb-4">
          <div class="card-header bg-primary text-white">
            <h5 class="mb-0">📌 Thông tin đơn hàng</h5>
          </div>
          <div class="card-body">
            <table class="table table-borderless">
              <tbody>
                <tr><th width="40%">Mã đơn hàng:</th><td><strong>#{{ order?.id }}</strong></td></tr>
                <tr><th>Ngày tạo:</th><td>{{ formatDate(order?.createdAt) }}</td></tr>
                <tr><th>Trạng thái:</th><td><span :class="'badge ' + getStatusBadge(order?.status)">{{ getStatusText(order?.status) }}</span></td></tr>
                <tr><th>Nhân viên tạo:</th><td>{{ order?.createdBy || 'Admin' }}</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="card mb-4">
          <div class="card-header bg-info text-white">
            <h5 class="mb-0">👤 Thông tin khách hàng</h5>
          </div>
          <div class="card-body">
            <table class="table table-borderless">
              <tbody>
                <tr><th width="40%">Tên khách hàng:</th><td><strong>{{ customer?.name || `KH-${order?.customerId}` }}</strong></td></tr>
                <tr><th>Số điện thoại:</th><td>{{ customer?.phone || '---' }}</td></tr>
                <tr><th>Công nợ hiện tại:</th><td :class="customer?.debt > 0 ? 'text-danger fw-bold' : 'text-success'">{{ formatCurrency(customer?.debt) }}</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="col-md-6">
        <div class="card mb-4">
          <div class="card-header bg-success text-white">
            <h5 class="mb-0">💰 Thanh toán</h5>
          </div>
          <div class="card-body">
            <table class="table table-borderless">
              <tbody>
                <tr><th width="40%">Tổng tiền hàng:</th><td class="text-end">{{ formatCurrency(order?.totalAmount + (order?.discountAmount || 0)) }}</td></tr>
                <tr><th>Giảm giá ({{ order?.discountPercent || 0 }}%):</th><td class="text-end text-danger">-{{ formatCurrency(order?.discountAmount) }}</td></tr>
                <tr class="fw-bold"><th>Tổng cộng:</th><td class="text-end text-primary">{{ formatCurrency(order?.totalAmount) }}</td></tr>
                <tr><th>Đã thanh toán:</th><td class="text-end text-success">{{ formatCurrency(order?.paidAmount) }}</td></tr>
                <tr class="fw-bold"><th>Công nợ:</th><td class="text-end" :class="order?.debtAmount > 0 ? 'text-danger' : 'text-success'">{{ formatCurrency(order?.debtAmount) }}</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header bg-dark text-white">
        <h5 class="mb-0">📦 Sản phẩm đã đặt</h5>
      </div>
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr><th>STT</th><th>Sản phẩm</th><th class="text-center">Số lượng</th><th class="text-end">Đơn giá</th><th class="text-end">Thành tiền</th></tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in order?.orderDetails" :key="item.id">
                <td>{{ index + 1 }}</td>
                <td>{{ getProductName(item.productId) }}</td>
                <td class="text-center">{{ item.quantity }}</td>
                <td class="text-end">{{ formatCurrency(item.price) }}</td>
                <td class="text-end fw-bold">{{ formatCurrency(item.price * item.quantity) }}</td>
              </tr>
              <tr v-if="!order?.orderDetails?.length">
                <td colspan="5" class="text-center py-5 text-muted">Không có sản phẩm nào</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="modal" :class="{ show: showPaymentModal }" v-if="showPaymentModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-success text-white">
            <h5 class="modal-title">💰 Thanh toán công nợ</h5>
            <button class="btn-close btn-close-white" @click="showPaymentModal = false"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Số tiền cần thanh toán</label>
              <input type="number" class="form-control" v-model="paymentAmount" :max="order?.debtAmount">
              <small class="text-muted">Công nợ hiện tại: {{ formatCurrency(order?.debtAmount) }}</small>
            </div>
            <div class="mb-3">
              <label class="form-label">Phương thức thanh toán</label>
              <select class="form-select" v-model="paymentMethod">
                <option value="cash">💵 Tiền mặt</option>
                <option value="bank">🏦 Chuyển khoản</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="showPaymentModal = false">Hủy</button>
            <button class="btn btn-success" @click="processPayment" :disabled="processing">
              {{ processing ? 'Đang xử lý...' : 'Xác nhận thanh toán' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { orderApi } from '@/api/axios';

const route = useRoute();
const router = useRouter();
const order = ref(null);
const customer = ref(null);
const showPaymentModal = ref(false);
const paymentAmount = ref(0);
const paymentMethod = ref('cash');
const processing = ref(false);

onMounted(async () => {
  await loadOrder();
});

async function loadOrder() {
  try {
    const orderId = route.params.id;
    const res = await orderApi.get(`/orders/${orderId}`);
    order.value = res.data;
    
    if (order.value.customerId) {
      const customerRes = await orderApi.get(`/customers/${order.value.customerId}`);
      customer.value = customerRes.data;
    }
  } catch (error) {
    console.error('Error loading order:', error);
    alert('Không thể tải thông tin đơn hàng!');
    router.push('/orders');
  }
}

function getProductName(productId) {
  return `Sản phẩm #${productId}`;
}

function getStatusBadge(status) {
  const badges = {
    'pending': 'bg-warning',
    'completed': 'bg-success',
    'cancelled': 'bg-danger'
  };
  return badges[status] || 'bg-secondary';
}

function getStatusText(status) {
  const texts = {
    'pending': 'Chờ xử lý',
    'completed': 'Hoàn thành',
    'cancelled': 'Đã hủy'
  };
  return texts[status] || 'Không xác định';
}

function openPaymentModal() {
  paymentAmount.value = order.value?.debtAmount || 0;
  showPaymentModal.value = true;
}

async function processPayment() {
  if (paymentAmount.value <= 0) {
    alert('Số tiền thanh toán phải lớn hơn 0!');
    return;
  }
  
  processing.value = true;
  try {
    await orderApi.post(`/orders/${order.value.id}/pay`, {
      amount: paymentAmount.value,
      method: paymentMethod.value
    });
    
    alert('✅ Thanh toán thành công!');
    showPaymentModal.value = false;
    await loadOrder();
  } catch (error) {
    console.error('Payment error:', error);
    alert('Thanh toán thất bại!');
  } finally {
    processing.value = false;
  }
}

function formatCurrency(value) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);
}

function formatDate(dateString) {
  if (!dateString) return '--/--/----';
  return new Date(dateString).toLocaleString('vi-VN');
}
</script>

<style scoped>
.order-detail { padding: 20px; }
.card { border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); margin-bottom: 20px; }
.table-borderless th { font-weight: 600; }
.modal.show { display: block; background: rgba(0,0,0,0.5); }
</style>