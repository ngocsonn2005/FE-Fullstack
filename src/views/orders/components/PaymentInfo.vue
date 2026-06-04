<template>
  <div class="payment-info">
    <div class="card">
      <div class="card-header bg-success text-white">
        <h5 class="mb-0">💰 Thông tin thanh toán</h5>
      </div>
      <div class="card-body">
        <div class="mb-3">
          <label class="form-label">Giảm giá (%)</label>
          <input type="number" class="form-control" v-model="localDiscountPercent" min="0" max="100" @input="updateValue">
          <small class="text-muted">Nhập phần trăm giảm giá</small>
        </div>
        
        <div class="mb-3">
          <label class="form-label">Thanh toán trước</label>
          <input type="number" class="form-control" v-model="localPaidAmount" min="0" @input="updateValue">
        </div>

        <hr>

        <div class="payment-summary">
          <div class="d-flex justify-content-between mb-2">
            <span>Tổng tiền hàng:</span>
            <span class="fw-bold">{{ formatCurrency(subtotal) }}</span>
          </div>
          <div class="d-flex justify-content-between mb-2 text-danger">
            <span>Giảm giá ({{ localDiscountPercent }}%):</span>
            <span>- {{ formatCurrency(discountAmount) }}</span>
          </div>
          <div class="d-flex justify-content-between mb-2 fw-bold">
            <span>Tổng cộng:</span>
            <span class="text-primary">{{ formatCurrency(totalAmount) }}</span>
          </div>
          <div class="d-flex justify-content-between mb-2 text-success">
            <span>Đã thanh toán:</span>
            <span>{{ formatCurrency(localPaidAmount) }}</span>
          </div>
          <div class="d-flex justify-content-between fw-bold">
            <span>Công nợ:</span>
            <span :class="debtAmount > 0 ? 'text-danger' : 'text-success'">
              {{ formatCurrency(debtAmount) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  subtotal: { type: Number, default: 0 },
  discountPercent: { type: Number, default: 0 },
  paidAmount: { type: Number, default: 0 }
});

const emit = defineEmits(['update:discountPercent', 'update:paidAmount']);

const localDiscountPercent = ref(props.discountPercent);
const localPaidAmount = ref(props.paidAmount);

watch(() => props.discountPercent, (val) => {
  localDiscountPercent.value = val;
});

watch(() => props.paidAmount, (val) => {
  localPaidAmount.value = val;
});

const discountAmount = computed(() => {
  return props.subtotal * localDiscountPercent.value / 100;
});

const totalAmount = computed(() => {
  return props.subtotal - discountAmount.value;
});

const debtAmount = computed(() => {
  const debt = totalAmount.value - localPaidAmount.value;
  return debt < 0 ? 0 : debt;
});

function updateValue() {
  emit('update:discountPercent', localDiscountPercent.value);
  emit('update:paidAmount', localPaidAmount.value);
}

function formatCurrency(value) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);
}
</script>

<style scoped>
.payment-summary {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
}
</style><template>
  <div class="payment-info">
    <div class="card">
      <div class="card-header bg-success text-white">
        <h5 class="mb-0">💰 Thông tin thanh toán</h5>
      </div>
      <div class="card-body">
        <div class="mb-3">
          <label class="form-label">Giảm giá (%)</label>
          <input type="number" class="form-control" v-model="localDiscountPercent" min="0" max="100" @input="updateValue">
          <small class="text-muted">Nhập phần trăm giảm giá</small>
        </div>
        
        <div class="mb-3">
          <label class="form-label">Thanh toán trước</label>
          <input type="number" class="form-control" v-model="localPaidAmount" min="0" @input="updateValue">
        </div>

        <hr>

        <div class="payment-summary">
          <div class="d-flex justify-content-between mb-2">
            <span>Tổng tiền hàng:</span>
            <span class="fw-bold">{{ formatCurrency(subtotal) }}</span>
          </div>
          <div class="d-flex justify-content-between mb-2 text-danger">
            <span>Giảm giá ({{ localDiscountPercent }}%):</span>
            <span>- {{ formatCurrency(discountAmount) }}</span>
          </div>
          <div class="d-flex justify-content-between mb-2 fw-bold">
            <span>Tổng cộng:</span>
            <span class="text-primary">{{ formatCurrency(totalAmount) }}</span>
          </div>
          <div class="d-flex justify-content-between mb-2 text-success">
            <span>Đã thanh toán:</span>
            <span>{{ formatCurrency(localPaidAmount) }}</span>
          </div>
          <div class="d-flex justify-content-between fw-bold">
            <span>Công nợ:</span>
            <span :class="debtAmount > 0 ? 'text-danger' : 'text-success'">
              {{ formatCurrency(debtAmount) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  subtotal: { type: Number, default: 0 },
  discountPercent: { type: Number, default: 0 },
  paidAmount: { type: Number, default: 0 }
});

const emit = defineEmits(['update:discountPercent', 'update:paidAmount']);

const localDiscountPercent = ref(props.discountPercent);
const localPaidAmount = ref(props.paidAmount);

watch(() => props.discountPercent, (val) => {
  localDiscountPercent.value = val;
});

watch(() => props.paidAmount, (val) => {
  localPaidAmount.value = val;
});

const discountAmount = computed(() => {
  return props.subtotal * localDiscountPercent.value / 100;
});

const totalAmount = computed(() => {
  return props.subtotal - discountAmount.value;
});

const debtAmount = computed(() => {
  const debt = totalAmount.value - localPaidAmount.value;
  return debt < 0 ? 0 : debt;
});

function updateValue() {
  emit('update:discountPercent', localDiscountPercent.value);
  emit('update:paidAmount', localPaidAmount.value);
}

function formatCurrency(value) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);
}
</script>

<style scoped>
.payment-summary {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
}
</style>