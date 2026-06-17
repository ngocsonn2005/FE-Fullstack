<template>
  <div style="padding:24px">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
      <h2>Quản lý tồn kho</h2>
      <a-space>
        <a-button type="primary" style="background:#7b1fa2;border-color:#7b1fa2" @click="openExportModal">
          + Tạo phiếu xuất kho
        </a-button>
        <a-button type="primary" style="background:#2e7d32;border-color:#2e7d32" @click="showReceiptModal=true">
          + Tạo phiếu nhập hàng
        </a-button>
      </a-space>
    </div>

    <!-- Thống kê -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px">
      <div style="background:#1976d2;color:white;padding:20px;border-radius:8px">
        <div style="font-size:12px;opacity:0.8">TỔNG SẢN PHẨM</div>
        <div style="font-size:30px;font-weight:bold;margin-top:6px">{{ products.length }}</div>
      </div>
      <div style="background:#2e7d32;color:white;padding:20px;border-radius:8px">
        <div style="font-size:12px;opacity:0.8">CÒN HÀNG</div>
        <div style="font-size:30px;font-weight:bold;margin-top:6px">{{ products.filter(p=>p.stockQuantity>0).length }}</div>
      </div>
      <div style="background:#c62828;color:white;padding:20px;border-radius:8px">
        <div style="font-size:12px;opacity:0.8">SẮP HẾT HÀNG</div>
        <div style="font-size:30px;font-weight:bold;margin-top:6px">{{ lowStockCount }}</div>
      </div>
      <div style="background:#e65100;color:white;padding:20px;border-radius:8px">
        <div style="font-size:12px;opacity:0.8">CHỜ PHÊ DUYỆT</div>
        <div style="font-size:30px;font-weight:bold;margin-top:6px">{{ pendingImportCount }}</div>
      </div>
    </div>

    <!-- Tabs -->
    <div style="display:flex;gap:8px;margin-bottom:16px">
      <a-button :type="activeTab==='stock'?'primary':'default'" @click="activeTab='stock'">Tồn kho</a-button>
      <a-button :type="activeTab==='imports'?'primary':'default'" @click="activeTab='imports';loadReceipts()">Phiếu nhập</a-button>
      <a-button :type="activeTab==='exports'?'primary':'default'" @click="activeTab='exports';loadExports()">Phiếu xuất</a-button>
      <a-badge :count="alertCount" :offset="[-4,4]">
        <a-button :type="activeTab==='alerts'?'primary':'default'" :danger="activeTab==='alerts'"
          @click="activeTab='alerts';loadAlerts()">
          Cảnh báo hết hàng
        </a-button>
      </a-badge>
    </div>

    <!-- ══ Tab Tồn kho ══ -->
    <div v-if="activeTab==='stock'">
      <div v-if="error" style="background:#ffebee;color:#c62828;padding:12px;border-radius:6px;margin-bottom:16px">{{ error }}</div>
      <div style="background:white;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);padding:16px">
        <a-table :columns="stockColumns" :data-source="products"
          :loading="{ spinning: loading, tip: 'Đang tải...' }"
          row-key="id" :pagination="{ pageSize: 8 }"
          :locale="{ emptyText: 'Không có dữ liệu' }" bordered>
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex==='code'">
              <span style="font-weight:bold;color:#1976d2">{{ record.code }}</span>
            </template>
            <template v-else-if="column.dataIndex==='stockQuantity'">
              <span :style="{fontWeight:'bold',fontSize:'16px',color:record.isLowStock?'#c62828':'#2e7d32'}">{{ record.stockQuantity }}</span>
            </template>
            <template v-else-if="column.dataIndex==='salePrice'">{{ formatPrice(record.salePrice) }}</template>
            <template v-else-if="column.dataIndex==='status'">
              <a-tag :color="record.stockQuantity===0?'error':record.isLowStock?'warning':'success'">
                {{ record.stockQuantity===0?'Hết hàng':record.isLowStock?'Sắp hết':'Còn hàng' }}
              </a-tag>
            </template>
            <template v-else>{{ record[column.dataIndex] }}</template>
          </template>
        </a-table>
      </div>
    </div>

    <!-- ══ Tab Phiếu nhập ══ -->
    <div v-if="activeTab==='imports'">
      <div style="background:white;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);padding:16px">
        <a-table :columns="receiptColumns" :data-source="receipts"
          row-key="id" :pagination="{ pageSize: 8 }"
          :locale="{ emptyText: 'Chưa có phiếu nhập' }" bordered>
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex==='receiptCode'">
              <span @click="viewReceipt(record)"
                style="color:#1976d2;font-weight:bold;cursor:pointer;text-decoration:underline">
                {{ record.receiptCode }}
              </span>
            </template>
            <template v-else-if="column.dataIndex==='supplierName'">
              <div style="font-weight:500">{{ record.supplierName || '—' }}</div>
              <div style="font-size:12px;color:#888">MST: {{ record.supplierTaxCode || '—' }}</div>
            </template>
            <template v-else-if="column.dataIndex==='receiptDate'">{{ formatDate(record.receiptDate) }}</template>
            <template v-else-if="column.dataIndex==='itemCount'">{{ record.items?.length || 0 }} mặt hàng</template>
            <template v-else-if="column.dataIndex==='totalValue'">
              <span style="color:#2e7d32;font-weight:bold">{{ formatPrice(totalReceiptValue(record)) }}</span>
            </template>
            <template v-else-if="column.dataIndex==='status'">
              <a-tag :color="importStatusColor(record.status)">{{ importStatusLabel(record.status) }}</a-tag>
            </template>
            <template v-else-if="column.dataIndex==='returnDeadline'">
              <template v-if="record.status==='Imported' && record.confirmedAt">
                <div v-if="returnTimeLeft(record.confirmedAt) > 0" style="color:#e65100;font-size:12px;font-weight:500">
                  Còn {{ returnTimeLeft(record.confirmedAt) }}h hoàn hàng
                </div>
                <div v-else style="color:#999;font-size:12px">Hết hạn hoàn hàng</div>
              </template>
              <span v-else style="color:#ccc">—</span>
            </template>
            <template v-else-if="column.dataIndex==='actions'">
              <a-space>
                <a-button size="small" @click="viewReceipt(record)">Xem</a-button>
                <a-button
                  v-if="['Pending','PendingApproval'].includes(record.status)"
                  type="primary" size="small"
                  style="background:#2e7d32;border-color:#2e7d32"
                  @click="approveImport(record)">
                  Phê duyệt
                </a-button>
                <a-button
                  v-if="record.status==='Approved'"
                  type="primary" size="small"
                  style="background:#1976d2;border-color:#1976d2"
                  @click="confirmImport(record)">
                  Xác nhận nhập kho
                </a-button>
                <a-button
                  v-if="['Imported','Confirmed'].includes(record.status) && returnTimeLeft(record.confirmedAt) > 0"
                  danger size="small"
                  @click="returnImport(record)">
                  Hoàn hàng
                </a-button>
              </a-space>
            </template>
            <template v-else>{{ record[column.dataIndex] }}</template>
          </template>
        </a-table>
      </div>
    </div>

    <!-- ══ Tab Phiếu xuất ══ -->
    <div v-if="activeTab==='exports'">
      <div style="background:white;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);padding:16px">
        <a-table :columns="exportColumns" :data-source="exports"
          row-key="id" :pagination="{ pageSize: 8 }"
          :locale="{ emptyText: 'Chưa có phiếu xuất' }" bordered>
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex==='exportCode'">
              <span @click="viewExport(record)"
                style="color:#1976d2;font-weight:bold;cursor:pointer;text-decoration:underline">
                {{ record.exportCode }}
              </span>
            </template>
            <template v-else-if="column.dataIndex==='customerInfo'">
              <div style="font-weight:500">{{ record.customerName || '—' }}</div>
              <div style="font-size:12px;color:#888">{{ record.customerPhone || '' }}</div>
            </template>
            <template v-else-if="column.dataIndex==='orderCode'">
              <span style="color:#7b1fa2;font-weight:500">{{ record.orderCode || '—' }}</span>
            </template>
            <template v-else-if="column.dataIndex==='exportDate'">{{ formatDate(record.exportDate) }}</template>
            <template v-else-if="column.dataIndex==='itemCount'">{{ record.items?.length || 0 }} mặt hàng</template>
            <template v-else-if="column.dataIndex==='totalValue'">
              <span style="color:#7b1fa2;font-weight:bold">{{ formatPrice(totalExportValue(record)) }}</span>
            </template>
            <template v-else-if="column.dataIndex==='status'">
              <a-tag :color="exportStatusColor(record.status)">{{ exportStatusLabel(record.status) }}</a-tag>
            </template>
            <template v-else-if="column.dataIndex==='actions'">
              <a-space>
                <a-button size="small" @click="viewExport(record)">Xem</a-button>
                <a-button v-if="record.status==='PendingConfirm'" type="primary" size="small"
                  style="background:#7b1fa2;border-color:#7b1fa2" @click="confirmExport(record)">
                  Xác nhận xuất
                </a-button>
                <span v-else-if="record.status==='Exported'" style="color:#999;font-size:12px">Đã xuất kho</span>
              </a-space>
            </template>
            <template v-else>{{ record[column.dataIndex] }}</template>
          </template>
        </a-table>
      </div>
    </div>

    <!-- ══ Tab Cảnh báo ══ -->
    <div v-if="activeTab==='alerts'">
      <div v-if="alerts.length===0"
        style="background:#e8f5e9;color:#2e7d32;padding:20px;border-radius:8px;text-align:center;font-size:16px">
        Tất cả sản phẩm đều đủ hàng!
      </div>
      <div v-else>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
          <div style="background:#ffebee;border:1px solid #ef9a9a;border-radius:8px;padding:16px;text-align:center">
            <div style="font-size:13px;color:#c62828;font-weight:500">HẾT HÀNG</div>
            <div style="font-size:28px;font-weight:bold;color:#c62828;margin-top:4px">{{ alerts.filter(a=>a.status==='out_of_stock').length }}</div>
          </div>
          <div style="background:#fff3e0;border:1px solid #ffcc80;border-radius:8px;padding:16px;text-align:center">
            <div style="font-size:13px;color:#e65100;font-weight:500">SẮP HẾT</div>
            <div style="font-size:28px;font-weight:bold;color:#e65100;margin-top:4px">{{ alerts.filter(a=>a.status==='low_stock').length }}</div>
          </div>
        </div>
        <div style="background:white;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);padding:16px">
          <a-table :columns="alertColumns" :data-source="alerts" row-key="id" :pagination="{ pageSize: 8 }" bordered>
            <template #bodyCell="{ column, record }">
              <template v-if="column.dataIndex==='code'">
                <span style="font-weight:bold;color:#1976d2">{{ record.code }}</span>
              </template>
              <template v-else-if="column.dataIndex==='stockQuantity'">
                <span :style="{fontWeight:'bold',fontSize:'16px',color:record.status==='out_of_stock'?'#c62828':'#e65100'}">{{ record.stockQuantity }}</span>
              </template>
              <template v-else-if="column.dataIndex==='status'">
                <a-tag :color="record.status==='out_of_stock'?'error':'warning'">
                  {{ record.status==='out_of_stock'?'Hết hàng':'Sắp hết' }}
                </a-tag>
              </template>
              <template v-else-if="column.dataIndex==='needImport'">
                <span style="font-weight:bold;color:#1976d2">+{{ record.minStockThreshold - record.stockQuantity + 10 }} sản phẩm</span>
              </template>
              <template v-else>{{ record[column.dataIndex] }}</template>
            </template>
          </a-table>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════
         MODAL TẠO PHIẾU NHẬP HÀNG
    ══════════════════════════════════════ -->
    <div v-if="showReceiptModal"
      style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:1000">
      <div style="background:white;border-radius:12px;padding:32px;width:720px;max-height:92vh;overflow-y:auto">
        <h3 style="margin:0 0 24px;color:#2e7d32">Tạo phiếu nhập hàng</h3>

        <div style="background:#f1f8e9;border:1px solid #c5e1a5;border-radius:8px;padding:16px;margin-bottom:20px">
          <div style="font-weight:600;margin-bottom:12px;color:#2e7d32">Thông tin nhà cung cấp</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
            <div>
              <label style="display:block;margin-bottom:4px;font-size:13px;font-weight:500">Tên nhà cung cấp *</label>
              <input v-model="receiptForm.supplierName" placeholder="VD: Công ty TNHH ABC"
                style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;box-sizing:border-box" />
            </div>
            <div>
              <label style="display:block;margin-bottom:4px;font-size:13px;font-weight:500">Mã số thuế *</label>
              <input v-model="receiptForm.supplierTaxCode" placeholder="VD: 0123456789"
                style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;box-sizing:border-box" />
            </div>
            <div>
              <label style="display:block;margin-bottom:4px;font-size:13px;font-weight:500">Trạng thái nhà cung cấp</label>
              <select v-model="receiptForm.supplierStatus"
                style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;box-sizing:border-box">
                <option value="Active">Đang hợp tác</option>
                <option value="Inactive">Ngừng hợp tác</option>
                <option value="Suspended">Tạm ngừng</option>
              </select>
            </div>
            <div>
              <label style="display:block;margin-bottom:4px;font-size:13px;font-weight:500">Ghi chú</label>
              <input v-model="receiptForm.note" placeholder="Ghi chú thêm..."
                style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;box-sizing:border-box" />
            </div>
          </div>
        </div>

        <div style="background:#fff3e0;border:1px solid #ffcc80;border-radius:6px;padding:10px 14px;margin-bottom:16px;font-size:13px;color:#e65100">
          ⚠️ Sau khi tạo, phiếu sẽ ở trạng thái <strong>Chờ phê duyệt</strong>. Admin/Thủ kho cần phê duyệt trước khi nhập hàng vào kho.
        </div>

        <div style="margin-bottom:16px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
            <label style="font-weight:600;font-size:15px">Danh sách hàng nhập</label>
            <button @click="addReceiptItem"
              style="background:#1976d2;color:white;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;font-size:13px">
              + Thêm mặt hàng
            </button>
          </div>

          <div v-for="(item, idx) in receiptForm.items" :key="idx"
            style="border:1px solid #e0e0e0;border-radius:8px;padding:16px;margin-bottom:12px;background:#fafafa">
            <div style="display:flex;justify-content:space-between;margin-bottom:12px">
              <strong style="color:#1976d2">Mặt hàng {{ idx + 1 }}</strong>
              <button @click="removeReceiptItem(idx)"
                style="background:#f44336;color:white;border:none;padding:4px 10px;border-radius:4px;cursor:pointer">Xóa</button>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
              <div>
                <label style="display:block;margin-bottom:4px;font-size:13px;font-weight:500">Tên sản phẩm *</label>
                <input v-model="item.productName" placeholder="VD: Laptop Dell XPS 15"
                  style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;box-sizing:border-box" />
              </div>
              <div>
                <label style="display:block;margin-bottom:4px;font-size:13px;font-weight:500">Mã sản phẩm *</label>
                <input v-model="item.productCode" placeholder="VD: SP001"
                  style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;box-sizing:border-box" />
              </div>
              <div>
                <label style="display:block;margin-bottom:4px;font-size:13px;font-weight:500">Số lượng *</label>
                <input v-model="item.quantity" type="number" min="1"
                  style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;box-sizing:border-box" />
              </div>
              <div>
                <label style="display:block;margin-bottom:4px;font-size:13px;font-weight:500">Giá nhập (VNĐ) *</label>
                <input v-model="item.unitCostPrice" type="number"
                  style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;box-sizing:border-box" />
                <span style="font-size:12px;color:#666;margin-top:2px;display:block">= {{ formatPrice(item.unitCostPrice) }}</span>
              </div>
              <div>
                <label style="display:block;margin-bottom:4px;font-size:13px;font-weight:500">Giá bán (VNĐ)</label>
                <input v-model="item.salePrice" type="number"
                  style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;box-sizing:border-box" />
                <span style="font-size:12px;color:#2e7d32;font-weight:500;margin-top:2px;display:block">= {{ formatPrice(item.salePrice) }}</span>
              </div>
              <div>
                <label style="display:block;margin-bottom:4px;font-size:13px;font-weight:500">Danh mục</label>
                <div style="display:flex;gap:6px">
                  <select v-model="item.categoryId"
                    style="flex:1;padding:8px;border:1px solid #ddd;border-radius:6px;box-sizing:border-box">
                    <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                  </select>
                  <button type="button" @click="openAddCategory"
                    style="padding:8px 12px;background:#1976d2;color:white;border:none;border-radius:6px;cursor:pointer;font-size:18px;font-weight:bold"
                    title="Thêm danh mục mới">+</button>
                </div>
              </div>
            </div>
          </div>

          <div v-if="receiptForm.items.length===0"
            style="text-align:center;padding:32px;color:#999;border:2px dashed #ddd;border-radius:8px">
            Nhấn "+ Thêm mặt hàng" để bắt đầu
          </div>
        </div>

        <div v-if="receiptForm.items.length>0"
          style="background:#e8f5e9;padding:14px 16px;border-radius:8px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center">
          <span>Tổng số lượng: <strong>{{ totalQty }}</strong> sản phẩm</span>
          <span style="font-size:16px">Tổng giá trị nhập: <strong style="color:#2e7d32">{{ formatPrice(totalReceiptFormValue) }}</strong></span>
        </div>

        <div v-if="receiptError"
          style="background:#ffebee;color:#c62828;padding:12px;border-radius:6px;margin-bottom:12px">
          {{ receiptError }}
        </div>

        <div style="display:flex;gap:12px;justify-content:flex-end">
          <button @click="closeReceiptModal"
            style="padding:10px 20px;border:1px solid #ddd;border-radius:6px;cursor:pointer;background:white">Hủy</button>
          <button @click="saveReceipt" :disabled="savingReceipt"
            style="padding:10px 24px;background:#2e7d32;color:white;border:none;border-radius:6px;cursor:pointer;font-weight:500">
            {{ savingReceipt ? 'Đang tạo...' : 'Tạo phiếu nhập' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════
         MODAL XEM CHI TIẾT PHIẾU NHẬP
    ══════════════════════════════════════ -->
    <div v-if="selectedReceipt"
      style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.55);display:flex;align-items:center;justify-content:center;z-index:1000">
      <div style="background:white;border-radius:12px;width:720px;max-height:90vh;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,0.2)">
        <div style="background:#2e7d32;color:white;padding:20px 24px;border-radius:12px 12px 0 0;display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="font-size:18px;font-weight:bold">Chi tiết phiếu nhập</div>
            <div style="font-size:14px;opacity:0.8;margin-top:2px">{{ selectedReceipt.receiptCode }}</div>
          </div>
          <button @click="selectedReceipt=null"
            style="background:rgba(255,255,255,0.2);color:white;border:none;width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:16px">✕</button>
        </div>

        <div style="padding:24px">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
            <div style="background:#f5f5f5;border-radius:8px;padding:14px">
              <div style="font-size:12px;color:#888;margin-bottom:4px">MÃ PHIẾU</div>
              <div style="font-weight:bold;color:#1976d2">{{ selectedReceipt.receiptCode }}</div>
            </div>
            <div style="background:#f5f5f5;border-radius:8px;padding:14px">
              <div style="font-size:12px;color:#888;margin-bottom:4px">NGÀY TẠO</div>
              <div style="font-weight:bold">{{ formatDate(selectedReceipt.receiptDate) }}</div>
            </div>
            <div style="background:#f5f5f5;border-radius:8px;padding:14px">
              <div style="font-size:12px;color:#888;margin-bottom:4px">NHÀ CUNG CẤP</div>
              <div style="font-weight:bold">{{ selectedReceipt.supplierName || '—' }}</div>
            </div>
            <div style="background:#f5f5f5;border-radius:8px;padding:14px">
              <div style="font-size:12px;color:#888;margin-bottom:4px">MÃ SỐ THUẾ</div>
              <div style="font-weight:bold">{{ selectedReceipt.supplierTaxCode || '—' }}</div>
            </div>
            <div style="background:#f5f5f5;border-radius:8px;padding:14px">
              <div style="font-size:12px;color:#888;margin-bottom:4px">TRẠNG THÁI</div>
              <a-tag :color="importStatusColor(selectedReceipt.status)">{{ importStatusLabel(selectedReceipt.status) }}</a-tag>
            </div>
            <div style="background:#f5f5f5;border-radius:8px;padding:14px">
              <div style="font-size:12px;color:#888;margin-bottom:4px">GHI CHÚ</div>
              <div style="font-size:14px">{{ selectedReceipt.note || '—' }}</div>
            </div>
          </div>

          <div v-if="selectedReceipt.status==='Imported' && selectedReceipt.confirmedAt" style="margin-bottom:16px">
            <div v-if="returnTimeLeft(selectedReceipt.confirmedAt) > 0"
              style="background:#fff3e0;border:1px solid #ffcc80;border-radius:8px;padding:12px 16px;color:#e65100;font-size:13px">
              ⏳ Còn <strong>{{ returnTimeLeft(selectedReceipt.confirmedAt) }} giờ</strong> để hoàn hàng (trong vòng 24h kể từ lúc nhập kho)
            </div>
            <div v-else style="background:#f5f5f5;border-radius:8px;padding:12px 16px;color:#999;font-size:13px">
              Đã hết thời hạn 24h hoàn hàng
            </div>
          </div>

          <div style="font-weight:600;font-size:15px;margin-bottom:12px;color:#37474f">
            Danh sách mặt hàng ({{ selectedReceipt.items?.length || 0 }} sản phẩm)
          </div>
          <div style="border-radius:8px;overflow:hidden;border:1px solid #e0e0e0">
            <table style="width:100%;border-collapse:collapse">
              <thead>
                <tr style="background:#2e7d32;color:white">
                  <th style="padding:10px 12px;text-align:left;font-size:13px">STT</th>
                  <th style="padding:10px 12px;text-align:left;font-size:13px">Tên sản phẩm</th>
                  <th style="padding:10px 12px;text-align:center;font-size:13px">Số lượng</th>
                  <th style="padding:10px 12px;text-align:right;font-size:13px">Giá nhập</th>
                  <th style="padding:10px 12px;text-align:right;font-size:13px">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, idx) in selectedReceipt.items" :key="idx"
                  :style="{background:idx%2===0?'#fafafa':'white',borderBottom:'1px solid #eee'}">
                  <td style="padding:10px 12px;color:#888;font-size:13px">{{ idx + 1 }}</td>
                  <td style="padding:10px 12px;font-weight:500">{{ item.productName }}</td>
                  <td style="padding:10px 12px;text-align:center;font-weight:bold;color:#1976d2">{{ item.quantity }}</td>
                  <td style="padding:10px 12px;text-align:right">{{ formatPrice(item.unitCostPrice) }}</td>
                  <td style="padding:10px 12px;text-align:right;font-weight:bold;color:#2e7d32">{{ formatPrice(item.quantity * item.unitCostPrice) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style="background:#e8f5e9;border-radius:8px;padding:16px;margin-top:16px;display:flex;justify-content:space-between;align-items:center">
            <strong>Tổng: {{ selectedReceipt.items?.reduce((s,i)=>s+i.quantity,0) }} sản phẩm</strong>
            <strong style="font-size:18px;color:#2e7d32">{{ formatPrice(totalReceiptValue(selectedReceipt)) }}</strong>
          </div>

          <div style="display:flex;justify-content:flex-end;margin-top:20px;gap:10px">
            <a-button v-if="['Pending','PendingApproval'].includes(selectedReceipt.status)"
              type="primary" style="background:#2e7d32;border-color:#2e7d32"
              @click="approveImport(selectedReceipt);selectedReceipt=null">
              Phê duyệt phiếu
            </a-button>
            <a-button v-if="selectedReceipt.status==='Approved'"
              type="primary" style="background:#1976d2;border-color:#1976d2"
              @click="confirmImport(selectedReceipt);selectedReceipt=null">
              Xác nhận nhập kho
            </a-button>
            <a-button v-if="['Imported','Confirmed'].includes(selectedReceipt.status) && returnTimeLeft(selectedReceipt.confirmedAt) > 0"
              danger @click="returnImport(selectedReceipt);selectedReceipt=null">
              Hoàn hàng
            </a-button>
            <button @click="selectedReceipt=null"
              style="background:#37474f;color:white;border:none;padding:10px 24px;border-radius:6px;cursor:pointer;font-weight:500">
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════
         MODAL XEM CHI TIẾT PHIẾU XUẤT
    ══════════════════════════════════════ -->
    <div v-if="selectedExport"
      style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.55);display:flex;align-items:center;justify-content:center;z-index:1000">
      <div style="background:white;border-radius:12px;width:720px;max-height:90vh;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,0.2)">
        <div style="background:#7b1fa2;color:white;padding:20px 24px;border-radius:12px 12px 0 0;display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="font-size:18px;font-weight:bold">Chi tiết phiếu xuất</div>
            <div style="font-size:14px;opacity:0.8;margin-top:2px">{{ selectedExport.exportCode }}</div>
          </div>
          <button @click="selectedExport=null"
            style="background:rgba(255,255,255,0.2);color:white;border:none;width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:16px">✕</button>
        </div>

        <div style="padding:24px">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
            <div style="background:#f5f5f5;border-radius:8px;padding:14px">
              <div style="font-size:12px;color:#888;margin-bottom:4px">MÃ PHIẾU XUẤT</div>
              <div style="font-weight:bold;color:#7b1fa2">{{ selectedExport.exportCode }}</div>
            </div>
            <div style="background:#f5f5f5;border-radius:8px;padding:14px">
              <div style="font-size:12px;color:#888;margin-bottom:4px">MÃ ĐƠN HÀNG</div>
              <div style="font-weight:bold;color:#7b1fa2">{{ selectedExport.orderCode || '—' }}</div>
            </div>
            <div style="background:#f5f5f5;border-radius:8px;padding:14px">
              <div style="font-size:12px;color:#888;margin-bottom:4px">KHÁCH HÀNG</div>
              <div style="font-weight:bold">{{ selectedExport.customerName || '—' }}</div>
            </div>
            <div style="background:#f5f5f5;border-radius:8px;padding:14px">
              <div style="font-size:12px;color:#888;margin-bottom:4px">SỐ ĐIỆN THOẠI</div>
              <div style="font-weight:bold">{{ selectedExport.customerPhone || '—' }}</div>
            </div>
            <div style="background:#f5f5f5;border-radius:8px;padding:14px">
              <div style="font-size:12px;color:#888;margin-bottom:4px">NGÀY TẠO</div>
              <div style="font-weight:bold">{{ formatDate(selectedExport.exportDate) }}</div>
            </div>
            <div style="background:#f5f5f5;border-radius:8px;padding:14px">
              <div style="font-size:12px;color:#888;margin-bottom:4px">TRẠNG THÁI</div>
              <a-tag :color="exportStatusColor(selectedExport.status)">{{ exportStatusLabel(selectedExport.status) }}</a-tag>
            </div>
          </div>

          <div style="font-weight:600;font-size:15px;margin-bottom:12px;color:#37474f">
            Danh sách mặt hàng ({{ selectedExport.items?.length || 0 }} sản phẩm)
          </div>
          <div style="border-radius:8px;overflow:hidden;border:1px solid #e0e0e0">
            <table style="width:100%;border-collapse:collapse">
              <thead>
                <tr style="background:#7b1fa2;color:white">
                  <th style="padding:10px 12px;text-align:left;font-size:13px">STT</th>
                  <th style="padding:10px 12px;text-align:left;font-size:13px">Tên sản phẩm</th>
                  <th style="padding:10px 12px;text-align:center;font-size:13px">Số lượng</th>
                  <th style="padding:10px 12px;text-align:right;font-size:13px">Giá bán</th>
                  <th style="padding:10px 12px;text-align:right;font-size:13px">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, idx) in selectedExport.items" :key="idx"
                  :style="{background:idx%2===0?'#fafafa':'white',borderBottom:'1px solid #eee'}">
                  <td style="padding:10px 12px;color:#888;font-size:13px">{{ idx + 1 }}</td>
                  <td style="padding:10px 12px;font-weight:500">{{ item.productName }}</td>
                  <td style="padding:10px 12px;text-align:center;font-weight:bold;color:#7b1fa2">{{ item.quantity }}</td>
                  <td style="padding:10px 12px;text-align:right">{{ formatPrice(item.unitSalePrice) }}</td>
                  <td style="padding:10px 12px;text-align:right;font-weight:bold;color:#7b1fa2">{{ formatPrice(item.quantity * item.unitSalePrice) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style="background:#f3e5f5;border-radius:8px;padding:16px;margin-top:16px;display:flex;justify-content:space-between;align-items:center">
            <strong>Tổng: {{ selectedExport.items?.reduce((s,i)=>s+i.quantity,0) }} sản phẩm</strong>
            <strong style="font-size:18px;color:#7b1fa2">{{ formatPrice(totalExportValue(selectedExport)) }}</strong>
          </div>

          <div style="display:flex;justify-content:flex-end;margin-top:20px;gap:10px">
            <a-button v-if="selectedExport.status==='PendingConfirm'"
              type="primary" style="background:#7b1fa2;border-color:#7b1fa2"
              @click="confirmExport(selectedExport);selectedExport=null">
              Xác nhận xuất kho
            </a-button>
            <button @click="selectedExport=null"
              style="background:#37474f;color:white;border:none;padding:10px 24px;border-radius:6px;cursor:pointer;font-weight:500">
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════
         MODAL TẠO PHIẾU XUẤT KHO
    ══════════════════════════════════════ -->
    <div v-if="showExportModal"
      style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:1000">
      <div style="background:white;border-radius:12px;padding:32px;width:720px;max-height:92vh;overflow-y:auto">
        <h3 style="margin:0 0 24px;color:#7b1fa2">Tạo phiếu xuất kho</h3>

        <div style="background:#f3e5f5;border:1px solid #ce93d8;border-radius:8px;padding:16px;margin-bottom:20px">
          <div style="font-weight:600;margin-bottom:12px;color:#7b1fa2">Thông tin khách hàng</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
            <div>
              <label style="display:block;margin-bottom:4px;font-size:13px;font-weight:500">Tên khách hàng *</label>
              <input v-model="exportForm.customerName" placeholder="VD: Nguyễn Văn A"
                style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;box-sizing:border-box" />
            </div>
            <div>
              <label style="display:block;margin-bottom:4px;font-size:13px;font-weight:500">Số điện thoại *</label>
              <input v-model="exportForm.customerPhone" placeholder="VD: 0901234567"
                style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;box-sizing:border-box" />
            </div>
            <div>
              <label style="display:block;margin-bottom:4px;font-size:13px;font-weight:500">Mã đơn hàng (nếu có)</label>
              <input v-model="exportForm.orderCode" placeholder="Để trống nếu tạo phiếu thủ công"
                style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;box-sizing:border-box" />
            </div>
            <div>
              <label style="display:block;margin-bottom:4px;font-size:13px;font-weight:500">Ghi chú</label>
              <input v-model="exportForm.note" placeholder="Ghi chú thêm..."
                style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;box-sizing:border-box" />
            </div>
          </div>
        </div>

        <div style="background:#f3e5f5;border:1px solid #ce93d8;border-radius:6px;padding:10px 14px;margin-bottom:16px;font-size:13px;color:#7b1fa2">
          ⚠️ Sau khi tạo, phiếu sẽ ở trạng thái <strong>Chờ xác nhận</strong>. Hàng chỉ bị trừ khỏi kho khi phiếu được xác nhận xuất.
        </div>

        <div style="margin-bottom:16px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
            <label style="font-weight:600;font-size:15px">Danh sách hàng xuất</label>
            <button @click="addExportItem"
              style="background:#7b1fa2;color:white;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;font-size:13px">
              + Thêm mặt hàng
            </button>
          </div>

          <div v-for="(item, idx) in exportForm.items" :key="idx"
            style="border:1px solid #e0e0e0;border-radius:8px;padding:16px;margin-bottom:12px;background:#fafafa">
            <div style="display:flex;justify-content:space-between;margin-bottom:12px">
              <strong style="color:#7b1fa2">Mặt hàng {{ idx + 1 }}</strong>
              <button @click="removeExportItem(idx)"
                style="background:#f44336;color:white;border:none;padding:4px 10px;border-radius:4px;cursor:pointer">Xóa</button>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
              <div style="grid-column:1 / -1">
                <label style="display:block;margin-bottom:4px;font-size:13px;font-weight:500">Sản phẩm *</label>
                <select v-model="item.productId" @change="onExportProductSelect(item)"
                  style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;box-sizing:border-box">
                  <option value="">Chọn sản phẩm trong kho</option>
                  <option v-for="p in products" :key="p.id" :value="p.id">
                    {{ p.code }} — {{ p.name }} (Tồn: {{ p.stockQuantity }})
                  </option>
                </select>
              </div>
              <div>
                <label style="display:block;margin-bottom:4px;font-size:13px;font-weight:500">Số lượng *</label>
                <input v-model="item.quantity" type="number" min="1" :max="item.availableStock || undefined"
                  style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;box-sizing:border-box" />
                <span v-if="item.availableStock!==undefined" style="font-size:12px;color:#888;margin-top:2px;display:block">
                  Tồn kho hiện có: {{ item.availableStock }}
                </span>
              </div>
              <div>
                <label style="display:block;margin-bottom:4px;font-size:13px;font-weight:500">Giá bán (VNĐ)</label>
                <input v-model="item.unitSalePrice" type="number"
                  style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;box-sizing:border-box" />
                <span style="font-size:12px;color:#7b1fa2;font-weight:500;margin-top:2px;display:block">= {{ formatPrice(item.unitSalePrice) }}</span>
              </div>
            </div>
          </div>

          <div v-if="exportForm.items.length===0"
            style="text-align:center;padding:32px;color:#999;border:2px dashed #ddd;border-radius:8px">
            Nhấn "+ Thêm mặt hàng" để bắt đầu
          </div>
        </div>

        <div v-if="exportForm.items.length>0"
          style="background:#f3e5f5;padding:14px 16px;border-radius:8px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center">
          <span>Tổng số lượng: <strong>{{ totalExportQty }}</strong> sản phẩm</span>
          <span style="font-size:16px">Tổng giá trị xuất: <strong style="color:#7b1fa2">{{ formatPrice(totalExportFormValue) }}</strong></span>
        </div>

        <div v-if="exportError"
          style="background:#ffebee;color:#c62828;padding:12px;border-radius:6px;margin-bottom:12px">
          {{ exportError }}
        </div>

        <div style="display:flex;gap:12px;justify-content:flex-end">
          <button @click="closeExportModal"
            style="padding:10px 20px;border:1px solid #ddd;border-radius:6px;cursor:pointer;background:white">Hủy</button>
          <button @click="saveExport" :disabled="savingExport"
            style="padding:10px 24px;background:#7b1fa2;color:white;border:none;border-radius:6px;cursor:pointer;font-weight:500">
            {{ savingExport ? 'Đang tạo...' : 'Tạo phiếu xuất' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal thêm danh mục -->
    <div v-if="showCategoryModal"
      style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:2000">
      <div style="background:white;border-radius:12px;padding:28px;width:420px;box-shadow:0 8px 32px rgba(0,0,0,0.2)">
        <h3 style="margin:0 0 20px;color:#1976d2">Thêm danh mục mới</h3>
        <div style="margin-bottom:14px">
          <label style="display:block;margin-bottom:4px;font-weight:500">Tên danh mục *</label>
          <input v-model="newCategory.name" placeholder="VD: Quần áo, Đồ gia dụng..."
            style="width:100%;padding:9px;border:1px solid #ddd;border-radius:6px;box-sizing:border-box"
            @keyup.enter="saveCategory" />
        </div>
        <div style="margin-bottom:20px">
          <label style="display:block;margin-bottom:4px;font-weight:500">Mô tả</label>
          <input v-model="newCategory.description" placeholder="Mô tả ngắn..."
            style="width:100%;padding:9px;border:1px solid #ddd;border-radius:6px;box-sizing:border-box" />
        </div>
        <div v-if="categoryError" style="background:#ffebee;color:#c62828;padding:10px;border-radius:6px;margin-bottom:12px;font-size:13px">{{ categoryError }}</div>
        <div style="display:flex;gap:10px;justify-content:flex-end">
          <button @click="showCategoryModal=false"
            style="padding:9px 20px;border:1px solid #ddd;border-radius:6px;cursor:pointer;background:white">Hủy</button>
          <button @click="saveCategory" :disabled="savingCategory"
            style="padding:9px 20px;background:#1976d2;color:white;border:none;border-radius:6px;cursor:pointer;font-weight:500">
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
    alert('✅ Tạo phiếu nhập thành công! Phiếu đang chờ phê duyệt.')
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
    alert('✅ Đã phê duyệt phiếu nhập thành công!')
    loadReceipts()
  } catch (e) {
    alert('❌ Lỗi phê duyệt: ' + (e.response?.data?.message || e.message || 'Không xác định'))
  }
}

const confirmImport = async (r) => {
  if (!confirm(`Xác nhận nhập kho phiếu ${r.receiptCode}?\nHàng hóa sẽ được cộng vào tồn kho.`)) return
  try {
    await productApi.post(`/imports/${r.id}/confirm`)
    alert('✅ Đã xác nhận nhập kho thành công!')
    loadReceipts()
    loadProducts()
  } catch (e) {
    alert('❌ Lỗi xác nhận: ' + (e.response?.data?.message || e.message || 'Không xác định'))
  }
}

const returnImport = async (r) => {
  if (!confirm(`Hoàn hàng phiếu ${r.receiptCode}?\nHàng hóa sẽ bị trừ khỏi kho và phiếu chuyển sang Đã hoàn hàng.`)) return
  try {
    await productApi.post(`/imports/${r.id}/return`)
    alert('✅ Đã hoàn hàng thành công!')
    loadReceipts()
    loadProducts()
  } catch (e) {
    alert('❌ Lỗi hoàn hàng: ' + (e.response?.data?.message || e.message || 'Không xác định'))
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
    alert('✅ Tạo phiếu xuất thành công! Phiếu đang chờ xác nhận.')
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
    alert('✅ Đã xác nhận xuất kho thành công!')
    loadExports()
    loadProducts()
  } catch (e) {
    alert('❌ Lỗi xác nhận xuất: ' + (e.response?.data?.message || e.message || 'Không xác định'))
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
    alert('✅ Đã thêm danh mục thành công!')
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