<template>
  <div class="user-management">
    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon-wrapper">
          <svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <div class="header-text">
          <h1>Quản lý người dùng</h1>
          <p>{{ activeTab === 'role' ? 'Phân quyền người dùng trong hệ thống' : 'Tất cả người dùng trong hệ thống' }}</p>
        </div>
      </div>
      <button class="btn-primary" @click="openAddModal" v-if="activeTab !== 'role'">
        <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Thêm người dùng
      </button>
    </div>

    <!-- Statistics - Ẩn khi ở tab Phân quyền -->
    <div class="stats-grid" v-if="activeTab !== 'role'">
      <div class="stat-card total">
        <div class="stat-icon-bg">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ statistics.totalUsers || activeUsers.length }}</span>
          <span class="stat-label">Tổng người dùng</span>
        </div>
      </div>
      
      <div class="stat-card admin">
        <div class="stat-icon-bg">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ statistics.totalAdmin || 0 }}</span>
          <span class="stat-label">Quản trị viên</span>
        </div>
      </div>
      
      <div class="stat-card sales">
        <div class="stat-icon-bg">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ statistics.totalSales || 0 }}</span>
          <span class="stat-label">Nhân viên bán hàng</span>
        </div>
      </div>
      
      <div class="stat-card warehouse">
        <div class="stat-icon-bg">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ statistics.totalWarehouse || 0 }}</span>
          <span class="stat-label">Nhân viên kho</span>
        </div>
      </div>
      
      <div class="stat-card deleted">
        <div class="stat-icon-bg">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ statistics.totalDeleted || deletedUsers.length }}</span>
          <span class="stat-label">Đã xóa</span>
        </div>
      </div>
      
      <div class="stat-card locked">
        <div class="stat-icon-bg">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ statistics.totalLocked || 0 }}</span>
          <span class="stat-label">Bị khóa</span>
        </div>
      </div>
    </div>

    <!-- Search & Filter - Ẩn khi ở tab Phân quyền -->
    <div class="filter-bar" v-if="activeTab !== 'role'">
      <div class="search-wrapper">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input 
          type="text" 
          v-model="searchKeyword" 
          placeholder="Tìm kiếm theo tên, email, số điện thoại..."
          class="search-input"
        >
      </div>
      <select class="filter-select" v-model="filterRole">
        <option value="">Tất cả vai trò</option>
        <option value="Admin">Quản trị viên</option>
        <option value="Sales">Nhân viên bán hàng</option>
        <option value="Warehouse">Nhân viên kho</option>
      </select>
      <button class="btn-secondary" @click="resetFilters">
        <svg class="btn-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
        Xóa lọc
      </button>
      <button class="btn-refresh" @click="loadData">
        <svg class="btn-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="23 4 23 10 17 10"/>
          <polyline points="1 20 1 14 7 14"/>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
        </svg>
        Làm mới
      </button>
    </div>

    <!-- Tabs -->
    <div class="tabs-wrapper">
      <button 
        class="tab-button" 
        :class="{ active: activeTab === 'active' }"
        @click="activeTab = 'active'"
      >
        <svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
        </svg>
        Người dùng
        <span class="tab-badge">{{ activeUsers.length }}</span>
      </button>
      
      <button 
        class="tab-button" 
        :class="{ active: activeTab === 'deleted' }"
        @click="activeTab = 'deleted'"
      >
        <svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        </svg>
        Thùng rác
        <span class="tab-badge danger">{{ deletedUsers.length }}</span>
      </button>

      <!-- ✅ THÊM TAB PHÂN QUYỀN -->
      <button 
        class="tab-button" 
        :class="{ active: activeTab === 'role' }"
        @click="activeTab = 'role'"
      >
        <svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
        Phân quyền
        <span class="tab-badge">{{ activeUsers.length }}</span>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading && activeTab !== 'role'" class="loading-container">
      <div class="spinner">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
      </div>
      <p>Đang tải dữ liệu...</p>
    </div>

    <!-- ✅ TAB PHÂN QUYỀN -->
    <div v-else-if="activeTab === 'role'" class="role-tab-content">
      <RoleManagement />
    </div>

    <!-- Active Users Table -->
    <div v-else-if="activeTab === 'active'" class="table-card">
      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th style="width: 80px">ID</th>
              <th>Người dùng</th>
              <th>Họ và tên</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th style="width: 200px">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in paginatedActiveUsers" :key="user.id">
              <td>
                <span class="user-id">#{{ user.id }}</span>
              </td>
              <td>
                <div class="user-cell">
                  <img 
                    :src="user.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHJ4PSI4IiBmaWxsPSIjRTJFOEZGMCIvPjxjaXJjbGUgY3g9IjIwIiBjeT0iMTYiIHI9IjYiIGZpbGw9IiM5M0E0RkYiLz48cGF0aCBkPSJNMTAgMzJjMC02LjYyNyA0LjQ3Ny0xMCAxMC0xMCA1LjUyMyAwIDEwIDQuMzczIDEwIDEwIiBmaWxsPSIjOTNBNEZGIi8+PC9zdmc+'" 
                    class="user-avatar"
                    @error="handleImageError"
                  >
                  <span class="username-text">{{ user.username }}</span>
                </div>
              </td>
              <td>
                <span class="fullname-text">{{ user.fullName || '---' }}</span>
              </td>
              <td>
                <span class="email-text">{{ user.email || '---' }}</span>
              </td>
              <td>
                <span :class="'role-badge ' + getRoleBadge(user.role)">
                  {{ getRoleLabel(user.role) }}
                </span>
              </td>
              <td>
                <span v-if="user.isLocked" class="status-badge locked">🔒 Bị khóa</span>
                <span v-else class="status-badge active">✅ Hoạt động</span>
              </td>
              <td>
                <div class="action-buttons">
                  <button class="action-btn view" @click="viewDetail(user)" title="Xem chi tiết">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  </button>
                  <button class="action-btn edit" @click="editUser(user)" title="Chỉnh sửa">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button v-if="!user.isLocked" class="action-btn lock" @click="toggleLockUser(user)" title="Khóa tài khoản">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </button>
                  <button v-else class="action-btn unlock" @click="toggleLockUser(user)" title="Mở khóa tài khoản">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      <line x1="12" y1="15" x2="12" y2="17"/>
                    </svg>
                  </button>
                  <button class="action-btn delete" @click="deleteUser(user.id)" title="Xóa">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Active Users Pagination -->
      <div v-if="totalActivePages > 1" class="pagination-wrapper">
        <div class="pagination-info">
          Hiển thị {{ ((activeCurrentPage - 1) * itemsPerPage) + 1 }} - {{ Math.min(activeCurrentPage * itemsPerPage, filteredUsers.length) }} / {{ filteredUsers.length }}
        </div>
        <div class="pagination">
          <button 
            class="pagination-btn" 
            :disabled="activeCurrentPage === 1"
            @click="goToActivePage(activeCurrentPage - 1)"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          
          <button 
            v-for="page in getActivePageNumbers()"
            :key="page"
            class="pagination-btn"
            :class="{ active: page === activeCurrentPage, dots: page === '...' }"
            :disabled="page === '...'"
            @click="page !== '...' && goToActivePage(page)"
          >
            {{ page }}
          </button>
          
          <button 
            class="pagination-btn" 
            :disabled="activeCurrentPage === totalActivePages"
            @click="goToActivePage(activeCurrentPage + 1)"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
        
        <div class="pagination-page-size">
          <span>Hiển thị</span>
          <select v-model="itemsPerPage" @change="resetActivePage">
            <option :value="10">10</option>
            <option :value="20">20</option>
            <option :value="50">50</option>
            <option :value="100">100</option>
          </select>
          <span>dòng</span>
        </div>
      </div>
      
      <div v-if="filteredUsers.length === 0" class="empty-state">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <line x1="17" y1="11" x2="23" y2="11"/>
        </svg>
        <h3>Không tìm thấy người dùng</h3>
        <p>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
      </div>
    </div>

    <!-- Deleted Users Table -->
    <div v-else-if="activeTab === 'deleted'" class="table-card">
      <div class="trash-alert">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <span>Các người dùng đã xóa có thể được khôi phục</span>
      </div>
      
      <div class="trash-actions" v-if="deletedUsers.length > 0">
        <button class="btn-success" @click="restoreAll">
          <svg class="btn-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="1 4 1 10 7 10"/>
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
          </svg>
          Khôi phục tất cả
        </button>
        <button class="btn-danger" @click="emptyTrash">
          <svg class="btn-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
          Dọn sạch thùng rác
        </button>
      </div>

      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th style="width: 80px">ID</th>
              <th>Tên đăng nhập</th>
              <th>Họ và tên</th>
              <th>Vai trò</th>
              <th>Ngày xóa</th>
              <th style="width: 180px">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in paginatedDeletedUsers" :key="user.id" class="deleted-row">
              <td>
                <span class="user-id deleted">#{{ user.id }}</span>
              </td>
              <td>
                <span class="username-text deleted">{{ user.username }}</span>
              </td>
              <td>{{ user.fullName || '---' }}</td>
              <td>
                <span :class="'role-badge ' + getRoleBadge(user.role)">
                  {{ getRoleLabel(user.role) }}
                </span>
              </td>
              <td class="date-text">{{ formatDate(user.deletedAt) }}</td>
              <td>
                <div class="action-buttons">
                  <button class="action-btn restore" @click="restoreUser(user.id)" title="Khôi phục">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="1 4 1 10 7 10"/>
                      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
                    </svg>
                    Khôi phục
                  </button>
                  <button class="action-btn permanent-delete" @click="permanentDeleteUser(user.id)" title="Xóa vĩnh viễn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M3 6h18"/>
                      <path d="M8 6V4h8v2"/>
                    </svg>
                    Xóa vĩnh viễn
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Deleted Users Pagination -->
      <div v-if="totalDeletedPages > 1" class="pagination-wrapper">
        <div class="pagination-info">
          Hiển thị {{ ((deletedCurrentPage - 1) * itemsPerPage) + 1 }} - {{ Math.min(deletedCurrentPage * itemsPerPage, deletedUsers.length) }} / {{ deletedUsers.length }}
        </div>
        <div class="pagination">
          <button 
            class="pagination-btn" 
            :disabled="deletedCurrentPage === 1"
            @click="goToDeletedPage(deletedCurrentPage - 1)"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          
          <button 
            v-for="page in getDeletedPageNumbers()"
            :key="page"
            class="pagination-btn"
            :class="{ active: page === deletedCurrentPage, dots: page === '...' }"
            :disabled="page === '...'"
            @click="page !== '...' && goToDeletedPage(page)"
          >
            {{ page }}
          </button>
          
          <button 
            class="pagination-btn" 
            :disabled="deletedCurrentPage === totalDeletedPages"
            @click="goToDeletedPage(deletedCurrentPage + 1)"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      </div>
      
      <div v-if="deletedUsers.length === 0" class="empty-state">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        </svg>
        <h3>Thùng rác trống</h3>
        <p>Không có người dùng nào trong thùng rác</p>
      </div>
    </div>

    <!-- Modal Add/Edit -->
    <div class="modal-overlay" :class="{ show: showDialog }" v-if="showDialog" @click.self="closeModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h3>{{ editingUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới' }}</h3>
            <button class="modal-close" @click="closeModal">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Tên đăng nhập <span class="required">*</span></label>
              <input class="form-input" v-model="formData.username" :disabled="!!editingUser" placeholder="Nhập tên đăng nhập">
            </div>
            
            <!-- Phần hiển thị mật khẩu mặc định khi thêm mới -->
            <div class="form-group" v-if="!editingUser">
              <label>Mật khẩu mặc định</label>
              <div class="password-default-box">
                <span class="password-display">{{ defaultPassword }}</span>
                <button class="btn-copy" @click="copyDefaultPassword" title="Sao chép">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                </button>
              </div>
              <small class="form-hint">Người dùng sẽ được yêu cầu đổi mật khẩu khi đăng nhập lần đầu</small>
            </div>
            
            <div class="form-group" v-else>
              <label>Mật khẩu mới</label>
              <input class="form-input" type="password" v-model="formData.password" placeholder="Để trống nếu không đổi">
              <small class="form-hint">Để trống nếu không muốn thay đổi mật khẩu</small>
            </div>
            
            <div class="form-group">
              <label>Họ và tên <span class="required">*</span></label>
              <input class="form-input" v-model="formData.fullName" placeholder="Nhập họ tên đầy đủ">
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Email</label>
                <input class="form-input" type="email" v-model="formData.email" placeholder="example@email.com">
              </div>
              <div class="form-group">
                <label>Số điện thoại</label>
                <input class="form-input" v-model="formData.phone" placeholder="0912345678">
              </div>
            </div>
            <div class="form-group">
              <label>Vai trò <span class="required">*</span></label>
              <select class="form-input" v-model="formData.role">
                <option value="Admin">Quản trị viên</option>
                <option value="Sales">Nhân viên bán hàng</option>
                <option value="Warehouse">Nhân viên kho</option>
              </select>
            </div>
            <div class="form-group">
              <label>URL Ảnh đại diện</label>
              <input class="form-input" v-model="formData.avatar" placeholder="https://example.com/avatar.jpg">
            </div>
            
            <!-- Checkbox yêu cầu đổi mật khẩu khi thêm mới -->
            <div class="form-group" v-if="!editingUser">
              <label class="checkbox-label">
                <input type="checkbox" v-model="forcePasswordChange">
                <span>Yêu cầu đổi mật khẩu khi đăng nhập lần đầu</span>
              </label>
              <small class="form-hint">Nếu bỏ chọn, người dùng sẽ đăng nhập với mật khẩu mặc định mà không bị yêu cầu đổi</small>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" @click="closeModal">Hủy bỏ</button>
            <button class="btn-primary" @click="saveUser">{{ editingUser ? 'Cập nhật' : 'Tạo mới' }}</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Detail -->
    <div class="modal-overlay" :class="{ show: showDetailModal }" v-if="showDetailModal" @click.self="closeDetailModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Chi tiết người dùng</h3>
            <button class="modal-close" @click="closeDetailModal">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="detail-avatar-section">
              <img 
                :src="selectedUser?.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNFNUU3RUIiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjQwIiByPSIxNSIgZmlsbD0iIzlDQTNBRiIvPjxwYXRoIGQ9Ik0yNSA4MEMyNSA2NS41IDM2LjUgNTUgNTAgNTVTNzUgNjUuNSA3NSA4MCIgZmlsbD0iIzlDQTNBRiIvPjwvc3ZnPg=='" 
                class="detail-avatar"
                @error="handleImageError"
              >
              <h4>{{ selectedUser?.fullName }}</h4>
              <span :class="'role-badge ' + getRoleBadge(selectedUser?.role)">
                {{ getRoleLabel(selectedUser?.role) }}
              </span>
              <span v-if="selectedUser?.isLocked" class="status-badge locked" style="margin-top: 8px;">🔒 Tài khoản bị khóa</span>
              <span v-else class="status-badge active" style="margin-top: 8px;">✅ Tài khoản hoạt động</span>
            </div>
            <div class="detail-info">
              <div class="info-row">
                <span class="info-label">ID</span>
                <span class="info-value">#{{ selectedUser?.id }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Tên đăng nhập</span>
                <span class="info-value highlight">{{ selectedUser?.username }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Email</span>
                <span class="info-value">{{ selectedUser?.email || '---' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Số điện thoại</span>
                <span class="info-value">{{ selectedUser?.phone || '---' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Ngày tạo</span>
                <span class="info-value">{{ formatDate(selectedUser?.createdAt) }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Lần đăng nhập cuối</span>
                <span class="info-value">{{ formatDate(selectedUser?.lastLoginAt) }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Số lần đăng nhập</span>
                <span class="info-value">{{ selectedUser?.loginCount || 0 }}</span>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" @click="closeDetailModal">Đóng</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <div v-if="toast.show" :class="['toast-message', toast.type]">
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import api from '@/api/axios';
// ✅ Import component RoleManagement
import RoleManagement from './RoleManagement.vue';

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

// Pagination state
const activeCurrentPage = ref(1);
const deletedCurrentPage = ref(1);
const itemsPerPage = ref(10);

// State mới
const defaultPassword = ref('123456');
const forcePasswordChange = ref(true);
const toast = ref({ show: false, message: '', type: 'success' });

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

// Pagination computed properties
const paginatedActiveUsers = computed(() => {
  const start = (activeCurrentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredUsers.value.slice(start, end);
});

const paginatedDeletedUsers = computed(() => {
  const start = (deletedCurrentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return deletedUsers.value.slice(start, end);
});

const totalActivePages = computed(() => {
  return Math.ceil(filteredUsers.value.length / itemsPerPage.value);
});

const totalDeletedPages = computed(() => {
  return Math.ceil(deletedUsers.value.length / itemsPerPage.value);
});

// Reset to first page when filters change
const resetActivePage = () => {
  activeCurrentPage.value = 1;
};

const resetDeletedPage = () => {
  deletedCurrentPage.value = 1;
};

// Watch for filter changes
watch([searchKeyword, filterRole], () => {
  resetActivePage();
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
    resetActivePage();
  } catch (error) {
    console.error('Error loading active users:', error);
  }
}

async function loadDeletedUsers() {
  try {
    const res = await api.get('/users/deleted');
    deletedUsers.value = res.data;
    resetDeletedPage();
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

// Hàm getRoleLabel
function getRoleLabel(role) {
  const labels = {
    'Admin': 'Quản trị viên',
    'Sales': 'Nhân viên bán hàng',
    'Warehouse': 'Nhân viên kho'
  };
  return labels[role] || role;
}

function getRoleBadge(role) {
  const badges = { 'Admin': 'role-admin', 'Sales': 'role-sales', 'Warehouse': 'role-warehouse' };
  return badges[role] || 'role-default';
}

function formatDate(dateString) {
  if (!dateString) return '--/--/----';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN');
}

function handleImageError(event) {
  event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNFNUU3RUIiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjQwIiByPSIxNSIgZmlsbD0iIzlDQTNBRiIvPjxwYXRoIGQ9Ik0yNSA4MEMyNSA2NS41IDM2LjUgNTUgNTAgNTVTNzUgNjUuNSA3NSA4MCIgZmlsbD0iIzlDQTNBRiIvPjwvc3ZnPg==';
}

function showToast(message, type = 'success') {
  toast.value = { show: true, message, type };
  setTimeout(() => {
    toast.value.show = false;
  }, 3000);
}

// Hàm copy mật khẩu mặc định
function copyDefaultPassword() {
  navigator.clipboard.writeText(defaultPassword.value);
  showToast('Đã sao chép mật khẩu mặc định!', 'success');
}

// Hàm toggle khóa/mở khóa
async function toggleLockUser(user) {
  const action = user.isLocked ? 'mở khóa' : 'khóa';
  if (confirm(`Bạn có chắc muốn ${action} tài khoản "${user.username}"?`)) {
    try {
      const endpoint = user.isLocked ? 'unlock' : 'lock';
      await api.post(`/users/${user.id}/${endpoint}`);
      await loadData();
      await loadStatistics();
      showToast(`Đã ${action} tài khoản "${user.username}"!`, 'success');
    } catch (error) {
      console.error('Error toggling lock:', error);
      showToast(`Không thể ${action} tài khoản!`, 'error');
    }
  }
}

// Hàm saveUser
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
      showToast('Cập nhật user thành công!', 'success');
    } else {
      if (!formData.value.username || !formData.value.fullName) {
        showToast('Vui lòng nhập đầy đủ thông tin!', 'error');
        return;
      }
      
      const newUser = {
        username: formData.value.username,
        password: defaultPassword.value,
        fullName: formData.value.fullName,
        email: formData.value.email,
        phone: formData.value.phone,
        role: formData.value.role,
        avatar: formData.value.avatar,
        forcePasswordChange: forcePasswordChange.value
      };
      
      await api.post('/users', newUser);
      showToast(`Thêm user thành công! Mật khẩu mặc định: ${defaultPassword.value}`, 'success');
    }
    showDialog.value = false;
    resetForm();
    await loadData();
    await loadStatistics();
  } catch (error) {
    console.error('Error saving user:', error);
    showToast(error.response?.data?.message || 'Lưu thất bại!', 'error');
  }
}

async function deleteUser(id) {
  if (confirm('Bạn có chắc muốn xóa user này? User sẽ được chuyển vào thùng rác.')) {
    try {
      await api.delete(`/users/${id}`);
      await loadData();
      await loadStatistics();
      showToast('User đã được chuyển vào thùng rác!', 'success');
    } catch (error) {
      console.error('Error deleting user:', error);
      showToast('Xóa thất bại!', 'error');
    }
  }
}

async function restoreUser(id) {
  if (confirm('Bạn có chắc muốn khôi phục user này?')) {
    try {
      await api.post(`/users/${id}/restore`);
      await loadData();
      await loadStatistics();
      showToast('Khôi phục user thành công!', 'success');
    } catch (error) {
      console.error('Error restoring user:', error);
      showToast('Khôi phục thất bại!', 'error');
    }
  }
}

async function restoreAll() {
  if (confirm('Bạn có chắc muốn khôi phục TẤT CẢ user trong thùng rác?')) {
    try {
      await api.post('/users/restore-all');
      await loadData();
      await loadStatistics();
      showToast('Đã khôi phục tất cả user!', 'success');
    } catch (error) {
      console.error('Error restoring all:', error);
      showToast('Khôi phục thất bại!', 'error');
    }
  }
}

async function permanentDeleteUser(id) {
  if (confirm('⚠️ CẢNH BÁO: Bạn sẽ xóa vĩnh viễn user này. Hành động này KHÔNG THỂ HOÀN TÁC!')) {
    try {
      await api.delete(`/users/${id}/permanent`);
      await loadData();
      await loadStatistics();
      showToast('Đã xóa vĩnh viễn user!', 'success');
    } catch (error) {
      console.error('Error permanently deleting user:', error);
      showToast('Xóa thất bại!', 'error');
    }
  }
}

async function emptyTrash() {
  if (confirm('⚠️ CẢNH BÁO: Bạn sẽ xóa vĩnh viễn TẤT CẢ user trong thùng rác. Hành động này KHÔNG THỂ HOÀN TÁC!')) {
    try {
      await api.delete('/users/empty-trash');
      await loadData();
      await loadStatistics();
      showToast('Đã dọn sạch thùng rác!', 'success');
    } catch (error) {
      console.error('Error emptying trash:', error);
      showToast('Xóa thất bại!', 'error');
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
  forcePasswordChange.value = true;
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
  forcePasswordChange.value = true;
}

function resetFilters() {
  searchKeyword.value = '';
  filterRole.value = '';
  resetActivePage();
}

function closeModal() {
  showDialog.value = false;
  resetForm();
}

function closeDetailModal() {
  showDetailModal.value = false;
  selectedUser.value = null;
}

// Pagination methods
function goToActivePage(page) {
  if (page >= 1 && page <= totalActivePages.value) {
    activeCurrentPage.value = page;
  }
}

function goToDeletedPage(page) {
  if (page >= 1 && page <= totalDeletedPages.value) {
    deletedCurrentPage.value = page;
  }
}

function getActivePageNumbers() {
  const total = totalActivePages.value;
  const current = activeCurrentPage.value;
  const delta = 2;
  const range = [];
  const rangeWithDots = [];
  let l;

  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      range.push(i);
    }
  }

  for (let i of range) {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1);
      } else if (i - l !== 1) {
        rangeWithDots.push('...');
      }
    }
    rangeWithDots.push(i);
    l = i;
  }

  return rangeWithDots;
}

function getDeletedPageNumbers() {
  const total = totalDeletedPages.value;
  const current = deletedCurrentPage.value;
  const delta = 2;
  const range = [];
  const rangeWithDots = [];
  let l;

  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      range.push(i);
    }
  }

  for (let i of range) {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1);
      } else if (i - l !== 1) {
        rangeWithDots.push('...');
      }
    }
    rangeWithDots.push(i);
    l = i;
  }

  return rangeWithDots;
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.user-management {
  background: #f0f2f5;
  min-height: 100vh;
  padding: 24px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Header */
.page-header {
  background: white;
  border-radius: 16px;
  padding: 24px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon-wrapper {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-icon {
  width: 24px;
  height: 24px;
  color: white;
}

.header-text h1 {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 4px;
}

.header-text p {
  font-size: 14px;
  color: #6c757d;
}

/* Buttons */
.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-icon {
  width: 18px;
  height: 18px;
}

.btn-icon-sm {
  width: 16px;
  height: 16px;
}

.btn-secondary {
  background: white;
  color: #6c757d;
  border: 1px solid #dee2e6;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #f8f9fa;
  border-color: #adb5bd;
}

.btn-refresh {
  background: white;
  color: #667eea;
  border: 1px solid #667eea;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.btn-refresh:hover {
  background: #667eea;
  color: white;
}

.btn-success {
  background: #10b981;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.btn-success:hover {
  background: #059669;
  transform: translateY(-1px);
}

.btn-danger {
  background: #ef4444;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.btn-danger:hover {
  background: #dc2626;
  transform: translateY(-1px);
}

.btn-cancel {
  background: white;
  color: #6c757d;
  border: 1px solid #dee2e6;
  padding: 10px 24px;
  border-radius: 10px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #f8f9fa;
}

/* Statistics */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.stat-icon-bg {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon-bg svg {
  width: 24px;
  height: 24px;
}

.stat-card.total .stat-icon-bg {
  background: #eff6ff;
  color: #3b82f6;
}

.stat-card.admin .stat-icon-bg {
  background: #fef2f2;
  color: #ef4444;
}

.stat-card.sales .stat-icon-bg {
  background: #f0fdf4;
  color: #10b981;
}

.stat-card.warehouse .stat-icon-bg {
  background: #ecfeff;
  color: #06b6d4;
}

.stat-card.deleted .stat-icon-bg {
  background: #fffbeb;
  color: #f59e0b;
}

.stat-card.locked .stat-icon-bg {
  background: #f3f4f6;
  color: #6b7280;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a2e;
  line-height: 1;
}

.stat-label {
  font-size: 13px;
  color: #6c757d;
  margin-top: 4px;
}

/* Filter Bar */
.filter-bar {
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
  display: flex;
  gap: 12px;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.search-wrapper {
  flex: 1;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: #9ca3af;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 48px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.filter-select {
  padding: 12px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  min-width: 180px;
}

.filter-select:focus {
  outline: none;
  border-color: #667eea;
}

/* Tabs */
.tabs-wrapper {
  display: flex;
  gap: 4px;
  margin-bottom: 24px;
  background: white;
  padding: 4px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.tab-button {
  flex: 1;
  padding: 12px 24px;
  border: none;
  background: transparent;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #6c757d;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
}

.tab-button.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.tab-button:hover:not(.active) {
  background: #f3f4f6;
}

.tab-icon {
  width: 18px;
  height: 18px;
}

.tab-badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.tab-button:not(.active) .tab-badge {
  background: #e5e7eb;
  color: #6c757d;
}

.tab-badge.danger {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.tab-button.active .tab-badge.danger {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

/* Loading */
.loading-container {
  text-align: center;
  padding: 80px 0;
  color: #6c757d;
}

.spinner {
  width: 48px;
  height: 48px;
  margin: 0 auto 16px;
  animation: spin 1s linear infinite;
}

.spinner svg {
  width: 100%;
  height: 100%;
  color: #667eea;
}

@keyframes spin {
  100% { transform: rotate(360deg); }
}

/* Tables */
.table-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.table-responsive {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead th {
  background: #f8f9fa;
  padding: 14px 20px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #6c757d;
  border-bottom: 2px solid #e5e7eb;
}

tbody td {
  padding: 16px 20px;
  border-bottom: 1px solid #f3f4f6;
  font-size: 14px;
}

tbody tr:hover {
  background: #f9fafb;
}

.deleted-row {
  opacity: 0.7;
}

.user-id {
  font-weight: 600;
  color: #667eea;
  font-size: 13px;
}

.user-id.deleted {
  color: #9ca3af;
  text-decoration: line-through;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  object-fit: cover;
}

.username-text {
  font-weight: 600;
  color: #1a1a2e;
}

.username-text.deleted {
  color: #9ca3af;
  text-decoration: line-through;
}

.fullname-text {
  font-weight: 500;
}

.email-text {
  color: #6c757d;
  font-size: 13px;
}

.date-text {
  color: #9ca3af;
  font-size: 13px;
}

/* Role Badges */
.role-badge {
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.role-admin {
  background: #fef2f2;
  color: #ef4444;
}

.role-sales {
  background: #f0fdf4;
  color: #10b981;
}

.role-warehouse {
  background: #ecfeff;
  color: #06b6d4;
}

.role-default {
  background: #f3f4f6;
  color: #6b7280;
}

/* Status Badges */
.status-badge {
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.active {
  background: #f0fdf4;
  color: #10b981;
}

.status-badge.locked {
  background: #fef2f2;
  color: #ef4444;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.action-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  background: transparent;
}

.action-btn svg {
  width: 18px;
  height: 18px;
}

.action-btn.view {
  color: #3b82f6;
}

.action-btn.view:hover {
  background: #eff6ff;
}

.action-btn.edit {
  color: #f59e0b;
}

.action-btn.edit:hover {
  background: #fffbeb;
}

.action-btn.delete {
  color: #ef4444;
}

.action-btn.delete:hover {
  background: #fef2f2;
}

.action-btn.lock {
  color: #f59e0b;
}

.action-btn.lock:hover {
  background: #fffbeb;
}

.action-btn.unlock {
  color: #10b981;
}

.action-btn.unlock:hover {
  background: #f0fdf4;
}

.action-btn.restore {
  background: #f0fdf4;
  color: #10b981;
  padding: 6px 12px;
  width: auto;
  font-size: 13px;
  font-weight: 500;
  gap: 4px;
}

.action-btn.restore:hover {
  background: #10b981;
  color: white;
}

.action-btn.permanent-delete {
  background: #fef2f2;
  color: #ef4444;
  padding: 6px 12px;
  width: auto;
  font-size: 13px;
  font-weight: 500;
  gap: 4px;
}

.action-btn.permanent-delete:hover {
  background: #ef4444;
  color: white;
}

/* Trash Actions */
.trash-alert {
  background: #fffbeb;
  border: 1px solid #fde68a;
  padding: 14px 20px;
  margin: 20px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #92400e;
  font-size: 14px;
}

.trash-alert svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.trash-actions {
  display: flex;
  gap: 12px;
  padding: 0 20px 20px;
  justify-content: flex-end;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #9ca3af;
}

.empty-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  color: #d1d5db;
}

.empty-state h3 {
  color: #6c757d;
  margin-bottom: 8px;
  font-size: 18px;
}

.empty-state p {
  font-size: 14px;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-overlay.show {
  display: flex;
}

.modal-dialog {
  width: 100%;
  max-width: 560px;
  margin: 20px;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-content {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
}

.modal-header {
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 600;
}

.modal-close {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  color: white;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.3);
}

.modal-close svg {
  width: 18px;
  height: 18px;
}

.modal-body {
  padding: 24px;
}

.modal-footer {
  padding: 20px 24px;
  background: #f8f9fa;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* Forms */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}

.required {
  color: #ef4444;
}

.form-input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input:disabled {
  background: #f3f4f6;
  color: #9ca3af;
}

.form-hint {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: #9ca3af;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

/* Password Default Box */
.password-default-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f8f9fa;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 8px 12px;
}

.password-display {
  flex: 1;
  font-family: monospace;
  font-size: 18px;
  font-weight: 600;
  color: #667eea;
  letter-spacing: 2px;
}

.btn-copy {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  color: #6c757d;
  transition: all 0.2s;
}

.btn-copy:hover {
  background: #e5e7eb;
  color: #667eea;
}

.btn-copy svg {
  width: 18px;
  height: 18px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  font-size: 14px;
  color: #374151;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #667eea;
}

/* Detail Modal */
.detail-avatar-section {
  text-align: center;
  margin-bottom: 24px;
}

.detail-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #667eea;
  margin-bottom: 12px;
}

.detail-avatar-section h4 {
  font-size: 18px;
  color: #1a1a2e;
  margin-bottom: 8px;
}

.detail-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 10px;
}

.info-label {
  font-size: 13px;
  color: #6c757d;
  font-weight: 500;
}

.info-value {
  font-size: 14px;
  color: #1a1a2e;
  font-weight: 500;
}

.info-value.highlight {
  color: #667eea;
  font-weight: 600;
}

/* Enhanced Pagination Styles */
.pagination-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-top: 1px solid #e9ecef;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  flex-wrap: wrap;
  gap: 16px;
  border-radius: 0 0 16px 16px;
}

.pagination-info {
  font-size: 14px;
  color: #495057;
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  padding: 6px 14px;
  border-radius: 20px;
  font-weight: 500;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.pagination {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.pagination-btn {
  min-width: 38px;
  height: 38px;
  padding: 0 10px;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
  font-size: 14px;
  font-weight: 500;
  color: #4b5563;
}

.pagination-btn svg {
  width: 16px;
  height: 16px;
  stroke-width: 2;
}

.pagination-btn:hover:not(:disabled):not(.dots) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: transparent;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.35);
}

.pagination-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: transparent;
  color: white;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
}

.pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
  background: #f3f4f6;
  border-color: #e5e7eb;
  color: #9ca3af;
}

.pagination-btn.dots {
  cursor: default;
  background: transparent;
  border: none;
  box-shadow: none;
  font-weight: 600;
  color: #6c757d;
  letter-spacing: 2px;
}

.pagination-btn.dots:hover {
  background: transparent;
  transform: none;
}

/* Page size selector */
.pagination-page-size {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #495057;
  background: white;
  padding: 4px 14px;
  border-radius: 20px;
  font-weight: 500;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.pagination-page-size span {
  color: #6c757d;
}

.pagination-page-size select {
  padding: 6px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  color: #4b5563;
  transition: all 0.2s ease;
  outline: none;
}

.pagination-page-size select:hover {
  border-color: #667eea;
}

.pagination-page-size select:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

/* Toast Message */
.toast-message {
  position: fixed;
  top: 24px;
  right: 24px;
  padding: 16px 24px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  z-index: 2000;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  animation: slideDown 0.3s ease;
  max-width: 400px;
}

.toast-message.success {
  background: #10b981;
  color: white;
}

.toast-message.error {
  background: #ef4444;
  color: white;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .user-management {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .filter-bar {
    flex-direction: column;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .pagination-wrapper {
    flex-direction: column;
    align-items: stretch;
    padding: 16px;
  }
  
  .pagination-info {
    justify-content: center;
  }
  
  .pagination {
    justify-content: center;
  }
  
  .pagination-btn {
    min-width: 34px;
    height: 34px;
    font-size: 13px;
  }
  
  .pagination-page-size {
    justify-content: center;
  }
  
  .action-buttons {
    flex-wrap: wrap;
  }
  
  .action-btn {
    width: 32px;
    height: 32px;
  }
}

/* ✅ Thêm style cho role tab content */
.role-tab-content {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  padding: 0;
}

.role-tab-content :deep(.role-management) {
  padding: 0;
  background: white;
}

.role-tab-content :deep(.page-header) {
  margin-bottom: 0;
  border-radius: 16px 16px 0 0;
}

.role-tab-content :deep(.table-card) {
  border-radius: 0 0 16px 16px;
  box-shadow: none;
}
</style>