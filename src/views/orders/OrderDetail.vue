// OrderDetail.vue
<template>
  <div class="order-detail">
    <div class="page-header">
      <div>
        <router-link to="/app/orders" class="back-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Quay lại danh sách
        </router-link>
        <h2>Chi tiết đơn hàng: <span class="order-code">#{{ order?.id }}</span></h2>
      </div>
      <div class="header-actions" v-if="order">
        <button @click="openInvoice" class="btn btn-outline">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="3" width="20" height="18" rx="2"/>
            <path d="M8 7h8M8 11h6M8 15h4"/>
          </svg>
          Xuất hóa đơn
        </button>
        <button v-if="order.status === 'Pending'" @click="confirmOrder" class="btn btn-success">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
          Xác nhận đơn
        </button>
        <button v-if="order.status === 'Confirmed'" @click="nextStatus('Processing')" class="btn btn-primary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
          Chuyển xử lý
        </button>
        <button v-if="order.status === 'Processing'" @click="nextStatus('Completed')" class="btn btn-success">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
          Hoàn thành
        </button>
        <button v-if="!['Completed','Cancelled'].includes(order.status)" @click="cancelOrder" class="btn btn-danger">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
          Hủy đơn
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading">Đang tải...</div>
    <div v-if="error" class="error-box">{{ error }}</div>

    <div v-if="order && !loading" class="content-grid">
      <div class="left-col">
        <div class="card">
          <h3>Thông tin đơn hàng</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Mã đơn hàng</span>
              <span class="info-value"><strong>#{{ order.id }}</strong></span>
            </div>
            <div class="info-item">
              <span class="info-label">Trạng thái</span>
              <span :class="['badge', badgeClass(order.status)]">{{ statusLabel(order.status) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Ngày tạo</span>
              <span class="info-value">{{ formatDate(order.createdAt) }}</span>
            </div>
          </div>
        </div>

        <div class="card">
          <h3>Thông tin khách hàng</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Tên</span>
              <span class="info-value"><strong>{{ order.customerName || '—' }}</strong></span>
            </div>
            <div class="info-item">
              <span class="info-label">Mã KH</span>
              <span class="info-value">#{{ order.customerId }}</span>
            </div>
          </div>
        </div>

        <div class="card">
          <h3>Danh sách sản phẩm</h3>
          <table class="items-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Tên sản phẩm</th>
                <th>Số lượng</th>
                <th>Đơn giá</th>
                <th>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!order.orderItems || !order.orderItems.length">
                <td colspan="5" style="text-align:center;color:#9ca3af">Không có sản phẩm</td>
              </tr>
              <tr v-for="(item, i) in order.orderItems" :key="item.id">
                <td>{{ i + 1 }}</td>
                <td>{{ item.productName }}</td>
                <td>{{ item.quantity }}</td>
                <td>{{ formatMoney(item.price) }}</td>
                <td><strong>{{ formatMoney(item.price * item.quantity) }}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="right-col">
        <div class="card">
          <h3>Thanh toán</h3>
          <div class="payment-summary">
            <div class="pay-row">
              <span>Tổng tiền hàng</span>
              <span class="amount">{{ formatMoney(order.totalAmount) }}</span>
            </div>
            <div class="pay-row">
              <span>Đã thanh toán</span>
              <span class="amount success">{{ formatMoney(order.paidAmount) }}</span>
            </div>
            <div class="pay-row total">
              <span>Còn lại</span>
              <span class="amount" :class="remaining > 0 ? 'danger' : 'success'">{{ formatMoney(remaining) }}</span>
            </div>
          </div>

          <div v-if="remaining > 0 && order.status !== 'Cancelled'" class="pay-form">
            <h4>Ghi nhận thanh toán</h4>
            <div class="form-group">
              <label>Số tiền (đ)</label>
              <input type="number" v-model.number="payAmount" :max="remaining" :placeholder="remaining" />
            </div>
            <div class="form-group">
              <label>Phương thức</label>
              <select v-model="payMethod">
                <option value="Cash">Tiền mặt</option>
                <option value="BankTransfer">Chuyển khoản</option>
                <option value="Card">Thẻ</option>
              </select>
            </div>
            <button @click="processPayment" :disabled="payLoading" class="btn btn-success btn-full">
              {{ payLoading ? 'Đang xử lý...' : 'Xác nhận thanh toán' }}
            </button>
            <div v-if="payError" class="error-box" style="margin-top:8px">{{ payError }}</div>
            <div v-if="paySuccess" class="success-box">{{ paySuccess }}</div>
          </div>
          <div v-else-if="remaining <= 0" class="paid-badge">Đã thanh toán đủ</div>
        </div>

        <div class="card">
          <h3>Vòng đời đơn hàng</h3>
          <div class="timeline">
            <div v-for="step in statusSteps" :key="step.key"
              :class="['timeline-item', getStepClass(step.key)]">
              <div class="timeline-dot"></div>
              <div class="timeline-info">
                <div class="timeline-label">{{ step.label }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL HÓA ĐƠN -->
    <div v-if="showInvoice" class="modal-overlay" @click.self="showInvoice = false">
      <div class="modal-box">
        <div class="modal-toolbar">
          <span class="modal-title">Hóa đơn bán hàng</span>
          <div class="modal-actions">
            <button @click="printInvoice" class="btn btn-outline btn-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 6 2 18 2 18 9"/>
                <path d="M18 9h3v9H3V9h3"/>
                <rect x="6" y="13" width="12" height="6" rx="1"/>
                <path d="M9 16h6"/>
              </svg>
              In hóa đơn
            </button>
            <button @click="downloadInvoicePdf" :disabled="pdfLoading" class="btn btn-primary btn-sm">
              {{ pdfLoading ? 'Đang tạo PDF...' : 'Tải PDF' }}
            </button>
            <button @click="showInvoice = false" class="modal-close">×</button>
          </div>
        </div>

        <div class="modal-scroll">
          <div ref="invoiceRef" class="invoice-paper">
            <div class="invoice-header">
              <div>
                <h2 class="invoice-company">SmartStockDNU</h2>
                <p class="invoice-sub">Hệ thống quản lý bán hàng &amp; kho hàng</p>
              </div>
              <div class="invoice-meta">
                <h3>HÓA ĐƠN BÁN HÀNG</h3>
                <p>Số: <strong>HD-{{ String(order.id).padStart(6, '0') }}</strong></p>
                <p>Ngày: {{ formatDate(order.createdAt) }}</p>
              </div>
            </div>

            <hr />

            <div class="invoice-info-row">
              <div>
                <div class="invoice-info-label">Khách hàng</div>
                <div class="invoice-info-value">{{ order.customerName || '—' }}</div>
              </div>
              <div>
                <div class="invoice-info-label">Mã đơn hàng</div>
                <div class="invoice-info-value">#{{ order.id }}</div>
              </div>
              <div>
                <div class="invoice-info-label">Trạng thái</div>
                <div class="invoice-info-value">{{ statusLabel(order.status) }}</div>
              </div>
            </div>

            <table class="invoice-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Tên sản phẩm</th>
                  <th class="text-center">SL</th>
                  <th class="text-right">Đơn giá</th>
                  <th class="text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, i) in order.orderItems" :key="item.id">
                  <td>{{ i + 1 }}</td>
                  <td>{{ item.productName }}</td>
                  <td class="text-center">{{ item.quantity }}</td>
                  <td class="text-right">{{ formatMoney(item.price) }}</td>
                  <td class="text-right">{{ formatMoney(item.price * item.quantity) }}</td>
                </tr>
              </tbody>
            </table>

            <div class="invoice-summary">
              <div class="invoice-summary-row">
                <span>Tạm tính</span>
                <span>{{ formatMoney(order.totalAmount + (order.discountAmount || 0)) }}</span>
              </div>
              <div class="invoice-summary-row" v-if="order.discountAmount > 0">
                <span>Giảm giá{{ order.discountPercent ? ` (${order.discountPercent}%)` : '' }}</span>
                <span>- {{ formatMoney(order.discountAmount) }}</span>
              </div>
              <div class="invoice-summary-row total">
                <span>Tổng cộng</span>
                <span>{{ formatMoney(order.totalAmount) }}</span>
              </div>
              <div class="invoice-summary-row">
                <span>Đã thanh toán</span>
                <span>{{ formatMoney(order.paidAmount) }}</span>
              </div>
              <div class="invoice-summary-row" :class="remaining > 0 ? 'danger' : 'success'">
                <span>{{ remaining > 0 ? 'Còn lại' : 'Đã thanh toán đủ' }}</span>
                <span v-if="remaining > 0">{{ formatMoney(remaining) }}</span>
              </div>
            </div>

            <div class="invoice-footer">
              <p>Cảm ơn quý khách đã mua hàng!</p>
              <p class="invoice-printed-at">Xuất lúc: {{ new Date().toLocaleString('vi-VN') }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { orderApi } from '@/api/axios.js';

const route = useRoute();
const router = useRouter();
const order = ref(null);
const loading = ref(false);
const error = ref('');
const payAmount = ref(0);
const payMethod = ref('Cash');
const payLoading = ref(false);
const payError = ref('');
const paySuccess = ref('');

const showInvoice = ref(false);
const invoiceRef = ref(null);
const pdfLoading = ref(false);

const statusSteps = [
  { key: 'Pending', label: 'Chờ xử lý' },
  { key: 'Confirmed', label: 'Đã xác nhận' },
  { key: 'Processing', label: 'Đang xử lý' },
  { key: 'Completed', label: 'Hoàn thành' },
];

const remaining = computed(() => (order.value?.totalAmount || 0) - (order.value?.paidAmount || 0));

const fetchOrder = async () => {
  loading.value = true;
  error.value = '';
  try {
    const res = await orderApi.get(`/orders/${route.params.id}`);
    order.value = res.data.data ?? res.data;
    payAmount.value = remaining.value;
  } catch (e) {
    error.value = 'Không thể tải thông tin đơn hàng';
  } finally {
    loading.value = false;
  }
};

const confirmOrder = async () => {
  if (!confirm('Xác nhận đơn hàng?')) return;
  try {
    await orderApi.put(`/orders/${route.params.id}/confirm`);
    await fetchOrder();
  } catch (e) {
    error.value = 'Lỗi: ' + (e.response?.data?.message || e.message);
  }
};

const nextStatus = async (status) => {
  if (!confirm(`Xác nhận chuyển sang "${statusLabel(status)}"?`)) return;
  try {
    await orderApi.put(`/orders/${route.params.id}/status?status=${status}`);
    await fetchOrder();
  } catch (e) {
    error.value = 'Lỗi: ' + (e.response?.data?.message || e.message);
  }
};

const cancelOrder = async () => {
  if (!confirm('Xác nhận hủy đơn hàng này?')) return;
  try {
    await orderApi.delete(`/orders/${route.params.id}`);
    router.push('/app/orders');
  } catch (e) {
    error.value = 'Lỗi: ' + (e.response?.data?.message || e.message);
  }
};

const processPayment = async () => {
  payError.value = '';
  paySuccess.value = '';
  if (!payAmount.value || payAmount.value <= 0) {
    payError.value = 'Nhập số tiền hợp lệ';
    return;
  }
  payLoading.value = true;
  try {
    const res = await orderApi.post('/billing', {
      orderId: parseInt(route.params.id),
      amount: payAmount.value,
      paymentMethod: payMethod.value,
      note: ''
    });
    paySuccess.value = res.data.message || 'Thanh toán thành công!';
    await fetchOrder();
  } catch (e) {
    payError.value = 'Lỗi: ' + (e.response?.data?.message || e.message);
  } finally {
    payLoading.value = false;
  }
};

const getStepClass = (stepKey) => {
  const order_status = order.value?.status;
  const steps = ['Pending', 'Confirmed', 'Processing', 'Completed'];
  const currentIdx = steps.indexOf(order_status);
  const stepIdx = steps.indexOf(stepKey);
  if (order_status === 'Cancelled') return stepIdx === 0 ? 'done' : 'cancelled';
  if (stepIdx < currentIdx) return 'done';
  if (stepIdx === currentIdx) return 'active';
  return 'pending';
};

const openInvoice = () => {
  showInvoice.value = true;
};

const loadScript = (src) => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = () => reject(new Error('Không tải được thư viện: ' + src));
    document.head.appendChild(script);
  });
};

const printInvoice = () => {
  const content = invoiceRef.value?.innerHTML;
  if (!content) return;

  const printWin = window.open('', '_blank', 'width=800,height=900');
  printWin.document.write(`
    <html>
      <head>
        <title>Hóa đơn #${order.value.id}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
          .invoice-header { display: flex; justify-content: space-between; margin-bottom: 12px; }
          .invoice-company { margin: 0; font-size: 20px; }
          .invoice-sub { margin: 2px 0 0; font-size: 12px; color: #6b7280; }
          .invoice-meta { text-align: right; font-size: 12px; }
          .invoice-meta h3 { margin: 0 0 4px; font-size: 15px; }
          hr { border: none; border-top: 1px solid #e5e7eb; margin: 12px 0; }
          .invoice-info-row { display: flex; gap: 24px; margin-bottom: 16px; }
          .invoice-info-label { font-size: 11px; color: #6b7280; }
          .invoice-info-value { font-weight: 600; font-size: 13px; }
          table.invoice-table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 16px; }
          table.invoice-table th, table.invoice-table td { padding: 8px 10px; border-bottom: 1px solid #e5e7eb; }
          table.invoice-table th { background: #f9fafb; text-align: left; font-size: 11px; color: #6b7280; }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .invoice-summary { margin-left: auto; width: 280px; display: flex; flex-direction: column; gap: 6px; }
          .invoice-summary-row { display: flex; justify-content: space-between; font-size: 13px; }
          .invoice-summary-row.total { font-weight: 700; font-size: 15px; border-top: 1px solid #e5e7eb; padding-top: 8px; }
          .invoice-summary-row.danger { color: #dc2626; font-weight: 600; }
          .invoice-summary-row.success { color: #16a34a; font-weight: 600; }
          .invoice-footer { text-align: center; margin-top: 24px; font-size: 12px; color: #6b7280; }
        </style>
      </head>
      <body>${content}</body>
    </html>
  `);
  printWin.document.close();
  printWin.focus();
  setTimeout(() => {
    printWin.print();
    printWin.close();
  }, 300);
};

const downloadInvoicePdf = async () => {
  pdfLoading.value = true;
  try {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');

    const canvas = await window.html2canvas(invoiceRef.value, { scale: 2, backgroundColor: '#ffffff' });
    const imgData = canvas.toDataURL('image/png');

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgWidth = pageWidth - 20;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
    pdf.save(`HoaDon_${order.value.id}.pdf`);
  } catch (e) {
    alert('Lỗi xuất PDF: ' + e.message);
  } finally {
    pdfLoading.value = false;
  }
};

const formatMoney = (n) => Number(n || 0).toLocaleString('vi-VN') + ' đ';
const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '—';
const statusLabel = (s) => ({ Pending: 'Chờ xử lý', Confirmed: 'Đã xác nhận', Processing: 'Đang xử lý', Completed: 'Hoàn thành', Cancelled: 'Đã hủy' }[s] || s);
const badgeClass = (s) => ({ Pending: 'badge-yellow', Confirmed: 'badge-blue', Processing: 'badge-orange', Completed: 'badge-green', Cancelled: 'badge-gray' }[s] || 'badge-gray');

onMounted(fetchOrder);
</script>

<style scoped>
.order-detail { padding: 24px; }
.page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 20px; }
.back-link { 
  color: #2563eb; 
  font-size: 13px; 
  text-decoration: none; 
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 6px; 
}
.page-header h2 { margin: 0; font-size: 20px; }
.order-code { color: #2563eb; }
.header-actions { display: flex; gap: 8px; flex-wrap: wrap; }
.content-grid { display: grid; grid-template-columns: 1fr 340px; gap: 20px; }
.left-col, .right-col { display: flex; flex-direction: column; gap: 20px; }
.card { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 20px; }
.card h3 { margin: 0 0 16px; font-size: 15px; font-weight: 600; color: #111827; }
.card h4 { margin: 16px 0 10px; font-size: 13px; font-weight: 600; color: #374151; border-top: 1px solid #f3f4f6; padding-top: 16px; }
.info-grid { display: flex; flex-direction: column; gap: 10px; }
.info-item { display: flex; justify-content: space-between; align-items: center; font-size: 13.5px; }
.info-label { color: #6b7280; }
.info-value { font-weight: 500; }
.items-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.items-table th { background: #f9fafb; padding: 8px 12px; text-align: left; font-size: 11px; color: #6b7280; font-weight: 600; border-bottom: 1px solid #e5e7eb; }
.items-table td { padding: 8px 12px; border-bottom: 1px solid #f3f4f6; }
.payment-summary { display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; }
.pay-row { display: flex; justify-content: space-between; font-size: 13.5px; }
.pay-row.total { border-top: 1px solid #e5e7eb; padding-top: 10px; margin-top: 4px; font-weight: 700; font-size: 15px; }
.amount { font-weight: 600; }
.success { color: #16a34a; }
.danger { color: #dc2626; }
.pay-form .form-group { margin-bottom: 10px; }
label { display: block; font-size: 12px; font-weight: 600; color: #6b7280; margin-bottom: 4px; }
input, select { width: 100%; padding: 8px 10px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 13px; box-sizing: border-box; }
.btn { 
  padding: 8px 16px; 
  border-radius: 6px; 
  border: none; 
  cursor: pointer; 
  font-size: 13px; 
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.btn-primary { background: #2563eb; color: #fff; }
.btn-success { background: #16a34a; color: #fff; }
.btn-danger { background: #dc2626; color: #fff; }
.btn-outline { background: #fff; color: #374151; border: 1px solid #e5e7eb; }
.btn-full { width: 100%; justify-content: center; }
.btn-sm { padding: 4px 10px; font-size: 12px; }
.btn:disabled { opacity: 0.6; cursor: not-allowed; }
.badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
.badge-yellow { background: #fef9c3; color: #a16207; }
.badge-blue { background: #dbeafe; color: #1d4ed8; }
.badge-orange { background: #ffedd5; color: #c2410c; }
.badge-green { background: #dcfce7; color: #15803d; }
.badge-gray { background: #f3f4f6; color: #6b7280; }
.timeline { display: flex; flex-direction: column; gap: 0; }
.timeline-item { display: flex; align-items: center; gap: 12px; padding: 10px 0; position: relative; }
.timeline-item:not(:last-child)::after { content: ''; position: absolute; left: 7px; top: 28px; width: 2px; height: calc(100% - 8px); background: #e5e7eb; }
.timeline-dot { width: 16px; height: 16px; border-radius: 50%; border: 2px solid #e5e7eb; background: #fff; flex-shrink: 0; z-index: 1; }
.timeline-item.done .timeline-dot { background: #16a34a; border-color: #16a34a; }
.timeline-item.active .timeline-dot { background: #2563eb; border-color: #2563eb; }
.timeline-item.active .timeline-label { font-weight: 700; color: #2563eb; }
.timeline-item.cancelled .timeline-dot { background: #dc2626; border-color: #dc2626; }
.timeline-label { font-size: 13px; color: #374151; }
.loading { text-align: center; padding: 60px; color: #6b7280; }
.error-box { background: #fee2e2; color: #b91c1c; padding: 12px 16px; border-radius: 8px; font-size: 13px; }
.success-box { background: #dcfce7; color: #15803d; padding: 12px 16px; border-radius: 8px; font-size: 13px; margin-top: 8px; }
.paid-badge { text-align: center; padding: 12px; background: #dcfce7; color: #15803d; border-radius: 8px; font-weight: 600; font-size: 14px; }

.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 24px;
}
.modal-box {
  background: #fff; border-radius: 12px; width: 100%; max-width: 760px;
  max-height: 90vh; display: flex; flex-direction: column; overflow: hidden;
}
.modal-toolbar {
  display: flex; justify-content: space-between; align-items: center;
  padding: 14px 20px; border-bottom: 1px solid #e5e7eb; background: #f9fafb;
}
.modal-title { font-weight: 700; font-size: 15px; }
.modal-actions { display: flex; align-items: center; gap: 8px; }
.modal-close { background: none; border: none; font-size: 22px; cursor: pointer; color: #6b7280; line-height: 1; padding: 0 4px; }
.modal-scroll { overflow-y: auto; padding: 24px; background: #f3f4f6; }

.invoice-paper { background: #fff; padding: 32px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.invoice-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
.invoice-company { margin: 0; font-size: 20px; color: #111827; }
.invoice-sub { margin: 2px 0 0; font-size: 12px; color: #6b7280; }
.invoice-meta { text-align: right; font-size: 12px; color: #374151; }
.invoice-meta h3 { margin: 0 0 4px; font-size: 15px; color: #111827; }
.invoice-paper hr { border: none; border-top: 1px solid #e5e7eb; margin: 12px 0; }
.invoice-info-row { display: flex; gap: 24px; margin-bottom: 16px; }
.invoice-info-label { font-size: 11px; color: #6b7280; }
.invoice-info-value { font-weight: 600; font-size: 13px; color: #111827; }
.invoice-table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 16px; }
.invoice-table th { background: #f9fafb; padding: 8px 10px; text-align: left; font-size: 11px; color: #6b7280; border-bottom: 1px solid #e5e7eb; }
.invoice-table td { padding: 8px 10px; border-bottom: 1px solid #f3f4f6; }
.text-center { text-align: center; }
.text-right { text-align: right; }
.invoice-summary { margin-left: auto; width: 280px; display: flex; flex-direction: column; gap: 6px; }
.invoice-summary-row { display: flex; justify-content: space-between; font-size: 13px; color: #374151; }
.invoice-summary-row.total { font-weight: 700; font-size: 15px; border-top: 1px solid #e5e7eb; padding-top: 8px; color: #111827; }
.invoice-summary-row.danger { color: #dc2626; font-weight: 600; }
.invoice-summary-row.success { color: #16a34a; font-weight: 600; }
.invoice-footer { text-align: center; margin-top: 24px; font-size: 12px; color: #6b7280; }
.invoice-printed-at { font-size: 10px; color: #9ca3af; }
</style>