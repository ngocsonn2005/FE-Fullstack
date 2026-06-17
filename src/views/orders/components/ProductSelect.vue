// ProductSelect.vue
<template>
  <div class="product-select">
    <div class="row g-2">
      <div class="col-md-5">
        <select class="form-select" v-model="selectedProductId">
          <option value="">-- Chọn sản phẩm --</option>
          <option v-for="product in products" :key="product.id" :value="product.id">
            {{ product.name }} - {{ formatCurrency(product.price) }}
          </option>
        </select>
      </div>
      <div class="col-md-3">
        <input type="number" class="form-control" v-model="quantity" placeholder="Số lượng" min="1">
      </div>
      <div class="col-md-2">
        <input type="number" class="form-control" v-model="price" placeholder="Đơn giá" min="0" step="1000">
      </div>
      <div class="col-md-2">
        <button class="btn btn-primary w-100" @click="addProduct" :disabled="!canAdd">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Thêm
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { productApi } from '@/api/axios';

const emit = defineEmits(['add']);

const products = ref([]);
const selectedProductId = ref('');
const quantity = ref(1);
const price = ref(0);

const canAdd = computed(() => {
  return selectedProductId.value && quantity.value > 0 && price.value > 0;
});

onMounted(() => {
  loadProducts();
});

async function loadProducts() {
  try {
    const res = await productApi.get('/products');
    products.value = res.data;
  } catch (error) {
    console.error('Error loading products:', error);
    products.value = [
      { id: 1, name: 'iPhone 15', price: 25000000 },
      { id: 2, name: 'Samsung S24', price: 22000000 },
      { id: 3, name: 'Laptop Dell', price: 18000000 },
      { id: 4, name: 'Tai nghe Sony', price: 3500000 },
      { id: 5, name: 'iPad Pro', price: 15000000 }
    ];
  }
}

function addProduct() {
  const product = products.value.find(p => p.id === selectedProductId.value);
  emit('add', {
    productId: selectedProductId.value,
    productName: product?.name,
    quantity: quantity.value,
    price: price.value || product?.price || 0
  });
  
  selectedProductId.value = '';
  quantity.value = 1;
  price.value = 0;
}

function formatCurrency(value) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);
}
</script>

<style scoped>
.product-select {
  margin-bottom: 16px;
}

.btn-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
</style>