<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '@/api/axios';

// State
const activeTab = ref('active');
const activeUsers = ref([]);
const deletedUsers = ref([]);
const showDialog = ref(false);
const showDetailModal = ref(false);
const editingUser = ref(null);
const selectedUser = ref(null);
const searchKeyword = ref('');
const filterRole = ref('');
const loading = ref(false);
const statistics = ref({
  totalUsers: 0,
  totalAdmin: 0,
  totalSales: 0,
  totalWarehouse: 0,
  totalLocked: 0,
  totalDeleted: 0
});

const formData = ref({
  username: '',
  password: '',
  fullName: '',
  email: '',
  phone: '',
  role: 'Sales',
  avatar: ''
});

const filteredUsers = computed(() => {
  let users = [...activeUsers.value];
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    users = users.filter(u => 
      (u.username && u.username.toLowerCase().includes(keyword)) ||
      (u.fullName && u.fullName.toLowerCase().includes(keyword)) ||
      (u.email && u.email.toLowerCase().includes(keyword)) ||
      (u.phone && u.phone.includes(keyword)) ||
      (u.role && u.role.toLowerCase().includes(keyword))
    );
  }
  if (filterRole.value) {
    users = users.filter(u => u.role === filterRole.value);
  }
  return users;
});

onMounted(async () => {
  await loadData();
  await loadStatistics();
});

async function loadData() {
  loading.value = true;
  await Promise.all([loadActiveUsers(), loadDeletedUsers()]);
  loading.value = false;
}

async function loadActiveUsers() {
  try {
    const res = await api.get('/users');
    activeUsers.value = res.data;
  } catch (error) {
    console.error('Error loading active users:', error);
  }
}

async function loadDeletedUsers() {
  try {
    const res = await api.get('/users/deleted');
    deletedUsers.value = res.data;
  } catch (error) {
    console.error('Error loading deleted users:', error);
  }
}

async function loadStatistics() {
  try {
    const res = await api.get('/users/statistics');
    statistics.value = res.data;
  } catch (error) {
    console.error('Error loading statistics:', error);
  }
}

async function saveUser() {
  try {
    if (editingUser.value) {
      const updateData = {
        fullName: formData.value.fullName,
        role: formData.value.role,
        email: formData.value.email,
        phone: formData.value.phone,
        avatar: formData.value.avatar
      };
      if (formData.value.password && formData.value.password.trim() !== '') {
        updateData.password = formData.value.password;
      }
      await api.put(`/users/${editingUser.value.id}`, updateData);
      alert('Cập nhật user thành công!');
    } else {
      if (!formData.value.username || !formData.value.password || !formData.value.fullName) {
        alert('Vui lòng nhập đầy đủ thông tin!');
        return;
      }
      await api.post('/users', formData.value);
      alert('Thêm user thành công!');
    }
    showDialog.value = false;
    resetForm();
    await loadData();
    await loadStatistics();
  } catch (error) {
    console.error('Error saving user:', error);
    alert(error.response?.data?.message || 'Lưu thất bại!');
  }
}

async function deleteUser(id) {
  if (confirm('Bạn có chắc muốn xóa user này? User sẽ được chuyển vào thùng rác.')) {
    try {
      await api.delete(`/users/${id}`);
      await loadData();
      await loadStatistics();
      alert('User đã được chuyển vào thùng rác!');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Xóa thất bại!');
    }
  }
}

async function restoreUser(id) {
  if (confirm('Bạn có chắc muốn khôi phục user này?')) {
    try {
      await api.post(`/users/${id}/restore`);
      await loadData();
      await loadStatistics();
      alert('Khôi phục user thành công!');
    } catch (error) {
      console.error('Error restoring user:', error);
      alert('Khôi phục thất bại!');
    }
  }
}

async function restoreAll() {
  if (confirm('Bạn có chắc muốn khôi phục TẤT CẢ user trong thùng rác?')) {
    try {
      await api.post('/users/restore-all');
      await loadData();
      await loadStatistics();
      alert('Đã khôi phục tất cả user!');
    } catch (error) {
      console.error('Error restoring all:', error);
      alert('Khôi phục thất bại!');
    }
  }
}

async function permanentDeleteUser(id) {
  if (confirm('⚠️ CẢNH BÁO: Bạn sẽ xóa vĩnh viễn user này. Hành động này KHÔNG THỂ HOÀN TÁC!')) {
    try {
      await api.delete(`/users/${id}/permanent`);
      await loadData();
      await loadStatistics();
      alert('Đã xóa vĩnh viễn user!');
    } catch (error) {
      console.error('Error permanently deleting user:', error);
      alert('Xóa thất bại!');
    }
  }
}

async function emptyTrash() {
  if (confirm('⚠️ CẢNH BÁO: Bạn sẽ xóa vĩnh viễn TẤT CẢ user trong thùng rác. Hành động này KHÔNG THỂ HOÀN TÁC!')) {
    try {
      await api.delete('/users/empty-trash');
      await loadData();
      await loadStatistics();
      alert('Đã dọn sạch thùng rác!');
    } catch (error) {
      console.error('Error emptying trash:', error);
      alert('Xóa thất bại!');
    }
  }
}

function editUser(user) {
  editingUser.value = user;
  formData.value = {
    username: user.username,
    password: '',
    fullName: user.fullName || '',
    email: user.email || '',
    phone: user.phone || '',
    role: user.role || 'Sales',
    avatar: user.avatar || ''
  };
  showDialog.value = true;
}

function viewDetail(user) {
  selectedUser.value = user;
  showDetailModal.value = true;
}

function openAddModal() {
  editingUser.value = null;
  formData.value = {
    username: '',
    password: '',
    fullName: '',
    email: '',
    phone: '',
    role: 'Sales',
    avatar: ''
  };
  showDialog.value = true;
}

function resetForm() {
  editingUser.value = null;
  formData.value = {
    username: '',
    password: '',
    fullName: '',
    email: '',
    phone: '',
    role: 'Sales',
    avatar: ''
  };
}

function resetFilters() {
  searchKeyword.value = '';
  filterRole.value = '';
}

function getRoleBadge(role) {
  const badges = { 'Admin': 'bg-danger', 'Sales': 'bg-success', 'Warehouse': 'bg-info' };
  return badges[role] || 'bg-secondary';
}

function getRoleIcon(role) {
  const icons = { 'Admin': '👑', 'Sales': '🛒', 'Warehouse': '📦' };
  return icons[role] || '👤';
}

function formatDate(dateString) {
  if (!dateString) return '--/--/----';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN');
}

function closeModal() {
  showDialog.value = false;
}

function closeDetailModal() {
  showDetailModal.value = false;
}

function handleImageError(event) {
  event.target.src = 'https://via.placeholder.com/100?text=No+Image';
}
</script>

<template>
  <div class="user-management">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>👥 Quản lý người dùng <span class="badge bg-primary">{{ activeUsers.length }}</span></h1>
      <button class="btn btn-primary" @click="openAddModal">➕ Thêm user</button>
    </div>

    <div class="row g-3 mb-4">
      <div class="col-md-2"><div class="stat-card bg-primary text-white"><div class="stat-value">{{ statistics.totalUsers || activeUsers.length }}</div><div class="stat-label">Tổng user</div></div></div>
      <div class="col-md-2"><div class="stat-card bg-danger text-white"><div class="stat-value">{{ statistics.totalAdmin || 0 }}</div><div class="stat-label">Admin</div></div></div>
      <div class="col-md-2"><div class="stat-card bg-success text-white"><div class="stat-value">{{ statistics.totalSales || 0 }}</div><div class="stat-label">Sales</div></div></div>
      <div class="col-md-2"><div class="stat-card bg-info text-white"><div class="stat-value">{{ statistics.totalWarehouse || 0 }}</div><div class="stat-label">Warehouse</div></div></div>
      <div class="col-md-2"><div class="stat-card bg-warning text-white"><div class="stat-value">{{ statistics.totalDeleted || deletedUsers.length }}</div><div class="stat-label">Đã xóa</div></div></div>
      <div class="col-md-2"><div class="stat-card bg-secondary text-white"><div class="stat-value">{{ statistics.totalLocked || 0 }}</div><div class="stat-label">Bị khóa</div></div></div>
    </div>

    <div class="card mb-4">
      <div class="card-body">
        <div class="row">
          <div class="col-md-5"><input type="text" class="form-control" v-model="searchKeyword" placeholder="🔍 Tìm kiếm..."></div>
          <div class="col-md-3">
            <select class="form-select" v-model="filterRole">
              <option value="">Tất cả role</option>
              <option value="Admin">👑 Admin</option>
              <option value="Sales">🛒 Sales</option>
              <option value="Warehouse">📦 Warehouse</option>
            </select>
          </div>
          <div class="col-md-2"><button class="btn btn-outline-secondary w-100" @click="resetFilters">🗑️ Xóa lọc</button></div>
          <div class="col-md-2"><button class="btn btn-outline-info w-100" @click="loadData">🔄 Làm mới</button></div>
        </div>
      </div>
    </div>

    <ul class="nav nav-tabs mb-4">
      <li class="nav-item"><a class="nav-link" :class="{ active: activeTab === 'active' }" @click="activeTab = 'active'">👥 Người dùng <span class="badge bg-secondary">{{ activeUsers.length }}</span></a></li>
      <li class="nav-item"><a class="nav-link" :class="{ active: activeTab === 'deleted' }" @click="activeTab = 'deleted'">🗑️ Thùng rác <span class="badge bg-secondary">{{ deletedUsers.length }}</span></a></li>
    </ul>

    <div v-if="loading" class="text-center py-5"><div class="spinner-border text-primary"></div></div>

    <div v-else-if="activeTab === 'active'" class="table-responsive">
      <table class="table table-hover">
        <thead class="table-dark">
          <tr><th>ID</th><th>Username</th><th>Họ tên</th><th>Email</th><th>Role</th><th>Hành động</th></tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.id">
            <td class="fw-bold">{{ user.id }}</td>
            <td><span class="username">{{ user.username }}</span></td>
            <td>{{ user.fullName }}</td>
            <td>{{ user.email || '---' }}</td>
            <td><span :class="'badge ' + getRoleBadge(user.role)">{{ getRoleIcon(user.role) }} {{ user.role }}</span></td>
            <td><div class="btn-group btn-group-sm"><button class="btn btn-outline-info" @click="viewDetail(user)">👁️</button><button class="btn btn-outline-warning" @click="editUser(user)">✏️</button><button class="btn btn-outline-danger" @click="deleteUser(user.id)">🗑️</button></div></td>
          </tr>
          <tr v-if="filteredUsers.length === 0"><td colspan="6" class="text-center py-5 text-muted">Không có dữ liệu</td></tr>
        </tbody>
      </table>
    </div>

    <div v-else-if="activeTab === 'deleted'" class="table-responsive">
      <div class="alert alert-warning mb-3">⚠️ Các user trong thùng rác có thể được khôi phục</div>
      <div class="mb-3 text-end" v-if="deletedUsers.length > 0"><button class="btn btn-sm btn-success me-2" @click="restoreAll">🔄 Khôi phục tất cả</button><button class="btn btn-sm btn-danger" @click="emptyTrash">🗑️ Dọn sạch thùng rác</button></div>
      <table class="table table-hover">
        <thead class="table-dark"><tr><th>ID</th><th>Username</th><th>Họ tên</th><th>Role</th><th>Ngày xóa</th><th>Hành động</th></tr></thead>
        <tbody>
          <tr v-for="user in deletedUsers" :key="user.id">
            <td class="fw-bold">{{ user.id }}</td>
            <td>{{ user.username }}</td>
            <td>{{ user.fullName }}</td>
            <td><span :class="'badge ' + getRoleBadge(user.role)">{{ getRoleIcon(user.role) }} {{ user.role }}</span></td>
            <td>{{ formatDate(user.deletedAt) }}</td>
            <td><button class="btn btn-sm btn-success me-2" @click="restoreUser(user.id)">🔄 Khôi phục</button><button class="btn btn-sm btn-danger" @click="permanentDeleteUser(user.id)">💀 Xóa vĩnh viễn</button></td>
          </tr>
          <tr v-if="deletedUsers.length === 0"><td colspan="6" class="text-center py-5 text-muted">🗑️ Thùng rác trống</td></tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Add/Edit User -->
    <div class="modal" :class="{ show: showDialog }" tabindex="-1" v-if="showDialog">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-primary text-white"><h5 class="modal-title">{{ editingUser ? '✏️ Sửa user' : '➕ Thêm user mới' }}</h5><button type="button" class="btn-close btn-close-white" @click="closeModal"></button></div>
          <div class="modal-body">
            <div class="mb-3"><label>Username <span class="text-danger">*</span></label><input class="form-control" v-model="formData.username" :disabled="!!editingUser"></div>
            <div class="mb-3"><label>Password <span class="text-danger">{{ editingUser ? '' : '*' }}</span></label><input class="form-control" type="password" v-model="formData.password" :placeholder="editingUser ? '(Để trống nếu không đổi)' : 'Nhập mật khẩu'"><small v-if="editingUser" class="text-muted">Để trống nếu không muốn thay đổi mật khẩu</small></div>
            <div class="mb-3"><label>Họ tên <span class="text-danger">*</span></label><input class="form-control" v-model="formData.fullName"></div>
            <div class="mb-3"><label>Email</label><input class="form-control" type="email" v-model="formData.email" placeholder="example@email.com"></div>
            <div class="mb-3"><label>Số điện thoại</label><input class="form-control" v-model="formData.phone" placeholder="0912345678"></div>
            <div class="mb-3"><label>Role <span class="text-danger">*</span></label><select class="form-select" v-model="formData.role"><option value="Admin">👑 Admin</option><option value="Sales">🛒 Sales</option><option value="Warehouse">📦 Warehouse</option></select></div>
            <div class="mb-3"><label>Avatar URL</label><input class="form-control" v-model="formData.avatar" placeholder="https://example.com/avatar.jpg"></div>
          </div>
          <div class="modal-footer"><button class="btn btn-secondary" @click="closeModal">Hủy</button><button class="btn btn-primary" @click="saveUser">Lưu</button></div>
        </div>
      </div>
    </div>

    <!-- Modal View Detail -->
    <div class="modal" :class="{ show: showDetailModal }" tabindex="-1" v-if="showDetailModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-info text-white"><h5 class="modal-title">👤 Chi tiết user</h5><button type="button" class="btn-close btn-close-white" @click="closeDetailModal"></button></div>
          <div class="modal-body">
            <div class="text-center mb-3">
              <img :src="selectedUser?.avatar || 'https://via.placeholder.com/100?text=No+Image'" class="rounded-circle" width="100" height="100" style="object-fit: cover; border: 3px solid #6366f1;" @error="handleImageError">
            </div>
            <table class="table table-borderless">
              <tbody>
                <tr><th>ID:</th><td>{{ selectedUser?.id }}</td></tr>
                <tr><th>Username:</th><td><strong>{{ selectedUser?.username }}</strong></td></tr>
                <tr><th>Họ tên:</th><td>{{ selectedUser?.fullName }}</td></tr>
                <tr><th>Email:</th><td>{{ selectedUser?.email || '---' }}</td></tr>
                <tr><th>Phone:</th><td>{{ selectedUser?.phone || '---' }}</td></tr>
                <tr><th>Role:</th><td><span :class="'badge ' + getRoleBadge(selectedUser?.role)">{{ getRoleIcon(selectedUser?.role) }} {{ selectedUser?.role }}</span></td></tr>
                <tr><th>Ngày tạo:</th><td>{{ formatDate(selectedUser?.createdAt) }}</td></tr>
              </tbody>
            </table>
          </div>
          <div class="modal-footer"><button class="btn btn-secondary" @click="closeDetailModal">Đóng</button></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-management { padding: 20px; }
.stat-card { padding: 15px; border-radius: 10px; text-align: center; cursor: pointer; transition: transform 0.2s; }
.stat-card:hover { transform: translateY(-3px); }
.stat-value { font-size: 28px; font-weight: bold; }
.stat-label { font-size: 14px; opacity: 0.9; margin-top: 5px; }
.modal.show { display: block; background-color: rgba(0,0,0,0.5); }
.nav-tabs .nav-link { cursor: pointer; color: #6c757d; }
.nav-tabs .nav-link.active { color: #0d6efd; font-weight: bold; border-bottom: 2px solid #0d6efd; }
.table-hover tbody tr:hover { background-color: #f5f5f5; }
.btn-group { display: flex; gap: 5px; }
.username { font-weight: 500; color: #0d6efd; }
.badge { font-size: 12px; padding: 5px 10px; }
</style>