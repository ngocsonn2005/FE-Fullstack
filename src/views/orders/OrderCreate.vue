<template>
  <div class="order-create">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>🛒 Tạo đơn hàng mới</h1>
      <router-link to="/orders" class="btn btn-secondary">← Quay lại</router-link>
    </div>

    <div class="row">
      <!-- Thông tin đơn hàng -->
      <div class="col-md-5">
        <div class="card mb-4">
          <div class="card-header bg-primary text-white">
            <h5 class="mb-0">👤 Thông tin khách hàng</h5>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <label class="form-label">Chọn khách hàng</label>
              <select class="form-select" v-model="orderData.customerId" required>
                <option value="">-- Chọn khách hàng --</option>
                <option v-for="customer in customers" :key="customer.id" :value="customer.id">
                  {{ customer.name }} - {{ customer.phone }}
                </option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Giảm giá (%)</label>
              <input type="number" class="form-control" v-model="orderData.discountPercent" min="0" max="100">
            </div>
            <div class="mb-3">
              <label class="form-label">Thanh toán trước</label>
              <input type="number" class="form-control" v-model="orderData.paidAmount" min="0">
            </div>
          </div>
        </div>

        <!-- Tóm tắt đơn hàng -->
        <div class="card">
          <div class="card-header bg-success text-white">
            <h5 class="mb-0">💰 Tóm tắt đơn hàng</h5>
          </div>
          <div class="card-body">
            <table class="table table-borderless">
              <tbody>  <!-- ✅ THÊM DÒNG NÀY -->
                <tr>
                  <th>Tổng tiền hàng:</th>
                  <td class="text-end">{{ formatCurrency(subtotal) }}</td>
                </tr>
                <tr>
                  <th>Giảm giá ({{ orderData.discountPercent }}%):</th>
                  <td class="text-end text-danger">-{{ formatCurrency(discountAmount) }}</td>
                </tr>
                <tr class="fw-bold">
                  <th>Tổng cộng:</th>
                  <td class="text-end text-primary">{{ formatCurrency(totalAmount) }}</td>
                </tr>
                <tr>
                  <th>Đã thanh toán:</th>
                  <td class="text-end text-success">{{ formatCurrency(orderData.paidAmount) }}</td>
                </tr>
                <tr class="fw-bold">
                  <th>Công nợ:</th>
                  <td class="text-end" :class="debtAmount > 0 ? 'text-danger' : 'text-success'">
                    {{ formatCurrency(debtAmount) }}
                  </td>
                </tr>
              </tbody>  <!-- ✅ THÊM DÒNG NÀY -->
            </table>
          </div>
        </div>
      </div>

      <!-- Danh sách sản phẩm -->
      <div class="col-md-7">
        <div class="card">
          <div class="card-header bg-info text-white">
            <h5 class="mb-0">📦 Sản phẩm</h5>
          </div>
          <div class="card-body">
            <!-- Thêm sản phẩm -->
            <div class="row g-2 mb-3">
              <div class="col-md-5">
                <select class="form-select" v-model="newItem.productId">
                  <option value="">-- Chọn sản phẩm --</option>
                  <option v-for="product in products" :key="product.id" :value="product.id">
                    {{ product.name }} - {{ formatCurrency(product.price) }}
                  </option>
                </select>
              </div>
              <div class="col-md-3">
                <input type="number" class="form-control" v-model="newItem.quantity" placeholder="Số lượng" min="1">
              </div>
              <div class="col-md-2">
                <input type="number" class="form-control" v-model="newItem.price" placeholder="Đơn giá" min="0">
              </div>
              <div class="col-md-2">
                <button class="btn btn-primary w-100" @click="addItem">+ Thêm</button>
              </div>
            </div>

            <!-- Bảng sản phẩm đã chọn -->
            <div class="table-responsive">
              <table class="table table-sm table-hover">
                <thead class="table-light">
                  <tr><th>Sản phẩm</th><th>Số lượng</th><th>Đơn giá</th><th>Thành tiền</th><th></th></tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in orderData.items" :key="index">
                    <td>{{ getProductName(item.productId) }}</td>
                    <td>{{ item.quantity }}</td>
                    <td>{{ formatCurrency(item.price) }}</td>
                    <td class="fw-bold">{{ formatCurrency(item.price * item.quantity) }}</td>
                    <td><button class="btn btn-sm btn-danger" @click="removeItem(index)">✖</button></td>
                  </tr>
                  <tr v-if="orderData.items.length === 0">
                    <td colspan="5" class="text-center text-muted py-3">Chưa có sản phẩm nào</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Nút tạo đơn hàng -->
            <div class="mt-4">
              <button class="btn btn-success btn-lg w-100" @click="createOrder" :disabled="loading">
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                ✅ Hoàn tất đơn hàng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { userApi, orderApi, productApi } from '@/api/axios';

const router = useRouter();
const loading = ref(false);

// Dữ liệu
const customers = ref([]);
const products = ref([]);
const orderData = ref({
  customerId: '',
  discountPercent: 0,
  paidAmount: 0,
  items: []
});

const newItem = ref({
  productId: '',
  quantity: 1,
  price: 0
});

// Computed
const subtotal = computed(() => {
  return orderData.value.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
});

const discountAmount = computed(() => {
  return subtotal.value * orderData.value.discountPercent / 100;
});

const totalAmount = computed(() => {
  return subtotal.value - discountAmount;
});

const debtAmount = computed(() => {
  const debt = totalAmount.value - orderData.value.paidAmount;
  return debt < 0 ? 0 : debt;
});

// Methods
onMounted(async () => {
  await loadCustomers();
  await loadProducts();
});

async function loadCustomers() {
  try {
    const res = await orderApi.get('/customers');
    customers.value = res.data;
  } catch (error) {
    console.error('Error loading customers:', error);
    customers.value = [{ id: 1, name: 'Khách lẻ', phone: '0123456789' }];
  }
}

async function loadProducts() {
  try {
    const res = await productApi.get('/products');
    products.value = res.data;
  } catch (error) {
    console.error('Error loading products:', error);
    products.value = [
      { id: 1, name: 'iPhone 15', price: 25000000 },
      { id: 2, name: 'Samsung S24', price: 22000000 },
      { id: 3, name: 'Laptop Dell', price: 18000000 }
    ];
  }
}

function getProductName(productId) {
  const product = products.value.find(p => p.id === productId);
  return product?.name || `SP-${productId}`;
}

function addItem() {
  if (!newItem.value.productId || newItem.value.quantity <= 0 || newItem.value.price <= 0) {
    alert('Vui lòng nhập đầy đủ thông tin sản phẩm!');
    return;
  }
  checkStockAndAdd();
}

async function checkStockAndAdd() {
  try {
    const checkResult = await productApi.post('/inventory/check', {
      productId: newItem.value.productId,
      quantity: newItem.value.quantity
    });
    
    if (checkResult.data.inStock) {
      addItemToOrder();
    } else {
      alert(`Sản phẩm ${getProductName(newItem.value.productId)} không đủ hàng!`);
    }
  } catch (error) {
    console.warn('Product Service not available, skipping stock check');
    addItemToOrder();
  }
}

function addItemToOrder() {
  orderData.value.items.push({
    productId: newItem.value.productId,
    quantity: newItem.value.quantity,
    price: newItem.value.price
  });
  
  newItem.value = { productId: '', quantity: 1, price: 0 };
}

function removeItem(index) {
  orderData.value.items.splice(index, 1);
}

async function createOrder() {
  if (!orderData.value.customerId) {
    alert('Vui lòng chọn khách hàng!');
    return;
  }
  
  if (orderData.value.items.length === 0) {
    alert('Vui lòng thêm sản phẩm!');
    return;
  }
  
  loading.value = true;
  
  try {
    const payload = {
      customerId: orderData.value.customerId,
      paidAmount: orderData.value.paidAmount,
      discountPercent: orderData.value.discountPercent,
      items: orderData.value.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      }))
    };
    
    console.log('Sending order:', payload);
    
    const response = await orderApi.post('/orders', payload);
    
    console.log('Order created:', response.data);
    
    alert('✅ Tạo đơn hàng thành công!');
    router.push('/orders');
  } catch (error) {
    console.error('Error creating order:', error);
    alert(`Lỗi: ${error.response?.data || 'Không thể tạo đơn hàng!'}`);
  } finally {
    loading.value = false;
  }
}

function formatCurrency(value) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);
}
</script>

<style scoped>
.order-create { padding: 20px; }
.card { border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); margin-bottom: 20px; }
.card-header { border-radius: 12px 12px 0 0; }
.btn-lg { padding: 12px; font-size: 16px; }
</style>