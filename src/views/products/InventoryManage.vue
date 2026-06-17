<template>
  <div class="inventory-management">
    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">Quản lý tồn kho</h1>
        <p class="page-subtitle">Theo dõi và quản lý hàng hóa trong kho</p>
      </div>
      <div class="header-actions">
        <a-button class="btn-export" @click="openExportModal">
          <span class="btn-icon">▣</span>
          Tạo phiếu xuất kho
        </a-button>
        <a-button class="btn-import" @click="showReceiptModal=true">
          <span class="btn-icon">▤</span>
          Tạo phiếu nhập hàng
        </a-button>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="stats-grid">
      <div class="stat-card stat-total">
        <div class="stat-icon">◈</div>
        <div class="stat-content">
          <div class="stat-label">Tổng sản phẩm</div>
          <div class="stat-value">{{ products.length }}</div>
        </div>
      </div>
      <div class="stat-card stat-instock">
        <div class="stat-icon">●</div>
        <div class="stat-content">
          <div class="stat-label">Còn hàng</div>
          <div class="stat-value">{{ products.filter(p=>p.stockQuantity>0).length }}</div>
        </div>
      </div>
      <div class="stat-card stat-lowstock">
        <div class="stat-icon">◉</div>
        <div class="stat-content">
          <div class="stat-label">Sắp hết hàng</div>
          <div class="stat-value">{{ lowStockCount }}</div>
        </div>
      </div>
      <div class="stat-card stat-pending">
        <div class="stat-icon">◌</div>
        <div class="stat-content">
          <div class="stat-label">Chờ phê duyệt</div>
          <div class="stat-value">{{ pendingImportCount }}</div>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs-container">
      <div class="tabs-wrapper">
        <button 
          v-for="tab in tabs" 
          :key="tab.key"
          class="tab-button"
          :class="{ active: activeTab === tab.key }"
          @click="switchTab(tab.key)"
        >
          <span class="tab-icon">{{ tab.icon }}</span>
          {{ tab.label }}
          <span v-if="tab.key === 'alerts' && alertCount > 0" class="tab-badge">{{ alertCount }}</span>
        </button>
      </div>
    </div>

    <!-- Tab Content -->
    <div class="tab-content">
      <!-- Stock Tab -->
      <div v-if="activeTab === 'stock'" class="content-panel">
        <div v-if="error" class="error-message">
          <span class="error-icon">!</span>
          {{ error }}
        </div>
        <div class="table-wrapper">
          <a-table 
            :columns="stockColumns" 
            :data-source="products"
            :loading="{ spinning: loading, tip: 'Đang tải dữ liệu...' }"
            row-key="id" 
            :pagination="{ pageSize: 8, showSizeChanger: true, showQuickJumper: true }"
            :locale="{ emptyText: 'Không có dữ liệu' }"
            bordered
            class="custom-table"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.dataIndex === 'code'">
                <span class="product-code">{{ record.code }}</span>
              </template>
              <template v-else-if="column.dataIndex === 'stockQuantity'">
                <span class="stock-quantity" :class="{
                  'stock-critical': record.stockQuantity === 0,
                  'stock-low': record.isLowStock && record.stockQuantity > 0,
                  'stock-normal': !record.isLowStock && record.stockQuantity > 0
                }">{{ record.stockQuantity }}</span>
              </template>
              <template v-else-if="column.dataIndex === 'salePrice'">
                <span class="price-text">{{ formatPrice(record.salePrice) }}</span>
              </template>
              <template v-else-if="column.dataIndex === 'status'">
                <span class="status-badge" :class="{
                  'status-out': record.stockQuantity === 0,
                  'status-low': record.isLowStock && record.stockQuantity > 0,
                  'status-ok': !record.isLowStock && record.stockQuantity > 0
                }">
                  {{ record.stockQuantity === 0 ? 'Hết hàng' : record.isLowStock ? 'Sắp hết' : 'Còn hàng' }}
                </span>
              </template>
              <template v-else>{{ record[column.dataIndex] }}</template>
            </template>
          </a-table>
        </div>
      </div>

      <!-- Imports Tab -->
      <div v-if="activeTab === 'imports'" class="content-panel">
        <div class="table-wrapper">
          <a-table 
            :columns="receiptColumns" 
            :data-source="receipts"
            row-key="id" 
            :pagination="{ pageSize: 8, showSizeChanger: true, showQuickJumper: true }"
            :locale="{ emptyText: 'Chưa có phiếu nhập' }"
            bordered
            class="custom-table"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.dataIndex === 'receiptCode'">
                <span class="link-code" @click="viewReceipt(record)">{{ record.receiptCode }}</span>
              </template>
              <template v-else-if="column.dataIndex === 'supplierName'">
                <div class="supplier-info">
                  <div class="supplier-name">{{ record.supplierName || '—' }}</div>
                  <div class="supplier-tax">MST: {{ record.supplierTaxCode || '—' }}</div>
                </div>
              </template>
              <template v-else-if="column.dataIndex === 'receiptDate'">
                {{ formatDate(record.receiptDate) }}
              </template>
              <template v-else-if="column.dataIndex === 'itemCount'">
                <span class="item-count">{{ record.items?.length || 0 }} mặt hàng</span>
              </template>
              <template v-else-if="column.dataIndex === 'totalValue'">
                <span class="price-highlight">{{ formatPrice(totalReceiptValue(record)) }}</span>
              </template>
              <template v-else-if="column.dataIndex === 'status'">
                <span class="status-badge" :class="`status-${importStatusColor(record.status)}`">
                  {{ importStatusLabel(record.status) }}
                </span>
              </template>
              <template v-else-if="column.dataIndex === 'returnDeadline'">
                <template v-if="record.status === 'Imported' && record.confirmedAt">
                  <div v-if="returnTimeLeft(record.confirmedAt) > 0" class="return-timer">
                    Còn {{ returnTimeLeft(record.confirmedAt) }}h
                  </div>
                  <div v-else class="return-expired">Hết hạn</div>
                </template>
                <span v-else class="text-muted">—</span>
              </template>
              <template v-else-if="column.dataIndex === 'actions'">
                <div class="action-buttons">
                  <a-button size="small" class="btn-view" @click="viewReceipt(record)">Xem</a-button>
                  <a-button
                    v-if="['Pending','PendingApproval'].includes(record.status)"
                    size="small"
                    class="btn-approve"
                    @click="approveImport(record)"
                  >
                    Phê duyệt
                  </a-button>
                  <a-button
                    v-if="record.status === 'Approved'"
                    size="small"
                    class="btn-confirm"
                    @click="confirmImport(record)"
                  >
                    Nhập kho
                  </a-button>
                  <a-button
                    v-if="['Imported','Confirmed'].includes(record.status) && returnTimeLeft(record.confirmedAt) > 0"
                    size="small"
                    class="btn-return"
                    @click="returnImport(record)"
                  >
                    Hoàn hàng
                  </a-button>
                </div>
              </template>
              <template v-else>{{ record[column.dataIndex] }}</template>
            </template>
          </a-table>
        </div>
      </div>

      <!-- Exports Tab -->
      <div v-if="activeTab === 'exports'" class="content-panel">
        <div class="table-wrapper">
          <a-table 
            :columns="exportColumns" 
            :data-source="exports"
            row-key="id" 
            :pagination="{ pageSize: 8, showSizeChanger: true, showQuickJumper: true }"
            :locale="{ emptyText: 'Chưa có phiếu xuất' }"
            bordered
            class="custom-table"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.dataIndex === 'exportCode'">
                <span class="link-code" @click="viewExport(record)">{{ record.exportCode }}</span>
              </template>
              <template v-else-if="column.dataIndex === 'customerInfo'">
                <div class="customer-info">
                  <div class="customer-name">{{ record.customerName || '—' }}</div>
                  <div class="customer-phone">{{ record.customerPhone || '' }}</div>
                </div>
              </template>
              <template v-else-if="column.dataIndex === 'orderCode'">
                <span class="order-code">{{ record.orderCode || '—' }}</span>
              </template>
              <template v-else-if="column.dataIndex === 'exportDate'">
                {{ formatDate(record.exportDate) }}
              </template>
              <template v-else-if="column.dataIndex === 'itemCount'">
                <span class="item-count">{{ record.items?.length || 0 }} mặt hàng</span>
              </template>
              <template v-else-if="column.dataIndex === 'totalValue'">
                <span class="price-highlight export-price">{{ formatPrice(totalExportValue(record)) }}</span>
              </template>
              <template v-else-if="column.dataIndex === 'status'">
                <span class="status-badge" :class="`status-${exportStatusColor(record.status)}`">
                  {{ exportStatusLabel(record.status) }}
                </span>
              </template>
              <template v-else-if="column.dataIndex === 'actions'">
                <div class="action-buttons">
                  <a-button size="small" class="btn-view" @click="viewExport(record)">Xem</a-button>
                  <a-button 
                    v-if="record.status === 'PendingConfirm'" 
                    size="small"
                    class="btn-export-confirm"
                    @click="confirmExport(record)"
                  >
                    Xác nhận xuất
                  </a-button>
                  <span v-else-if="record.status === 'Exported'" class="text-muted small">Đã xuất kho</span>
                </div>
              </template>
              <template v-else>{{ record[column.dataIndex] }}</template>
            </template>
          </a-table>
        </div>
      </div>

      <!-- Alerts Tab -->
      <div v-if="activeTab === 'alerts'" class="content-panel">
        <div v-if="alerts.length === 0" class="empty-state success">
          <span class="empty-icon">✓</span>
          <span class="empty-text">Tất cả sản phẩm đều đủ hàng</span>
        </div>
        <div v-else>
          <div class="alert-summary">
            <div class="alert-card alert-danger">
              <div class="alert-label">Hết hàng</div>
              <div class="alert-number">{{ alerts.filter(a => a.status === 'out_of_stock').length }}</div>
            </div>
            <div class="alert-card alert-warning">
              <div class="alert-label">Sắp hết</div>
              <div class="alert-number">{{ alerts.filter(a => a.status === 'low_stock').length }}</div>
            </div>
          </div>
          <div class="table-wrapper">
            <a-table 
              :columns="alertColumns" 
              :data-source="alerts" 
              row-key="id" 
              :pagination="{ pageSize: 8, showSizeChanger: true, showQuickJumper: true }"
              bordered
              class="custom-table"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.dataIndex === 'code'">
                  <span class="product-code">{{ record.code }}</span>
                </template>
                <template v-else-if="column.dataIndex === 'stockQuantity'">
                  <span class="stock-quantity" :class="{
                    'stock-critical': record.status === 'out_of_stock',
                    'stock-low': record.status === 'low_stock'
                  }">{{ record.stockQuantity }}</span>
                </template>
                <template v-else-if="column.dataIndex === 'status'">
                  <span class="status-badge" :class="record.status === 'out_of_stock' ? 'status-out' : 'status-low'">
                    {{ record.status === 'out_of_stock' ? 'Hết hàng' : 'Sắp hết' }}
                  </span>
                </template>
                <template v-else-if="column.dataIndex === 'needImport'">
                  <span class="need-import">+{{ record.minStockThreshold - record.stockQuantity + 10 }}</span>
                </template>
                <template v-else>{{ record[column.dataIndex] }}</template>
              </template>
            </a-table>
          </div>
        </div>
      </div>
    </div>

    <!-- Receipt Modal -->
    <div v-if="showReceiptModal" class="modal-overlay" @click.self="closeReceiptModal">
      <div class="modal-container modal-lg">
        <div class="modal-header modal-header-import">
          <div class="modal-title-wrapper">
            <span class="modal-icon">▤</span>
            <div>
              <h3 class="modal-title">Tạo phiếu nhập hàng</h3>
              <p class="modal-subtitle">Nhập thông tin hàng hóa từ nhà cung cấp</p>
            </div>
          </div>
          <button class="modal-close" @click="closeReceiptModal">×</button>
        </div>

        <div class="modal-body">
          <div class="form-section">
            <div class="form-section-title">
              <span class="section-icon">◈</span>
              Thông tin nhà cung cấp
            </div>
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label required">Tên nhà cung cấp</label>
                <input v-model="receiptForm.supplierName" placeholder="VD: Công ty TNHH ABC" class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label required">Mã số thuế</label>
                <input v-model="receiptForm.supplierTaxCode" placeholder="VD: 0123456789" class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label">Trạng thái</label>
                <select v-model="receiptForm.supplierStatus" class="form-select">
                  <option value="Active">Đang hợp tác</option>
                  <option value="Inactive">Ngừng hợp tác</option>
                  <option value="Suspended">Tạm ngừng</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Ghi chú</label>
                <input v-model="receiptForm.note" placeholder="Ghi chú thêm..." class="form-input" />
              </div>
            </div>
          </div>

          <div class="info-banner info-banner-warning">
            <span class="banner-icon">◉</span>
            <span>Sau khi tạo, phiếu sẽ ở trạng thái <strong>Chờ phê duyệt</strong>. Admin/Thủ kho cần phê duyệt trước khi nhập hàng vào kho.</span>
          </div>

          <div class="form-section">
            <div class="form-section-title">
              <span class="section-icon">▣</span>
              Danh sách hàng nhập
              <button class="btn-add-item" @click="addReceiptItem">+ Thêm mặt hàng</button>
            </div>

            <div v-for="(item, idx) in receiptForm.items" :key="idx" class="item-card">
              <div class="item-header">
                <span class="item-number">Mặt hàng {{ idx + 1 }}</span>
                <button class="btn-remove-item" @click="removeReceiptItem(idx)">×</button>
              </div>
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label required">Tên sản phẩm</label>
                  <input v-model="item.productName" placeholder="VD: Laptop Dell XPS 15" class="form-input" />
                </div>
                <div class="form-group">
                  <label class="form-label required">Mã sản phẩm</label>
                  <input v-model="item.productCode" placeholder="VD: SP001" class="form-input" />
                </div>
                <div class="form-group">
                  <label class="form-label required">Số lượng</label>
                  <input v-model="item.quantity" type="number" min="1" class="form-input" />
                </div>
                <div class="form-group">
                  <label class="form-label required">Giá nhập (VNĐ)</label>
                  <input v-model="item.unitCostPrice" type="number" class="form-input" />
                  <span class="form-hint">{{ formatPrice(item.unitCostPrice) }}</span>
                </div>
                <div class="form-group">
                  <label class="form-label">Giá bán (VNĐ)</label>
                  <input v-model="item.salePrice" type="number" class="form-input" />
                  <span class="form-hint sale-hint">{{ formatPrice(item.salePrice) }}</span>
                </div>
                <div class="form-group">
                  <label class="form-label">Danh mục</label>
                  <div class="category-select-wrapper">
                    <select v-model="item.categoryId" class="form-select">
                      <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                    </select>
                    <button class="btn-add-category" @click="openAddCategory">+</button>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="receiptForm.items.length === 0" class="empty-items">
              <span class="empty-icon">◻</span>
              <span>Nhấn "+ Thêm mặt hàng" để bắt đầu</span>
            </div>
          </div>

          <div v-if="receiptForm.items.length > 0" class="summary-bar import-summary">
            <span>Tổng số lượng: <strong>{{ totalQty }}</strong> sản phẩm</span>
            <span class="summary-total">Tổng giá trị: <strong>{{ formatPrice(totalReceiptFormValue) }}</strong></span>
          </div>

          <div v-if="receiptError" class="error-message">{{ receiptError }}</div>
        </div>

        <div class="modal-footer">
          <button class="btn-cancel" @click="closeReceiptModal">Hủy</button>
          <button class="btn-submit btn-submit-import" @click="saveReceipt" :disabled="savingReceipt">
            {{ savingReceipt ? 'Đang tạo...' : 'Tạo phiếu nhập' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Receipt Detail Modal -->
    <div v-if="selectedReceipt" class="modal-overlay" @click.self="selectedReceipt=null">
      <div class="modal-container modal-lg">
        <div class="modal-header modal-header-import-detail">
          <div class="modal-title-wrapper">
            <span class="modal-icon">◈</span>
            <div>
              <h3 class="modal-title">Chi tiết phiếu nhập</h3>
              <p class="modal-subtitle">{{ selectedReceipt.receiptCode }}</p>
            </div>
          </div>
          <button class="modal-close" @click="selectedReceipt=null">×</button>
        </div>

        <div class="modal-body">
          <div class="detail-grid">
            <div class="detail-item">
              <div class="detail-label">Mã phiếu</div>
              <div class="detail-value highlight-blue">{{ selectedReceipt.receiptCode }}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Ngày tạo</div>
              <div class="detail-value">{{ formatDate(selectedReceipt.receiptDate) }}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Nhà cung cấp</div>
              <div class="detail-value">{{ selectedReceipt.supplierName || '—' }}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Mã số thuế</div>
              <div class="detail-value">{{ selectedReceipt.supplierTaxCode || '—' }}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Trạng thái</div>
              <span class="status-badge" :class="`status-${importStatusColor(selectedReceipt.status)}`">
                {{ importStatusLabel(selectedReceipt.status) }}
              </span>
            </div>
            <div class="detail-item">
              <div class="detail-label">Ghi chú</div>
              <div class="detail-value">{{ selectedReceipt.note || '—' }}</div>
            </div>
          </div>

          <div v-if="selectedReceipt.status === 'Imported' && selectedReceipt.confirmedAt" class="return-info">
            <div v-if="returnTimeLeft(selectedReceipt.confirmedAt) > 0" class="return-active">
              <span class="return-icon">◉</span>
              Còn <strong>{{ returnTimeLeft(selectedReceipt.confirmedAt) }} giờ</strong> để hoàn hàng
            </div>
            <div v-else class="return-expired-info">Đã hết thời hạn 24h hoàn hàng</div>
          </div>

          <div class="detail-items-section">
            <div class="detail-items-header">
              <span>Danh sách mặt hàng ({{ selectedReceipt.items?.length || 0 }})</span>
            </div>
            <div class="detail-table-wrapper">
              <table class="detail-table">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Tên sản phẩm</th>
                    <th class="text-center">Số lượng</th>
                    <th class="text-right">Giá nhập</th>
                    <th class="text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, idx) in selectedReceipt.items" :key="idx">
                    <td>{{ idx + 1 }}</td>
                    <td class="product-name">{{ item.productName }}</td>
                    <td class="text-center quantity">{{ item.quantity }}</td>
                    <td class="text-right">{{ formatPrice(item.unitCostPrice) }}</td>
                    <td class="text-right price-total">{{ formatPrice(item.quantity * item.unitCostPrice) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="detail-summary import-detail-summary">
              <span>Tổng: {{ selectedReceipt.items?.reduce((s,i) => s + i.quantity, 0) }} sản phẩm</span>
              <span class="summary-total">{{ formatPrice(totalReceiptValue(selectedReceipt)) }}</span>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <div class="footer-actions">
            <a-button 
              v-if="['Pending','PendingApproval'].includes(selectedReceipt.status)"
              class="btn-approve" 
              @click="approveImport(selectedReceipt); selectedReceipt=null"
            >
              Phê duyệt phiếu
            </a-button>
            <a-button 
              v-if="selectedReceipt.status === 'Approved'"
              class="btn-confirm" 
              @click="confirmImport(selectedReceipt); selectedReceipt=null"
            >
              Xác nhận nhập kho
            </a-button>
            <a-button 
              v-if="['Imported','Confirmed'].includes(selectedReceipt.status) && returnTimeLeft(selectedReceipt.confirmedAt) > 0"
              class="btn-return" 
              @click="returnImport(selectedReceipt); selectedReceipt=null"
            >
              Hoàn hàng
            </a-button>
          </div>
          <button class="btn-close-detail" @click="selectedReceipt=null">Đóng</button>
        </div>
      </div>
    </div>

    <!-- Export Modal -->
    <div v-if="showExportModal" class="modal-overlay" @click.self="closeExportModal">
      <div class="modal-container modal-lg">
        <div class="modal-header modal-header-export">
          <div class="modal-title-wrapper">
            <span class="modal-icon">▣</span>
            <div>
              <h3 class="modal-title">Tạo phiếu xuất kho</h3>
              <p class="modal-subtitle">Xuất hàng cho khách hàng hoặc đơn hàng</p>
            </div>
          </div>
          <button class="modal-close" @click="closeExportModal">×</button>
        </div>

        <div class="modal-body">
          <div class="form-section">
            <div class="form-section-title">
              <span class="section-icon">◈</span>
              Thông tin khách hàng
            </div>
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label required">Tên khách hàng</label>
                <input v-model="exportForm.customerName" placeholder="VD: Nguyễn Văn A" class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label required">Số điện thoại</label>
                <input v-model="exportForm.customerPhone" placeholder="VD: 0901234567" class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label">Mã đơn hàng</label>
                <input v-model="exportForm.orderCode" placeholder="Để trống nếu tạo thủ công" class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label">Ghi chú</label>
                <input v-model="exportForm.note" placeholder="Ghi chú thêm..." class="form-input" />
              </div>
            </div>
          </div>

          <div class="info-banner info-banner-export">
            <span class="banner-icon">◉</span>
            <span>Sau khi tạo, phiếu sẽ ở trạng thái <strong>Chờ xác nhận</strong>. Hàng chỉ bị trừ khỏi kho khi phiếu được xác nhận xuất.</span>
          </div>

          <div class="form-section">
            <div class="form-section-title">
              <span class="section-icon">▣</span>
              Danh sách hàng xuất
              <button class="btn-add-item btn-add-export" @click="addExportItem">+ Thêm mặt hàng</button>
            </div>

            <div v-for="(item, idx) in exportForm.items" :key="idx" class="item-card">
              <div class="item-header">
                <span class="item-number">Mặt hàng {{ idx + 1 }}</span>
                <button class="btn-remove-item" @click="removeExportItem(idx)">×</button>
              </div>
              <div class="form-grid">
                <div class="form-group full-width">
                  <label class="form-label required">Sản phẩm</label>
                  <select v-model="item.productId" @change="onExportProductSelect(item)" class="form-select">
                    <option value="">Chọn sản phẩm trong kho</option>
                    <option v-for="p in products" :key="p.id" :value="p.id">
                      {{ p.code }} — {{ p.name }} (Tồn: {{ p.stockQuantity }})
                    </option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label required">Số lượng</label>
                  <input v-model="item.quantity" type="number" min="1" :max="item.availableStock || undefined" class="form-input" />
                  <span v-if="item.availableStock !== undefined" class="form-hint">
                    Tồn kho: {{ item.availableStock }}
                  </span>
                </div>
                <div class="form-group">
                  <label class="form-label">Giá bán (VNĐ)</label>
                  <input v-model="item.unitSalePrice" type="number" class="form-input" />
                  <span class="form-hint sale-hint">{{ formatPrice(item.unitSalePrice) }}</span>
                </div>
              </div>
            </div>

            <div v-if="exportForm.items.length === 0" class="empty-items">
              <span class="empty-icon">◻</span>
              <span>Nhấn "+ Thêm mặt hàng" để bắt đầu</span>
            </div>
          </div>

          <div v-if="exportForm.items.length > 0" class="summary-bar export-summary">
            <span>Tổng số lượng: <strong>{{ totalExportQty }}</strong> sản phẩm</span>
            <span class="summary-total">Tổng giá trị: <strong>{{ formatPrice(totalExportFormValue) }}</strong></span>
          </div>

          <div v-if="exportError" class="error-message">{{ exportError }}</div>
        </div>

        <div class="modal-footer">
          <button class="btn-cancel" @click="closeExportModal">Hủy</button>
          <button class="btn-submit btn-submit-export" @click="saveExport" :disabled="savingExport">
            {{ savingExport ? 'Đang tạo...' : 'Tạo phiếu xuất' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Export Detail Modal -->
    <div v-if="selectedExport" class="modal-overlay" @click.self="selectedExport=null">
      <div class="modal-container modal-lg">
        <div class="modal-header modal-header-export-detail">
          <div class="modal-title-wrapper">
            <span class="modal-icon">◈</span>
            <div>
              <h3 class="modal-title">Chi tiết phiếu xuất</h3>
              <p class="modal-subtitle">{{ selectedExport.exportCode }}</p>
            </div>
          </div>
          <button class="modal-close" @click="selectedExport=null">×</button>
        </div>

        <div class="modal-body">
          <div class="detail-grid">
            <div class="detail-item">
              <div class="detail-label">Mã phiếu xuất</div>
              <div class="detail-value highlight-purple">{{ selectedExport.exportCode }}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Mã đơn hàng</div>
              <div class="detail-value">{{ selectedExport.orderCode || '—' }}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Khách hàng</div>
              <div class="detail-value">{{ selectedExport.customerName || '—' }}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Số điện thoại</div>
              <div class="detail-value">{{ selectedExport.customerPhone || '—' }}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Ngày tạo</div>
              <div class="detail-value">{{ formatDate(selectedExport.exportDate) }}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Trạng thái</div>
              <span class="status-badge" :class="`status-${exportStatusColor(selectedExport.status)}`">
                {{ exportStatusLabel(selectedExport.status) }}
              </span>
            </div>
          </div>

          <div class="detail-items-section">
            <div class="detail-items-header">
              <span>Danh sách mặt hàng ({{ selectedExport.items?.length || 0 }})</span>
            </div>
            <div class="detail-table-wrapper">
              <table class="detail-table">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Tên sản phẩm</th>
                    <th class="text-center">Số lượng</th>
                    <th class="text-right">Giá bán</th>
                    <th class="text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, idx) in selectedExport.items" :key="idx">
                    <td>{{ idx + 1 }}</td>
                    <td class="product-name">{{ item.productName }}</td>
                    <td class="text-center quantity">{{ item.quantity }}</td>
                    <td class="text-right">{{ formatPrice(item.unitSalePrice) }}</td>
                    <td class="text-right price-total export-price-total">{{ formatPrice(item.quantity * item.unitSalePrice) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="detail-summary export-detail-summary">
              <span>Tổng: {{ selectedExport.items?.reduce((s,i) => s + i.quantity, 0) }} sản phẩm</span>
              <span class="summary-total">{{ formatPrice(totalExportValue(selectedExport)) }}</span>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <div class="footer-actions">
            <a-button 
              v-if="selectedExport.status === 'PendingConfirm'"
              class="btn-export-confirm" 
              @click="confirmExport(selectedExport); selectedExport=null"
            >
              Xác nhận xuất kho
            </a-button>
          </div>
          <button class="btn-close-detail" @click="selectedExport=null">Đóng</button>
        </div>
      </div>
    </div>

    <!-- Category Modal -->
    <div v-if="showCategoryModal" class="modal-overlay" @click.self="showCategoryModal=false">
      <div class="modal-container">
        <div class="modal-header modal-header-category">
          <div class="modal-title-wrapper">
            <span class="modal-icon">◈</span>
            <div>
              <h3 class="modal-title">Thêm danh mục mới</h3>
            </div>
          </div>
          <button class="modal-close" @click="showCategoryModal=false">×</button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label class="form-label required">Tên danh mục</label>
            <input v-model="newCategory.name" placeholder="VD: Quần áo, Đồ gia dụng..." class="form-input" @keyup.enter="saveCategory" />
          </div>
          <div class="form-group">
            <label class="form-label">Mô tả</label>
            <input v-model="newCategory.description" placeholder="Mô tả ngắn..." class="form-input" />
          </div>
          <div v-if="categoryError" class="error-message">{{ categoryError }}</div>
        </div>

        <div class="modal-footer">
          <button class="btn-cancel" @click="showCategoryModal=false">Hủy</button>
          <button class="btn-submit btn-submit-category" @click="saveCategory" :disabled="savingCategory">
            {{ savingCategory ? 'Đang lưu...' : 'Lưu danh mục' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { productApi } from '../../api/axios.js'

// ── State chung ──
const products   = ref([])
const receipts   = ref([])
const exports    = ref([])
const alerts     = ref([])
const alertCount = ref(0)
const loading    = ref(false)
const error      = ref('')
const activeTab  = ref('stock')

// ── Tabs configuration ──
const tabs = [
  { key: 'stock', label: 'Tồn kho', icon: '◈' },
  { key: 'imports', label: 'Phiếu nhập', icon: '▤' },
  { key: 'exports', label: 'Phiếu xuất', icon: '▣' },
  { key: 'alerts', label: 'Cảnh báo', icon: '◉' }
]

// ── Phiếu nhập ──
const showReceiptModal = ref(false)
const savingReceipt    = ref(false)
const receiptError     = ref('')
const selectedReceipt  = ref(null)
const receiptForm      = ref({
  supplierName: '',
  supplierTaxCode: '',
  supplierStatus: 'Active',
  note: '',
  items: []
})

// ── Phiếu xuất ──
const selectedExport  = ref(null)
const showExportModal = ref(false)
const savingExport    = ref(false)
const exportError     = ref('')
const exportForm      = ref({
  customerName: '',
  customerPhone: '',
  orderCode: '',
  note: '',
  items: []
})

// ── Danh mục ──
const categories        = ref([])
const showCategoryModal = ref(false)
const savingCategory    = ref(false)
const categoryError     = ref('')
const newCategory       = ref({ name: '', description: '' })

// ── Computed ──
const lowStockCount = computed(() => products.value.filter(p => p.isLowStock).length)
const pendingImportCount = computed(() =>
  receipts.value.filter(r => ['Pending', 'PendingApproval'].includes(r.status)).length
)

const totalReceiptFormValue = computed(() =>
  receiptForm.value.items.reduce((s, i) => s + ((i.quantity || 0) * (i.unitCostPrice || 0)), 0))

const totalQty = computed(() =>
  receiptForm.value.items.reduce((s, i) => s + (parseInt(i.quantity) || 0), 0))

const totalExportFormValue = computed(() =>
  exportForm.value.items.reduce((s, i) => s + ((i.quantity || 0) * (i.unitSalePrice || 0)), 0))

const totalExportQty = computed(() =>
  exportForm.value.items.reduce((s, i) => s + (parseInt(i.quantity) || 0), 0))

// ── Helpers ──
const formatPrice = (val) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0)

const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '—'

const totalReceiptValue = (r) =>
  (r.items || []).reduce((s, i) => s + (i.quantity * i.unitCostPrice), 0)

const totalExportValue = (r) =>
  (r.items || []).reduce((s, i) => s + (i.quantity * i.unitSalePrice), 0)

const returnTimeLeft = (confirmedAt) => {
  if (!confirmedAt) return 0
  const deadline = new Date(confirmedAt).getTime() + 24 * 60 * 60 * 1000
  const left = Math.floor((deadline - Date.now()) / (60 * 60 * 1000))
  return Math.max(0, left)
}

// ── Switch tab ──
const switchTab = (key) => {
  activeTab.value = key
  if (key === 'imports') loadReceipts()
  if (key === 'exports') loadExports()
  if (key === 'alerts') loadAlerts()
}

// ── Status helpers phiếu nhập ──
const importStatusLabel = (status) => ({
  Pending:         'Chờ phê duyệt',
  PendingApproval: 'Chờ phê duyệt',
  Approved:        'Đã phê duyệt',
  Imported:        'Đã nhập kho',
  Confirmed:       'Đã nhập kho',
  Returned:        'Đã hoàn hàng',
}[status] || status)

const importStatusColor = (status) => ({
  Pending:         'warning',
  PendingApproval: 'warning',
  Approved:        'processing',
  Imported:        'success',
  Confirmed:       'success',
  Returned:        'error',
}[status] || 'default')

// ── Status helpers phiếu xuất ──
const exportStatusLabel = (status) => ({
  PendingConfirm: 'Chờ xác nhận',
  Exported:       'Đã xuất kho',
  Cancelled:      'Đã hủy',
}[status] || status)

const exportStatusColor = (status) => ({
  PendingConfirm: 'warning',
  Exported:       'success',
  Cancelled:      'error',
}[status] || 'default')

// ── Columns ──
const stockColumns = [
  { title: 'Mã SP', dataIndex: 'code', key: 'code', sorter: (a,b) => (a.code||'').localeCompare(b.code||'') },
  { title: 'Tên sản phẩm', dataIndex: 'name', key: 'name', sorter: (a,b) => (a.name||'').localeCompare(b.name||'') },
  { title: 'Tồn kho', dataIndex: 'stockQuantity', key: 'stockQuantity', align: 'center', sorter: (a,b) => a.stockQuantity - b.stockQuantity },
  { title: 'Ngưỡng cảnh báo', dataIndex: 'minStockThreshold', key: 'minStockThreshold', align: 'center' },
  { title: 'Giá bán', dataIndex: 'salePrice', key: 'salePrice', align: 'right' },
  { title: 'Trạng thái', dataIndex: 'status', key: 'status', align: 'center' },
]

const receiptColumns = [
  { title: 'Mã phiếu', dataIndex: 'receiptCode', key: 'receiptCode' },
  { title: 'Nhà cung cấp', dataIndex: 'supplierName', key: 'supplierName' },
  { title: 'Ngày tạo', dataIndex: 'receiptDate', key: 'receiptDate' },
  { title: 'Số mặt hàng', dataIndex: 'itemCount', key: 'itemCount', align: 'center' },
  { title: 'Tổng giá trị', dataIndex: 'totalValue', key: 'totalValue', align: 'right' },
  { title: 'Trạng thái', dataIndex: 'status', key: 'status', align: 'center' },
  { title: 'Hoàn hàng', dataIndex: 'returnDeadline', key: 'returnDeadline', align: 'center' },
  { title: 'Thao tác', dataIndex: 'actions', key: 'actions', align: 'center' },
]

const exportColumns = [
  { title: 'Mã phiếu', dataIndex: 'exportCode', key: 'exportCode' },
  { title: 'Đơn hàng', dataIndex: 'orderCode', key: 'orderCode' },
  { title: 'Khách hàng', dataIndex: 'customerInfo', key: 'customerInfo' },
  { title: 'Ngày tạo', dataIndex: 'exportDate', key: 'exportDate' },
  { title: 'Số mặt hàng', dataIndex: 'itemCount', key: 'itemCount', align: 'center' },
  { title: 'Tổng giá trị', dataIndex: 'totalValue', key: 'totalValue', align: 'right' },
  { title: 'Trạng thái', dataIndex: 'status', key: 'status', align: 'center' },
  { title: 'Thao tác', dataIndex: 'actions', key: 'actions', align: 'center' },
]

const alertColumns = [
  { title: 'Mã SP', dataIndex: 'code', key: 'code' },
  { title: 'Tên sản phẩm', dataIndex: 'name', key: 'name' },
  { title: 'Tồn kho', dataIndex: 'stockQuantity', key: 'stockQuantity', align: 'center' },
  { title: 'Ngưỡng tối thiểu', dataIndex: 'minStockThreshold', key: 'minStockThreshold', align: 'center' },
  { title: 'Trạng thái', dataIndex: 'status', key: 'status', align: 'center' },
  { title: 'Cần nhập thêm', dataIndex: 'needImport', key: 'needImport', align: 'center' },
]

// ── API Calls ──
const loadProducts = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await productApi.get('/products')
    products.value = res.data
  } catch {
    error.value = 'Không thể tải dữ liệu kho!'
  } finally {
    loading.value = false
  }
}

const loadReceipts = async () => {
  try {
    const res = await productApi.get('/imports')
    receipts.value = res.data
  } catch (e) {
    console.error('Lỗi tải phiếu nhập:', e)
    receipts.value = []
  }
}

const loadExports = async () => {
  try {
    const res = await productApi.get('/exports')
    exports.value = res.data
  } catch (e) {
    console.error('Lỗi tải phiếu xuất:', e)
    exports.value = []
  }
}

const loadAlerts = async () => {
  try {
    const res = await productApi.get('/alerts')
    alerts.value     = res.data.items || []
    alertCount.value = res.data.total || 0
  } catch {
    alerts.value = []
  }
}

const loadCategories = async () => {
  try {
    const res = await productApi.get('/categories')
    categories.value = res.data
  } catch {}
}

// ── Phiếu nhập ──
const addReceiptItem = () =>
  receiptForm.value.items.push({
    productName: '', productCode: '', quantity: 1,
    unitCostPrice: 0, salePrice: 0,
    categoryId: categories.value[0]?.id || null
  })

const removeReceiptItem = (idx) => receiptForm.value.items.splice(idx, 1)

const saveReceipt = async () => {
  receiptError.value = ''
  if (!receiptForm.value.supplierName || !receiptForm.value.supplierTaxCode) {
    receiptError.value = 'Vui lòng nhập thông tin nhà cung cấp!'
    return
  }
  if (receiptForm.value.items.length === 0) {
    receiptError.value = 'Vui lòng thêm ít nhất một mặt hàng!'
    return
  }
  const invalid = receiptForm.value.items.find(i => !i.productName || !i.productCode || !i.quantity || i.quantity < 1)
  if (invalid) {
    receiptError.value = 'Vui lòng điền đầy đủ thông tin cho tất cả mặt hàng!'
    return
  }
  savingReceipt.value = true
  try {
    await productApi.post('/imports', receiptForm.value)
    alert('Tạo phiếu nhập thành công! Phiếu đang chờ phê duyệt.')
    closeReceiptModal()
    loadReceipts()
    loadProducts()
  } catch (e) {
    receiptError.value = 'Lỗi khi tạo phiếu: ' + (e.response?.data?.message || e.response?.data || e.message)
  } finally {
    savingReceipt.value = false
  }
}

const approveImport = async (r) => {
  if (!confirm(`Phê duyệt phiếu ${r.receiptCode}?\nSau khi phê duyệt, thủ kho có thể xác nhận nhập hàng.`)) return
  try {
    await productApi.post(`/imports/${r.id}/approve`)
    alert('Đã phê duyệt phiếu nhập thành công!')
    loadReceipts()
  } catch (e) {
    alert('Lỗi phê duyệt: ' + (e.response?.data?.message || e.message || 'Không xác định'))
  }
}

const confirmImport = async (r) => {
  if (!confirm(`Xác nhận nhập kho phiếu ${r.receiptCode}?\nHàng hóa sẽ được cộng vào tồn kho.`)) return
  try {
    await productApi.post(`/imports/${r.id}/confirm`)
    alert('Đã xác nhận nhập kho thành công!')
    loadReceipts()
    loadProducts()
  } catch (e) {
    alert('Lỗi xác nhận: ' + (e.response?.data?.message || e.message || 'Không xác định'))
  }
}

const returnImport = async (r) => {
  if (!confirm(`Hoàn hàng phiếu ${r.receiptCode}?\nHàng hóa sẽ bị trừ khỏi kho và phiếu chuyển sang Đã hoàn hàng.`)) return
  try {
    await productApi.post(`/imports/${r.id}/return`)
    alert('Đã hoàn hàng thành công!')
    loadReceipts()
    loadProducts()
  } catch (e) {
    alert('Lỗi hoàn hàng: ' + (e.response?.data?.message || e.message || 'Không xác định'))
  }
}

const closeReceiptModal = () => {
  showReceiptModal.value = false
  receiptError.value = ''
  receiptForm.value = {
    supplierName: '', supplierTaxCode: '', supplierStatus: 'Active', note: '', items: []
  }
}

const viewReceipt = (r) => { selectedReceipt.value = r }
const viewExport  = (r) => { selectedExport.value  = r }

// ── Phiếu xuất ──
const openExportModal = () => {
  exportForm.value = { customerName: '', customerPhone: '', orderCode: '', note: '', items: [] }
  exportError.value = ''
  showExportModal.value = true
}

const addExportItem = () =>
  exportForm.value.items.push({
    productId: '', productName: '', productCode: '',
    quantity: 1, unitSalePrice: 0, availableStock: undefined
  })

const removeExportItem = (idx) => exportForm.value.items.splice(idx, 1)

const onExportProductSelect = (item) => {
  const product = products.value.find(p => p.id === item.productId)
  if (product) {
    item.productName    = product.name
    item.productCode    = product.code
    item.unitSalePrice  = product.salePrice || 0
    item.availableStock = product.stockQuantity
  }
}

const saveExport = async () => {
  exportError.value = ''
  if (!exportForm.value.customerName || !exportForm.value.customerPhone) {
    exportError.value = 'Vui lòng nhập thông tin khách hàng!'
    return
  }
  if (exportForm.value.items.length === 0) {
    exportError.value = 'Vui lòng thêm ít nhất một mặt hàng!'
    return
  }
  const invalid = exportForm.value.items.find(i => !i.productId || !i.quantity || i.quantity < 1)
  if (invalid) {
    exportError.value = 'Vui lòng chọn sản phẩm và nhập số lượng cho tất cả mặt hàng!'
    return
  }
  // Kiểm tra tồn kho
  for (const item of exportForm.value.items) {
    if (item.availableStock !== undefined && item.quantity > item.availableStock) {
      exportError.value = `Sản phẩm "${item.productName}" chỉ còn ${item.availableStock} trong kho!`
      return
    }
  }
  savingExport.value = true
  try {
    await productApi.post('/exports', exportForm.value)
    alert('Tạo phiếu xuất thành công! Phiếu đang chờ xác nhận.')
    closeExportModal()
    loadExports()
    loadProducts()
  } catch (e) {
    exportError.value = 'Lỗi khi tạo phiếu xuất: ' + (e.response?.data?.message || e.response?.data || e.message)
  } finally {
    savingExport.value = false
  }
}

const confirmExport = async (r) => {
  if (!confirm(`Xác nhận xuất kho phiếu ${r.exportCode}?\nHàng hóa sẽ bị trừ khỏi kho.`)) return
  try {
    await productApi.post(`/exports/${r.id}/confirm`)
    alert('Đã xác nhận xuất kho thành công!')
    loadExports()
    loadProducts()
  } catch (e) {
    alert('Lỗi xác nhận xuất: ' + (e.response?.data?.message || e.message || 'Không xác định'))
  }
}

const closeExportModal = () => {
  showExportModal.value = false
  exportError.value = ''
  exportForm.value = { customerName: '', customerPhone: '', orderCode: '', note: '', items: [] }
}

// ── Danh mục ──
const openAddCategory = () => {
  newCategory.value = { name: '', description: '' }
  categoryError.value = ''
  showCategoryModal.value = true
}

const saveCategory = async () => {
  categoryError.value = ''
  if (!newCategory.value.name.trim()) {
    categoryError.value = 'Vui lòng nhập tên danh mục!'
    return
  }
  savingCategory.value = true
  try {
    await productApi.post('/categories', newCategory.value)
    showCategoryModal.value = false
    newCategory.value = { name: '', description: '' }
    await loadCategories()
    window.dispatchEvent(new Event('categories-updated'))
    alert('Đã thêm danh mục thành công!')
  } catch (e) {
    categoryError.value = 'Lỗi khi thêm danh mục: ' + (e.response?.data?.message || e.message)
  } finally {
    savingCategory.value = false
  }
}

onMounted(() => {
  loadProducts()
  loadAlerts()
  loadCategories()
  loadReceipts()
})
</script>

<style scoped>
.inventory-management {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;
}

/* ── Page Header ── */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.header-left {
  display: flex;
  flex-direction: column;
}

.page-title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #1a2332;
  letter-spacing: -0.5px;
}

.page-subtitle {
  margin: 4px 0 0;
  font-size: 14px;
  color: #6b7a8f;
}

.header-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.btn-export,
.btn-import {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: white;
}

.btn-export {
  background: linear-gradient(135deg, #7b1fa2, #9c27b0);
  box-shadow: 0 4px 12px rgba(123, 31, 162, 0.3);
}

.btn-export:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(123, 31, 162, 0.4);
}

.btn-import {
  background: linear-gradient(135deg, #1b5e20, #2e7d32);
  box-shadow: 0 4px 12px rgba(27, 94, 32, 0.3);
}

.btn-import:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(27, 94, 32, 0.4);
}

.btn-icon {
  font-size: 16px;
}

/* ── Statistics Cards ── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  border-radius: 12px;
  color: white;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: default;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.stat-total {
  background: linear-gradient(135deg, #0d47a1, #1976d2);
}

.stat-instock {
  background: linear-gradient(135deg, #1b5e20, #2e7d32);
}

.stat-lowstock {
  background: linear-gradient(135deg, #b71c1c, #c62828);
}

.stat-pending {
  background: linear-gradient(135deg, #e65100, #f57c00);
}

.stat-icon {
  font-size: 28px;
  opacity: 0.8;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 12px;
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
}

/* ── Tabs ── */
.tabs-container {
  background: white;
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.tabs-wrapper {
  display: flex;
  gap: 4px;
  overflow-x: auto;
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #6b7a8f;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  position: relative;
}

.tab-button:hover {
  background: #f5f7fa;
  color: #1a2332;
}

.tab-button.active {
  background: #1976d2;
  color: white;
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.3);
}

.tab-icon {
  font-size: 14px;
}

.tab-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: #c62828;
  color: white;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
}

/* ── Content ── */
.content-panel {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.table-wrapper {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow-x: auto;
}

/* ── Custom Table ── */
.custom-table :deep(.ant-table) {
  border-radius: 8px;
  overflow: hidden;
}

.custom-table :deep(.ant-table-thead > tr > th) {
  background: #f8f9fa;
  font-weight: 600;
  color: #1a2332;
  border-bottom: 2px solid #e8eaed;
}

.custom-table :deep(.ant-table-tbody > tr:hover > td) {
  background: #f5f7fa;
}

/* ── Product Code ── */
.product-code {
  font-weight: 600;
  color: #1976d2;
}

/* ── Stock Quantity ── */
.stock-quantity {
  font-weight: 700;
  font-size: 16px;
}

.stock-critical {
  color: #c62828;
}

.stock-low {
  color: #e65100;
}

.stock-normal {
  color: #2e7d32;
}

/* ── Status Badge ── */
.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
}

.status-ok {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-low {
  background: #fff3e0;
  color: #e65100;
}

.status-out {
  background: #ffebee;
  color: #c62828;
}

.status-warning {
  background: #fff8e1;
  color: #f57f17;
}

.status-processing {
  background: #e3f2fd;
  color: #0d47a1;
}

.status-success {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-error {
  background: #ffebee;
  color: #c62828;
}

/* ── Price Text ── */
.price-text,
.price-highlight {
  font-weight: 600;
}

.price-highlight {
  color: #2e7d32;
}

.export-price {
  color: #7b1fa2;
}

/* ── Link Code ── */
.link-code {
  color: #1976d2;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.link-code:hover {
  color: #0d47a1;
}

/* ── Supplier Info ── */
.supplier-info,
.customer-info {
  display: flex;
  flex-direction: column;
}

.supplier-name,
.customer-name {
  font-weight: 500;
}

.supplier-tax,
.customer-phone {
  font-size: 12px;
  color: #888;
}

/* ── Item Count ── */
.item-count {
  color: #6b7a8f;
  font-size: 13px;
}

/* ── Return Timer ── */
.return-timer {
  color: #e65100;
  font-size: 12px;
  font-weight: 500;
}

.return-expired {
  color: #999;
  font-size: 12px;
}

.text-muted {
  color: #999;
}

.small {
  font-size: 12px;
}

/* ── Action Buttons ── */
.action-buttons {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.btn-view {
  background: #e3f2fd;
  color: #0d47a1;
  border: none;
}

.btn-view:hover {
  background: #bbdefb;
}

.btn-approve {
  background: #2e7d32;
  color: white;
  border: none;
}

.btn-approve:hover {
  background: #1b5e20;
}

.btn-confirm {
  background: #1976d2;
  color: white;
  border: none;
}

.btn-confirm:hover {
  background: #0d47a1;
}

.btn-return {
  background: #c62828;
  color: white;
  border: none;
}

.btn-return:hover {
  background: #b71c1c;
}

.btn-export-confirm {
  background: #7b1fa2;
  color: white;
  border: none;
}

.btn-export-confirm:hover {
  background: #6a1b9a;
}

/* ── Error Message ── */
.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #ffebee;
  color: #c62828;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.error-icon {
  font-weight: 700;
  font-size: 16px;
}

/* ── Empty State ── */
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px 20px;
  border-radius: 12px;
  text-align: center;
  font-size: 16px;
}

.empty-state.success {
  background: #e8f5e9;
  color: #2e7d32;
}

.empty-icon {
  font-size: 24px;
}

/* ── Alert Summary ── */
.alert-summary {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
}

.alert-card {
  padding: 16px 20px;
  border-radius: 10px;
  text-align: center;
}

.alert-danger {
  background: #ffebee;
  border: 1px solid #ef9a9a;
}

.alert-warning {
  background: #fff3e0;
  border: 1px solid #ffcc80;
}

.alert-label {
  font-size: 13px;
  font-weight: 500;
  color: #6b7a8f;
}

.alert-number {
  font-size: 28px;
  font-weight: 700;
  margin-top: 4px;
}

.alert-danger .alert-number {
  color: #c62828;
}

.alert-warning .alert-number {
  color: #e65100;
}

.need-import {
  font-weight: 700;
  color: #1976d2;
}

/* ── Modal ── */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: modalFade 0.3s ease;
}

@keyframes modalFade {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-container {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 720px;
  max-height: 92vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  animation: modalSlide 0.3s ease;
}

@keyframes modalSlide {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.modal-lg {
  max-width: 880px;
}

.modal-header {
  padding: 20px 24px;
  border-radius: 16px 16px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  color: white;
}

.modal-header-import {
  background: linear-gradient(135deg, #1b5e20, #2e7d32);
}

.modal-header-import-detail {
  background: linear-gradient(135deg, #0d47a1, #1976d2);
}

.modal-header-export {
  background: linear-gradient(135deg, #4a148c, #7b1fa2);
}

.modal-header-export-detail {
  background: linear-gradient(135deg, #4a148c, #7b1fa2);
}

.modal-header-category {
  background: linear-gradient(135deg, #0d47a1, #1976d2);
}

.modal-title-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-icon {
  font-size: 24px;
  opacity: 0.9;
}

.modal-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
}

.modal-subtitle {
  margin: 2px 0 0;
  font-size: 14px;
  opacity: 0.8;
}

.modal-close {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
  transition: background 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.3);
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e8eaed;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;
}

/* ── Form Styles ── */
.form-section {
  margin-bottom: 20px;
}

.form-section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 16px;
  color: #1a2332;
  margin-bottom: 16px;
}

.section-icon {
  font-size: 18px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

@media (max-width: 640px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  font-size: 13px;
  font-weight: 500;
  color: #37474f;
  margin-bottom: 4px;
}

.form-label.required::after {
  content: ' *';
  color: #c62828;
}

.form-input,
.form-select {
  padding: 9px 12px;
  border: 1px solid #d0d5dd;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  background: white;
  width: 100%;
  box-sizing: border-box;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #1976d2;
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
}

.form-input.error {
  border-color: #c62828;
}

.form-hint {
  font-size: 12px;
  color: #6b7a8f;
  margin-top: 4px;
}

.sale-hint {
  color: #2e7d32;
  font-weight: 500;
}

.category-select-wrapper {
  display: flex;
  gap: 6px;
}

.category-select-wrapper .form-select {
  flex: 1;
}

.btn-add-category {
  padding: 9px 14px;
  background: #1976d2;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 18px;
  font-weight: 700;
  transition: background 0.3s ease;
}

.btn-add-category:hover {
  background: #0d47a1;
}

/* ── Item Card ── */
.item-card {
  border: 1px solid #e8eaed;
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 12px;
  background: #fafbfc;
  transition: border-color 0.3s ease;
}

.item-card:hover {
  border-color: #d0d5dd;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.item-number {
  font-weight: 600;
  color: #1976d2;
}

.btn-remove-item {
  background: #f44336;
  color: white;
  border: none;
  padding: 2px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s ease;
}

.btn-remove-item:hover {
  background: #c62828;
}

.btn-add-item {
  margin-left: auto;
  padding: 6px 14px;
  background: #1976d2;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: background 0.3s ease;
}

.btn-add-item:hover {
  background: #0d47a1;
}

.btn-add-export {
  background: #7b1fa2;
}

.btn-add-export:hover {
  background: #6a1b9a;
}

.empty-items {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 40px 20px;
  color: #999;
  border: 2px dashed #d0d5dd;
  border-radius: 10px;
}

.empty-items .empty-icon {
  font-size: 28px;
}

/* ── Info Banner ── */
.info-banner {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 13px;
}

.info-banner-warning {
  background: #fff3e0;
  border: 1px solid #ffcc80;
  color: #e65100;
}

.info-banner-export {
  background: #f3e5f5;
  border: 1px solid #ce93d8;
  color: #7b1fa2;
}

.banner-icon {
  font-size: 16px;
  flex-shrink: 0;
  margin-top: 2px;
}

/* ── Summary Bar ── */
.summary-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 8px;
}

.import-summary {
  background: #e8f5e9;
}

.export-summary {
  background: #f3e5f5;
}

.summary-total {
  font-size: 16px;
}

.import-summary .summary-total {
  color: #2e7d32;
}

.export-summary .summary-total {
  color: #7b1fa2;
}

/* ── Buttons ── */
.btn-cancel {
  padding: 10px 20px;
  border: 1px solid #d0d5dd;
  border-radius: 8px;
  cursor: pointer;
  background: white;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-cancel:hover {
  background: #f5f7fa;
}

.btn-submit {
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  color: white;
  transition: all 0.3s ease;
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-submit-import {
  background: linear-gradient(135deg, #1b5e20, #2e7d32);
}

.btn-submit-import:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(27, 94, 32, 0.3);
}

.btn-submit-export {
  background: linear-gradient(135deg, #4a148c, #7b1fa2);
}

.btn-submit-export:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(123, 31, 162, 0.3);
}

.btn-submit-category {
  background: linear-gradient(135deg, #0d47a1, #1976d2);
}

.btn-submit-category:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
}

.btn-close-detail {
  padding: 10px 24px;
  background: #37474f;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.3s ease;
}

.btn-close-detail:hover {
  background: #263238;
}

.footer-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  flex: 1;
}

/* ── Detail Grid ── */
.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
}

@media (max-width: 640px) {
  .detail-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.detail-item {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 14px;
}

.detail-label {
  font-size: 12px;
  color: #6b7a8f;
  margin-bottom: 4px;
}

.detail-value {
  font-weight: 500;
  color: #1a2332;
}

.highlight-blue {
  color: #1976d2;
}

.highlight-purple {
  color: #7b1fa2;
}

/* ── Return Info ── */
.return-info {
  margin-bottom: 16px;
}

.return-active {
  background: #fff3e0;
  border: 1px solid #ffcc80;
  border-radius: 8px;
  padding: 12px 16px;
  color: #e65100;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.return-icon {
  font-size: 16px;
}

.return-expired-info {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 12px 16px;
  color: #999;
  font-size: 13px;
}

/* ── Detail Table ── */
.detail-items-section {
  margin-top: 16px;
}

.detail-items-header {
  font-weight: 600;
  font-size: 15px;
  color: #37474f;
  margin-bottom: 12px;
}

.detail-table-wrapper {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e8eaed;
}

.detail-table {
  width: 100%;
  border-collapse: collapse;
}

.detail-table thead {
  background: #37474f;
  color: white;
}

.detail-table thead th {
  padding: 10px 12px;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
}

.detail-table tbody tr {
  border-bottom: 1px solid #e8eaed;
}

.detail-table tbody tr:last-child {
  border-bottom: none;
}

.detail-table tbody td {
  padding: 10px 12px;
  font-size: 14px;
}

.detail-table tbody tr:nth-child(even) {
  background: #fafbfc;
}

.text-center {
  text-align: center;
}

.text-right {
  text-align: right;
}

.product-name {
  font-weight: 500;
}

.quantity {
  font-weight: 600;
  color: #1976d2;
}

.price-total {
  font-weight: 600;
  color: #2e7d32;
}

.export-price-total {
  color: #7b1fa2;
}

.detail-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-radius: 0 0 8px 8px;
  font-weight: 500;
}

.import-detail-summary {
  background: #e8f5e9;
}

.export-detail-summary {
  background: #f3e5f5;
}

.detail-summary .summary-total {
  font-size: 18px;
}

.import-detail-summary .summary-total {
  color: #2e7d32;
}

.export-detail-summary .summary-total {
  color: #7b1fa2;
}
</style>