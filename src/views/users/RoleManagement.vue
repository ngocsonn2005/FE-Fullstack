<template>
  <div class="role-management">
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon-wrapper">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </div>
        <div class="header-text">
          <h1>Phân quyền người dùng</h1>
          <p>Quản lý vai trò và quyền hạn của người dùng trong hệ thống</p>
        </div>
      </div>
    </div>

    <!-- Danh sách user cần phân quyền -->
    <div class="table-card">
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr><th>ID</th><th>Người dùng</th><th>Họ tên</th><th>Vai trò hiện tại</th><th>Vai trò mới</th><th>Thao tác</th></tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>#{{ user.id }}</td>
              <td>{{ user.username }}</td>
              <td>{{ user.fullName }}</td>
              <td><span :class="'role-badge ' + getRoleBadge(user.role)">{{ user.role }}</span></td>
              <td>
                <select v-model="user.newRole" class="role-select">
                  <option value="Admin">Quản trị viên</option>
                  <option value="Sales">Nhân viên bán hàng</option>
                  <option value="Warehouse">Nhân viên kho</option>
                </select>
              </td>
              <td>
                <button class="btn-confirm" @click="confirmChangeRole(user)" :disabled="user.role === user.newRole">
                  Xác nhận phân quyền
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal xác nhận phân quyền -->
    <div class="modal-overlay" :class="{ show: showConfirmModal }" v-if="showConfirmModal" @click.self="closeConfirmModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Xác nhận phân quyền</h3>
            <button class="modal-close" @click="closeConfirmModal">✕</button>
          </div>
          <div class="modal-body">
            <div class="confirm-icon">⚠️</div>
            <p>Bạn có chắc chắn muốn thay đổi vai trò của người dùng <strong>{{ selectedUser?.fullName }}</strong>?</p>
            <div class="role-change">
              <span class="old-role">{{ selectedUser?.role }}</span>
              <span>→</span>
              <span class="new-role">{{ selectedUser?.newRole }}</span>
            </div>
            <p class="warning-text">Hành động này sẽ thay đổi quyền truy cập của người dùng trong toàn bộ hệ thống!</p>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" @click="closeConfirmModal">Hủy</button>
            <button class="btn-primary" @click="executeChangeRole">Xác nhận</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div v-if="toast.show" :class="['toast-message', toast.type]">{{ toast.message }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/api/axios';

const users = ref([]);
const selectedUser = ref(null);
const showConfirmModal = ref(false);
const toast = ref({ show: false, message: '', type: 'success' });

onMounted(async () => {
  await loadUsers();
});

async function loadUsers() {
  try {
    const res = await api.get('/users');
    users.value = res.data.map(u => ({ ...u, newRole: u.role }));
  } catch (error) {
    console.error('Error loading users:', error);
  }
}

function confirmChangeRole(user) {
  selectedUser.value = user;
  showConfirmModal.value = true;
}

async function executeChangeRole() {
  try {
    await api.put(`/users/${selectedUser.value.id}`, {
      role: selectedUser.value.newRole
    });
    showToast(`Đã phân quyền ${selectedUser.value.fullName} thành ${selectedUser.value.newRole}`, 'success');
    await loadUsers();
  } catch (error) {
    showToast('Phân quyền thất bại!', 'error');
  } finally {
    closeConfirmModal();
  }
}

function closeConfirmModal() {
  showConfirmModal.value = false;
  selectedUser.value = null;
}

function getRoleBadge(role) {
  const badges = { 'Admin': 'role-admin', 'Sales': 'role-sales', 'Warehouse': 'role-warehouse' };
  return badges[role] || 'role-default';
}

function showToast(message, type) {
  toast.value = { show: true, message, type };
  setTimeout(() => { toast.value.show = false; }, 3000);
}
</script>

<style scoped>
.role-management { background: #f0f2f5; min-height: 100vh; padding: 24px; }
.page-header { background: white; border-radius: 16px; padding: 20px 28px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.header-left { display: flex; align-items: center; gap: 16px; }
.header-icon-wrapper { width: 48px; height: 48px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 12px; display: flex; align-items: center; justify-content: center; }
.header-icon-wrapper svg { width: 24px; height: 24px; color: white; }
.header-text h1 { font-size: 24px; font-weight: 600; color: #1a1a2e; margin-bottom: 4px; }
.table-card { background: white; border-radius: 16px; overflow: hidden; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { background: #f8f9fa; padding: 14px 16px; text-align: left; font-size: 12px; font-weight: 600; color: #6c757d; }
.data-table td { padding: 14px 16px; border-bottom: 1px solid #f3f4f6; }
.role-badge { padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; }
.role-admin { background: #fef2f2; color: #ef4444; }
.role-sales { background: #f0fdf4; color: #10b981; }
.role-warehouse { background: #ecfeff; color: #06b6d4; }
.role-select { padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 8px; background: white; cursor: pointer; }
.btn-confirm { background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; }
.btn-confirm:disabled { opacity: 0.5; cursor: not-allowed; }
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: none; align-items: center; justify-content: center; z-index: 1000; }
.modal-overlay.show { display: flex; }
.modal-dialog { width: 100%; max-width: 450px; background: white; border-radius: 16px; overflow: hidden; }
.modal-header { padding: 20px 24px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; display: flex; justify-content: space-between; align-items: center; }
.modal-body { padding: 24px; text-align: center; }
.confirm-icon { font-size: 48px; margin-bottom: 16px; }
.role-change { display: flex; justify-content: center; align-items: center; gap: 16px; margin: 16px 0; padding: 12px; background: #f8f9fa; border-radius: 12px; }
.old-role { background: #fee2e2; color: #dc2626; padding: 4px 12px; border-radius: 6px; }
.new-role { background: #d1fae5; color: #059669; padding: 4px 12px; border-radius: 6px; }
.warning-text { color: #dc2626; font-size: 13px; margin-top: 12px; }
.modal-footer { padding: 16px 24px; background: #f8f9fa; display: flex; justify-content: flex-end; gap: 12px; }
.btn-cancel, .btn-primary { padding: 8px 20px; border-radius: 8px; cursor: pointer; }
.btn-cancel { background: white; border: 1px solid #dee2e6; }
.btn-primary { background: #6366f1; color: white; border: none; }
.toast-message { position: fixed; bottom: 24px; right: 24px; padding: 12px 20px; border-radius: 10px; font-size: 14px; z-index: 1100; }
.toast-message.success { background: #10b981; color: white; }
.toast-message.error { background: #ef4444; color: white; }
</style>