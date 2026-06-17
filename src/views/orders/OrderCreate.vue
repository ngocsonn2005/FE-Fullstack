// OrderCreate.vue
<template>
  <div class="order-create">
    <div class="page-header">
      <div>
        <router-link to="/app/orders" class="back-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Quay lại danh sách
        </router-link>
        <h2>Tạo đơn bán hàng mới</h2>
      </div>
    </div>

    <div class="form-card">
      <div class="section">
        <h3>Thông tin khách hàng</h3>
        <div class="form-row">
          <div class="form-group">
            <label>Khách hàng <span class="required">*</span></label>
            <select v-model="form.customerId" @change="onCustomerChange">
              <option value="">-- Chọn khách hàng --</option>
              <option v-for="p in customers" :key="p.id" :value="p.id">
                {{ p.name }} {{ p.phone ? '— ' + p.phone : '' }}
              </option>
            </select>
            <small v-if="selectedCustomer" class="partner-info">
              <span class="info-icon">📞</span> {{ selectedCustomer.phone }} | {{ selectedCustomer.email }}
            </small>
          </div>
          <div class="form-group">
            <label>Ngày giao hàng</label>
            <input type="date" v-model="form.deliveryDate" :min="today" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Giảm giá (%)</label>
            <input type="number" v-model.number="form.discountPercent" min="0" max="100" />
          </div>
          <div class="form-group">
            <label>Số tiền đã trả (đ)</label>
            <input type="number" v-model.number="form.paidAmount" min="0" />
          </div>
        </div>
        <div class="form-group">
          <label>Ghi chú</label>
          <textarea v-model="form.note" rows="2" placeholder="Ghi chú thêm..." />
        </div>
      </div>

      <div class="section">
        <div class="section-header">
          <h3>Danh sách sản phẩm</h3>
          <button type="button" @click="addItem" class="btn btn-outline btn-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Thêm sản phẩm
          </button>
        </div>

        <div class="items-table">
          <div class="items-header">
            <span>Tên sản phẩm</span>
            <span>Số lượng</span>
            <span>Đơn giá (đ)</span>
            <span>Thành tiền</span>
            <span></span>
          </div>
          <div v-for="(item, index) in form.items" :key="index" class="item-row">
            <input v-model="item.productName" type="text" placeholder="Tên sản phẩm" />
            <input v-model.number="item.quantity" type="number" min="1" />
            <input v-model.number="item.unitPrice" type="number" min="0" />
            <span class="subtotal">{{ formatMoney(item.quantity * item.unitPrice) }}</span>
            <button type="button" @click="removeItem(index)" class="remove-btn" :disabled="form.items.length === 1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="summary-box">
          <div class="summary-row">
            <span>Tạm tính:</span>
            <span>{{ formatMoney(subtotal) }}</span>
          </div>
          <div class="summary-row" v-if="form.discountPercent > 0">
            <span>Giảm giá ({{ form.discountPercent }}%):</span>
            <span class="danger">- {{ formatMoney(discountAmount) }}</span>
          </div>
          <div class="summary-row total">
            <span>Tổng cộng:</span>
            <span class="total-amount">{{ formatMoney(totalAmount) }}</span>
          </div>
          <div class="summary-row" v-if="form.paidAmount > 0">
            <span>Đã trả:</span>
            <span class="success">{{ formatMoney(form.paidAmount) }}</span>
          </div>
          <div class="summary-row" v-if="debtAmount > 0">
            <span>Còn nợ:</span>
            <span class="danger">{{ formatMoney(debtAmount) }}</span>
          </div>
        </div>
      </div>

      <div v-if="error" class="error-box">{{ error }}</div>

      <div class="form-actions">
        <router-link to="/app/orders" class="btn btn-outline">Hủy</router-link>
        <button type="button" @click="submit" :disabled="loading" class="btn btn-primary">
          <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
          <template v-else>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </template>
          Tạo đơn hàng
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { orderApi } from '@/api/axios.js';

const router = useRouter();
const customers = ref([]);
const selectedCustomer = ref(null);
const loading = ref(false);
const error = ref('');

const today = new Date().toISOString().split('T')[0];

const form = ref({
  customerId: '',
  deliveryDate: '',
  note: '',
  discountPercent: 0,
  paidAmount: 0,
  items: [{ productName: '', quantity: 1, unitPrice: 0 }]
});

const subtotal = computed(() =>
  form.value.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
);
const discountAmount = computed(() => subtotal.value * form.value.discountPercent / 100);
const totalAmount = computed(() => subtotal.value - discountAmount.value);
const debtAmount = computed(() => Math.max(0, totalAmount.value - form.value.paidAmount));

const fetchCustomers = async () => {
  try {
    const res = await orderApi.get('/customers');
    customers.value = Array.isArray(res.data) ? res.data : (res.data.data || []);
  } catch (e) {
    error.value = 'Không tải được danh sách khách hàng';
  }
};

const onCustomerChange = () => {
  selectedCustomer.value = customers.value.find(p => p.id == form.value.customerId) || null;
};

const addItem = () => {
  form.value.items.push({ productName: '', quantity: 1, unitPrice: 0 });
};

const removeItem = (index) => {
  if (form.value.items.length > 1) form.value.items.splice(index, 1);
};

const submit = async () => {
  error.value = '';

  if (!form.value.customerId) {
    error.value = 'Vui lòng chọn khách hàng';
    return;
  }

  const validItems = form.value.items.filter(i => i.productName && i.quantity > 0 && i.unitPrice > 0);
  if (!validItems.length) {
    error.value = 'Vui lòng thêm ít nhất một sản phẩm hợp lệ';
    return;
  }

  loading.value = true;
  try {
    const payload = {
      customerId: Number(form.value.customerId),
      partnerId: Number(form.value.customerId),
      paidAmount: form.value.paidAmount,
      discountPercent: form.value.discountPercent,
      items: validItems.map((item, index) => ({
        productId: index + 1,
        productName: item.productName,
        quantity: item.quantity,
        price: item.unitPrice,
        unitPrice: item.unitPrice
      }))
    };

    const res = await orderApi.post('/orders', payload);
    const order = res.data;
    alert('Tạo đơn thành công! Mã đơn: #' + (order.id || ''));
    router.push('/app/orders');
  } catch (e) {
    error.value = e.response?.data?.message || e.message;
  } finally {
    loading.value = false;
  }
};

const formatMoney = (n) => Number(n || 0).toLocaleString('vi-VN') + ' đ';

onMounted(fetchCustomers);
</script>

<style scoped>
.order-create { padding: 24px; }
.page-header { margin-bottom: 20px; }
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
.form-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 24px; display: flex; flex-direction: column; gap: 24px; }
.section { border: 1px solid #f3f4f6; border-radius: 8px; padding: 20px; }
.section h3 { margin: 0 0 16px; font-size: 14px; font-weight: 600; color: #111827; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.section-header h3 { margin: 0; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 12px; }
.form-group { display: flex; flex-direction: column; gap: 4px; margin-bottom: 12px; }
label { font-size: 12px; font-weight: 600; color: #6b7280; }
.required { color: #dc2626; }
input, select, textarea { padding: 8px 10px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 13px; }
.partner-info { color: #6b7280; font-size: 12px; }
.items-table { display: flex; flex-direction: column; gap: 6px; }
.items-header { display: grid; grid-template-columns: 3fr 1fr 2fr 2fr 40px; gap: 8px; padding: 6px 0; font-size: 11px; font-weight: 600; color: #6b7280; }
.item-row { display: grid; grid-template-columns: 3fr 1fr 2fr 2fr 40px; gap: 8px; align-items: center; }
.subtotal { font-weight: 600; font-size: 13px; }
.remove-btn { 
  background: #fee2e2; 
  color: #dc2626; 
  border: none; 
  border-radius: 4px; 
  cursor: pointer; 
  width: 32px; 
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.remove-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.summary-box { margin-top: 16px; background: #f9fafb; border-radius: 8px; padding: 14px 16px; display: flex; flex-direction: column; gap: 8px; }
.summary-row { display: flex; justify-content: space-between; font-size: 13px; }
.summary-row.total { border-top: 1px solid #e5e7eb; padding-top: 10px; font-weight: 700; font-size: 15px; }
.total-amount { color: #2563eb; }
.success { color: #16a34a; }
.danger { color: #dc2626; }
.form-actions { display: flex; justify-content: flex-end; gap: 12px; }
.btn { 
  padding: 8px 18px; 
  border-radius: 6px; 
  border: none; 
  cursor: pointer; 
  font-size: 13px; 
  font-weight: 600; 
  text-decoration: none; 
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.btn-primary { background: #2563eb; color: #fff; }
.btn-outline { background: #fff; color: #374151; border: 1px solid #e5e7eb; }
.btn-sm { padding: 5px 12px; font-size: 12px; }
.btn:disabled { opacity: 0.6; cursor: not-allowed; }
.error-box { background: #fee2e2; color: #b91c1c; padding: 12px 16px; border-radius: 8px; font-size: 13px; }
.spinner-border { width: 1rem; height: 1rem; }
</style>