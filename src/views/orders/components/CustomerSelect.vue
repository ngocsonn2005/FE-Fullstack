<template>
  <div class="customer-select">
    <label class="form-label fw-bold">👤 Khách hàng</label>
    <div class="input-group">
      <select class="form-select" v-model="selectedCustomerId" @change="onCustomerChange">
        <option value="">-- Chọn khách hàng --</option>
        <option v-for="customer in customers" :key="customer.id" :value="customer.id">
          {{ customer.name }} - {{ customer.phone }}
        </option>
      </select>
      <button class="btn btn-outline-primary" type="button" @click="openAddCustomerModal">
        <i class="bi bi-plus-circle"></i> +
      </button>
    </div>

    <!-- Hiển thị thông tin khách hàng đã chọn -->
    <div v-if="selectedCustomer" class="customer-info mt-2 p-2 bg-light rounded">
      <div class="row">
        <div class="col-6"><small>Tên: <strong>{{ selectedCustomer.name }}</strong></small></div>
        <div class="col-6"><small>SĐT: {{ selectedCustomer.phone }}</small></div>
        <div class="col-12 mt-1"><small class="text-danger">Công nợ: {{ formatCurrency(selectedCustomer.debt) }}</small></div>
      </div>
    </div>

    <!-- Modal thêm khách hàng -->
    <div class="modal" :class="{ show: showAddModal }" v-if="showAddModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title">➕ Thêm khách hàng mới</h5>
            <button class="btn-close btn-close-white" @click="showAddModal = false"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label>Tên khách hàng *</label>
              <input type="text" class="form-control" v-model="newCustomer.name">
            </div>
            <div class="mb-3">
              <label>Số điện thoại</label>
              <input type="tel" class="form-control" v-model="newCustomer.phone">
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="showAddModal = false">Hủy</button>
            <button class="btn btn-primary" @click="addCustomer" :disabled="saving">Lưu</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { orderApi } from '@/api/axios';

const props = defineProps({
  modelValue: { type: Number, default: null }
});

const emit = defineEmits(['update:modelValue', 'change']);

const customers = ref([]);
const selectedCustomerId = ref(props.modelValue);
const selectedCustomer = ref(null);
const showAddModal = ref(false);
const saving = ref(false);
const newCustomer = ref({ name: '', phone: '' });

onMounted(() => {
  loadCustomers();
});

watch(() => props.modelValue, (val) => {
  selectedCustomerId.value = val;
  if (val) {
    selectedCustomer.value = customers.value.find(c => c.id === val);
  }
});

async function loadCustomers() {
  try {
    const res = await orderApi.get('/customers');
    customers.value = res.data;
  } catch (error) {
    console.error('Error loading customers:', error);
  }
}

function onCustomerChange() {
  selectedCustomer.value = customers.value.find(c => c.id === selectedCustomerId.value);
  emit('update:modelValue', selectedCustomerId.value);
  emit('change', selectedCustomer.value);
}

async function addCustomer() {
  if (!newCustomer.value.name) {
    alert('Vui lòng nhập tên khách hàng!');
    return;
  }
  
  saving.value = true;
  try {
    const res = await orderApi.post('/customers', newCustomer.value);
    customers.value.push(res.data);
    selectedCustomerId.value = res.data.id;
    onCustomerChange();
    showAddModal.value = false;
    newCustomer.value = { name: '', phone: '' };
    alert('Thêm khách hàng thành công!');
  } catch (error) {
    alert('Thêm thất bại!');
  } finally {
    saving.value = false;
  }
}

function formatCurrency(value) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);
}

function openAddCustomerModal() {
  showAddModal.value = true;
}
</script>

<style scoped>
.customer-info { font-size: 13px; }
.modal.show { display: block; background: rgba(0,0,0,0.5); }
</style>