<template>
  <div style="padding: 24px">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px">
      <h2>Quản lý sản phẩm</h2>
      <a-button type="primary" @click="showAddModal = true">Thêm sản phẩm</a-button>
    </div>

    <div style="display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap">
      <a-input v-model:value="search" placeholder="Tìm kiếm sản phẩm..." allow-clear
        @pressEnter="loadProducts" @input="loadProducts" style="flex:1;min-width:220px" />
      <a-select v-model:value="filterCategory" :options="categoryOptions"
        placeholder="Tất cả danh mục" @change="loadProducts" style="width:220px" />
    </div>

    <div v-if="error" style="background:#ffebee;color:#c62828;padding:12px;border-radius:6px;margin-bottom:16px">
      {{ error }}
    </div>

    <div style="background:white;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);overflow:hidden;padding:16px">
      <a-table :columns="columns" :data-source="products"
        :loading="{ spinning: loading, tip: 'Đang tải...' }"
        row-key="id" :pagination="{ pageSize: 8 }"
        :locale="{ emptyText: 'Không có sản phẩm nào' }" bordered>
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'imageUrl'">
            <div style="display:flex;justify-content:center">
              <img v-if="record.imageUrl" :src="record.imageUrl"
                style="width:48px;height:48px;object-fit:cover;border-radius:6px;border:1px solid #eee" />
              <div v-else style="width:48px;height:48px;background:#f5f5f5;border-radius:6px;display:flex;align-items:center;justify-content:center;border:1px solid #eee">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#bbb" stroke-width="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5" fill="#bbb"/>
                  <path d="M21 15l-5-5-4 4-3-3-6 6" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>
          </template>
          <template v-else-if="column.dataIndex === 'code'">
            <span style="font-weight:bold;color:#1976d2">{{ record.code }}</span>
          </template>
          <template v-else-if="column.dataIndex === 'unit'">
            <a-tag color="blue">{{ record.unit || 'Cái' }}</a-tag>
          </template>
          <template v-else-if="column.dataIndex === 'costPrice'">{{ formatPrice(record.costPrice) }}</template>
          <template v-else-if="column.dataIndex === 'salePrice'">{{ formatPrice(record.salePrice) }}</template>
          <template v-else-if="column.dataIndex === 'isActive'">
            <a-tag :color="record.isActive ? 'success' : 'error'">
              {{ record.isActive ? 'Hoạt động' : 'Dừng' }}
            </a-tag>
          </template>
          <template v-else-if="column.dataIndex === 'actions'">
            <a-space size="middle">
              <a-button size="small" @click="editProduct(record)">Sửa</a-button>
              <a-button type="primary" danger size="small" @click="deleteProduct(record)">Xóa</a-button>
            </a-space>
          </template>
          <template v-else>{{ record[column.dataIndex] }}</template>
        </template>
      </a-table>
    </div>

    <!-- Modal Thêm / Sửa -->
    <div v-if="showAddModal"
      style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:1000">
      <div style="background:white;border-radius:12px;padding:32px;width:600px;max-height:92vh;overflow-y:auto">
        <h3 style="margin:0 0 24px">{{ editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới' }}</h3>

        <!-- Mã + Danh mục -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
          <div>
            <label style="display:block;margin-bottom:4px;font-weight:500">Mã sản phẩm *</label>
            <input v-model="form.code" placeholder="VD: SP001"
              @input="form.code = form.code.toUpperCase()"
              style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;box-sizing:border-box;text-transform:uppercase" />
            <span style="font-size:11px;color:#999;display:block;margin-top:2px">Mã sẽ tự động viết hoa</span>
          </div>
          <div>
            <label style="display:block;margin-bottom:4px;font-weight:500">Danh mục *</label>
            <select v-model="form.categoryId"
              style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;box-sizing:border-box">
              <option value="">Chọn danh mục</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
          </div>
        </div>

        <!-- Tên + Đơn vị tính -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px">
          <div>
            <label style="display:block;margin-bottom:4px;font-weight:500">Tên sản phẩm *</label>
            <input v-model="form.name" placeholder="Nhập tên sản phẩm"
              style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;box-sizing:border-box" />
          </div>
          <div>
            <label style="display:block;margin-bottom:4px;font-weight:500">Đơn vị tính *</label>
            <select v-model="form.unit"
              style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;box-sizing:border-box">
              <option v-for="u in units" :key="u" :value="u">{{ u }}</option>
            </select>
            <span style="font-size:11px;color:#999;display:block;margin-top:2px">
              VD: Laptop → Cái, Gạo → Kg, Nước → Lít
            </span>
          </div>
        </div>

        <!-- Giá -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px">
          <div>
            <label style="display:block;margin-bottom:4px;font-weight:500">Giá nhập (VNĐ) *</label>
            <input v-model="form.costPrice" type="number"
              style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;box-sizing:border-box" />
            <span style="font-size:12px;color:#666;display:block;margin-top:2px">= {{ formatPrice(form.costPrice) }}</span>
          </div>
          <div>
            <label style="display:block;margin-bottom:4px;font-weight:500">Giá bán (VNĐ) *</label>
            <input v-model="form.salePrice" type="number"
              style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;box-sizing:border-box" />
            <span style="font-size:12px;color:#2e7d32;font-weight:500;display:block;margin-top:2px">= {{ formatPrice(form.salePrice) }}</span>
          </div>
        </div>

        <!-- Ngưỡng -->
        <div style="margin-top:16px">
          <label style="display:block;margin-bottom:4px;font-weight:500">Ngưỡng cảnh báo tồn kho</label>
          <input v-model="form.minStockThreshold" type="number"
            style="width:200px;padding:8px;border:1px solid #ddd;border-radius:6px;box-sizing:border-box" />
        </div>

        <!-- Ảnh -->
        <div style="margin-top:20px;border:1px solid #e0e0e0;border-radius:8px;padding:16px;background:#fafafa">
          <label style="display:block;font-weight:500;margin-bottom:12px;font-size:15px">Hình ảnh sản phẩm</label>
          <div style="display:flex;gap:8px;margin-bottom:14px">
            <button @click="imageTab='url'"
              :style="{padding:'6px 14px',border:'none',borderRadius:'6px',cursor:'pointer',fontSize:'13px',background:imageTab==='url'?'#1976d2':'#eee',color:imageTab==='url'?'white':'#333'}">
              Nhập link URL
            </button>
            <button @click="imageTab='upload'"
              :style="{padding:'6px 14px',border:'none',borderRadius:'6px',cursor:'pointer',fontSize:'13px',background:imageTab==='upload'?'#1976d2':'#eee',color:imageTab==='upload'?'white':'#333'}">
              Tải ảnh lên
            </button>
          </div>
          <div v-if="imageTab==='url'">
            <input v-model="form.imageUrl" placeholder="https://example.com/image.jpg"
              @input="previewUrl = form.imageUrl"
              style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;box-sizing:border-box;font-size:13px" />
          </div>
          <div v-if="imageTab==='upload'">
            <div @click="$refs.fileInput.click()" @dragover.prevent @drop.prevent="onFileDrop"
              style="border:2px dashed #1976d2;border-radius:8px;padding:24px;text-align:center;cursor:pointer;background:white">
              <div style="font-size:24px;margin-bottom:8px;color:#1976d2">Tải ảnh</div>
              <div style="color:#1976d2;font-weight:500">Click để chọn ảnh</div>
              <div style="color:#999;font-size:12px;margin-top:4px">hoặc kéo thả ảnh vào đây</div>
              <div style="color:#bbb;font-size:11px;margin-top:4px">JPG, PNG, WEBP – tối đa 5MB</div>
            </div>
            <input ref="fileInput" type="file" accept="image/*" style="display:none" @change="onFileSelect" />
          </div>
          <div v-if="previewUrl" style="margin-top:16px">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
              <span style="font-weight:500;font-size:13px">Xem trước ảnh</span>
              <button @click="clearImage"
                style="background:#f44336;color:white;border:none;padding:4px 10px;border-radius:4px;cursor:pointer;font-size:12px">
                Xóa ảnh
              </button>
            </div>
            <div style="border:1px solid #ddd;border-radius:8px;overflow:hidden;background:#f5f5f5;display:flex;align-items:center;justify-content:center;margin-bottom:14px"
              :style="{height: previewHeight + 'px'}">
              <img :src="previewUrl"
                :style="{width:imgWidth+'px',height:imgHeight+'px',objectFit:imgFit,borderRadius:'4px'}"
                @error="onImgError" />
            </div>
            <div style="background:white;border:1px solid #e0e0e0;border-radius:8px;padding:14px">
              <div style="font-weight:500;font-size:13px;margin-bottom:12px;color:#555">Chỉnh kích cỡ hiển thị</div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                <div>
                  <label style="font-size:12px;color:#666;display:block;margin-bottom:4px">Chiều rộng: <strong>{{ imgWidth }}px</strong></label>
                  <input type="range" v-model="imgWidth" min="50" max="400" step="10" style="width:100%;accent-color:#1976d2" />
                </div>
                <div>
                  <label style="font-size:12px;color:#666;display:block;margin-bottom:4px">Chiều cao: <strong>{{ imgHeight }}px</strong></label>
                  <input type="range" v-model="imgHeight" min="50" max="400" step="10" style="width:100%;accent-color:#1976d2" />
                </div>
              </div>
              <div style="margin-top:12px">
                <label style="font-size:12px;color:#666;display:block;margin-bottom:6px">Kiểu hiển thị</label>
                <div style="display:flex;gap:8px;flex-wrap:wrap">
                  <button v-for="fit in ['cover','contain','fill','scale-down']" :key="fit" @click="imgFit = fit"
                    :style="{padding:'4px 12px',border:'1px solid',borderRadius:'4px',cursor:'pointer',fontSize:'12px',background:imgFit===fit?'#1976d2':'white',color:imgFit===fit?'white':'#555',borderColor:imgFit===fit?'#1976d2':'#ddd'}">
                    {{ fit }}
                  </button>
                </div>
              </div>
              <button @click="resetImageSize"
                style="margin-top:12px;background:#eee;border:none;padding:6px 14px;border-radius:4px;cursor:pointer;font-size:12px;color:#555">
                Đặt lại kích cỡ mặc định
              </button>
            </div>
          </div>
        </div>

        <!-- Mô tả -->
        <div style="margin-top:16px">
          <label style="display:block;margin-bottom:4px;font-weight:500">Mô tả</label>
          <textarea v-model="form.description" rows="3" placeholder="Mô tả sản phẩm..."
            style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;box-sizing:border-box;resize:vertical"></textarea>
        </div>

        <div v-if="formError"
          style="margin-top:12px;background:#ffebee;color:#c62828;padding:10px;border-radius:6px">
          {{ formError }}
        </div>

        <div style="display:flex;gap:12px;margin-top:24px;justify-content:flex-end">
          <button @click="closeModal"
            style="padding:10px 20px;border:1px solid #ddd;border-radius:6px;cursor:pointer;background:white">Hủy</button>
          <button @click="saveProduct" :disabled="saving"
            style="padding:10px 24px;background:#1976d2;color:white;border:none;border-radius:6px;cursor:pointer;font-weight:500">
            {{ saving ? 'Đang lưu...' : (editingProduct ? 'Cập nhật' : 'Thêm mới') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue'
import { productApi } from '../../api/axios.js'

const products = ref([])
const categories = ref([])
const units = ref([])
const loading = ref(false)
const error = ref('')
const search = ref('')
const filterCategory = ref('')
const showAddModal = ref(false)
const editingProduct = ref(null)
const saving = ref(false)
const formError = ref('')

const form = ref({
  code: '', name: '', unit: 'Cái', costPrice: 0, salePrice: 0,
  categoryId: '', imageUrl: '', description: '', minStockThreshold: 10
})

const categoryOptions = computed(() => [
  { label: 'Tất cả danh mục', value: '' },
  ...categories.value.map(cat => ({ label: cat.name, value: cat.id }))
])

const columns = [
  { title: 'Ảnh', dataIndex: 'imageUrl', key: 'imageUrl', width: 80 },
  { title: 'Mã SP', dataIndex: 'code', key: 'code', sorter: (a, b) => (a.code||'').localeCompare(b.code||'') },
  { title: 'Tên sản phẩm', dataIndex: 'name', key: 'name', sorter: (a, b) => (a.name||'').localeCompare(b.name||'') },
  { title: 'Đơn vị', dataIndex: 'unit', key: 'unit', align: 'center' },
  { title: 'Danh mục', dataIndex: 'categoryName', key: 'categoryName' },
  { title: 'Giá nhập', dataIndex: 'costPrice', key: 'costPrice', align: 'right' },
  { title: 'Giá bán', dataIndex: 'salePrice', key: 'salePrice', align: 'right' },
  { title: 'Tồn kho', dataIndex: 'stockQuantity', key: 'stockQuantity', align: 'center' },
  { title: 'Trạng thái', dataIndex: 'isActive', key: 'isActive', align: 'center' },
  { title: 'Thao tác', dataIndex: 'actions', key: 'actions', align: 'center' }
]

// ── Ảnh ──
const imageTab    = ref('url')
const previewUrl  = ref('')
const imgWidth    = ref(200)
const imgHeight   = ref(200)
const imgFit      = ref('cover')
const previewHeight = ref(240)

watch(() => form.value.imageUrl, (val) => {
  if (imageTab.value === 'url') previewUrl.value = val
})

const onFileSelect = (e) => {
  const file = e.target.files[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) { alert('File quá lớn! Tối đa 5MB'); return }
  const reader = new FileReader()
  reader.onload = (ev) => {
    previewUrl.value = ev.target.result
    form.value.imageUrl = ev.target.result
  }
  reader.readAsDataURL(file)
}

const onFileDrop = (e) => {
  const file = e.dataTransfer.files[0]
  if (!file || !file.type.startsWith('image/')) return
  onFileSelect({ target: { files: [file] } })
}

const onImgError = () => {
  previewUrl.value = ''
  if (imageTab.value === 'url') alert('Không tải được ảnh từ link này!')
}

const clearImage = () => { previewUrl.value = ''; form.value.imageUrl = '' }
const resetImageSize = () => { imgWidth.value = 200; imgHeight.value = 200; imgFit.value = 'cover' }
const formatPrice = (val) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0)

const loadProducts = async () => {
  loading.value = true; error.value = ''
  try {
    const params = {}
    if (search.value) params.search = search.value
    if (filterCategory.value) params.categoryId = filterCategory.value
    const res = await productApi.get('/products', { params })
    products.value = res.data
  } catch {
    error.value = 'Không thể kết nối Product Service.'
  } finally {
    loading.value = false
  }
}

const loadCategories = async () => {
  try {
    const res = await productApi.get('/categories')
    categories.value = res.data
  } catch {}
}

const loadUnits = async () => {
  try {
    const res = await productApi.get('/products/units')
    units.value = res.data
  } catch {
    units.value = ['Cái', 'Chiếc', 'Bộ', 'Hộp', 'Thùng', 'Túi', 'Gói', 'Kg', 'Gram', 'Tấn', 'Lít', 'ml', 'Mét', 'Cuộn', 'Tờ', 'Quyển', 'Đôi', 'Cặp']
  }
}

const editProduct = (p) => {
  editingProduct.value = p
  form.value = {
    code: p.code, name: p.name, unit: p.unit || 'Cái',
    costPrice: p.costPrice, salePrice: p.salePrice,
    categoryId: p.categoryId, imageUrl: p.imageUrl || '',
    description: p.description || '', minStockThreshold: p.minStockThreshold
  }
  previewUrl.value = p.imageUrl || ''
  imageTab.value = 'url'
  resetImageSize()
  showAddModal.value = true
}

const saveProduct = async () => {
  formError.value = ''
  if (!form.value.code || !form.value.name || !form.value.categoryId) {
    formError.value = 'Vui lòng điền đầy đủ thông tin bắt buộc (*)'; return
  }
  form.value.code = form.value.code.trim().toUpperCase()
  const codeExists = products.value.some(p =>
    (p.code||'').toUpperCase() === form.value.code &&
    (!editingProduct.value || p.id !== editingProduct.value.id)
  )
  if (codeExists) {
    formError.value = `Mã sản phẩm "${form.value.code}" đã tồn tại!`; return
  }
  saving.value = true
  try {
    if (editingProduct.value) {
      await productApi.put(`/products/${editingProduct.value.id}`, { ...form.value, isActive: true })
    } else {
      await productApi.post('/products', form.value)
    }
    closeModal()
    loadProducts()
  } catch (e) {
    formError.value = 'Lỗi khi lưu: ' + (e.response?.data || e.message)
  } finally {
    saving.value = false
  }
}

const deleteProduct = async (p) => {
  if (!confirm(`Xác nhận xóa sản phẩm?\n\nTên: ${p.name}\nMã: ${p.code}`)) return
  try {
    await productApi.delete(`/products/${p.id}`)
    products.value = products.value.filter(x => x.id !== p.id)
    alert(`Đã xóa sản phẩm "${p.name}"!`)
  } catch (e) {
    alert(e.response?.data?.message || e.response?.data || 'Lỗi khi xóa sản phẩm')
  }
}

const closeModal = () => {
  showAddModal.value = false
  editingProduct.value = null
  form.value = { code: '', name: '', unit: 'Cái', costPrice: 0, salePrice: 0, categoryId: '', imageUrl: '', description: '', minStockThreshold: 10 }
  previewUrl.value = ''
  formError.value = ''
  resetImageSize()
}

onMounted(() => {
  loadCategories()
  loadProducts()
  loadUnits()
  window.addEventListener('categories-updated', loadCategories)
})

onBeforeUnmount(() => {
  window.removeEventListener('categories-updated', loadCategories)
})
</script>