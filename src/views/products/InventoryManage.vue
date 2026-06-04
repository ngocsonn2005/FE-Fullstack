<template>
  <div style="padding:24px">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
      <h2>📦 Quản lý tồn kho & Nhập hàng</h2>
      <button @click="showReceiptModal = true"
        style="background:#2e7d32;color:white;border:none;padding:10px 20px;border-radius:6px;cursor:pointer;font-size:14px">
        + Tạo phiếu nhập hàng
      </button>
    </div>

    <!-- Thống kê -->
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:24px">
      <div style="background:#1976d2;color:white;padding:20px;border-radius:8px">
        <div style="font-size:13px;opacity:0.8">TỔNG SẢN PHẨM</div>
        <div style="font-size:32px;font-weight:bold;margin-top:8px">{{ products.length }}</div>
      </div>
      <div style="background:#2e7d32;color:white;padding:20px;border-radius:8px">
        <div style="font-size:13px;opacity:0.8">CÒN HÀNG</div>
        <div style="font-size:32px;font-weight:bold;margin-top:8px">{{ products.filter(p=>p.stockQuantity>0).length }}</div>
      </div>
      <div style="background:#c62828;color:white;padding:20px;border-radius:8px">
        <div style="font-size:13px;opacity:0.8">SẮP HẾT HÀNG</div>
        <div style="font-size:32px;font-weight:bold;margin-top:8px">{{ lowStockCount }}</div>
      </div>
    </div>

    <!-- Tabs -->
<div style="display:flex;gap:8px;margin-bottom:16px">
  <button @click="activeTab='stock'"
    :style="{padding:'8px 20px',border:'none',borderRadius:'6px',cursor:'pointer',
      background:activeTab==='stock'?'#1976d2':'#eee',
      color:activeTab==='stock'?'white':'#333'}">
    📊 Tồn kho
  </button>
  <button @click="activeTab='receipts';loadReceipts()"
    :style="{padding:'8px 20px',border:'none',borderRadius:'6px',cursor:'pointer',
      background:activeTab==='receipts'?'#1976d2':'#eee',
      color:activeTab==='receipts'?'white':'#333'}">
    📋 Phiếu nhập hàng
  </button>
  <button @click="activeTab='alerts';loadAlerts()"
    :style="{padding:'8px 20px',border:'none',borderRadius:'6px',cursor:'pointer',
      background:activeTab==='alerts'?'#c62828':'#eee',
      color:activeTab==='alerts'?'white':'#333',
      position:'relative'}">
    🔔 Cảnh báo hết hàng
    <span v-if="alertCount > 0"
      style="position:absolute;top:-6px;right:-6px;background:#ff5722;color:white;
             border-radius:50%;width:20px;height:20px;font-size:11px;
             display:flex;align-items:center;justify-content:center;font-weight:bold">
      {{ alertCount }}
    </span>
  </button>
</div>

    <!-- Tab Tồn kho -->
    <div v-if="activeTab==='stock'">
      <div v-if="error" style="background:#ffebee;color:#c62828;padding:12px;border-radius:6px;margin-bottom:16px">⚠️ {{ error }}</div>
      <div style="background:white;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);overflow:hidden">
        <table style="width:100%;border-collapse:collapse">
          <thead>
            <tr style="background:#37474f;color:white">
              <th style="padding:12px;text-align:left">Mã SP</th>
              <th style="padding:12px;text-align:left">Tên sản phẩm</th>
              <th style="padding:12px;text-align:center">Tồn kho</th>
              <th style="padding:12px;text-align:center">Ngưỡng cảnh báo</th>
              <th style="padding:12px;text-align:right">Giá bán</th>
              <th style="padding:12px;text-align:center">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading"><td colspan="6" style="text-align:center;padding:40px">Đang tải...</td></tr>
            <tr v-else-if="products.length===0">
              <td colspan="6" style="text-align:center;padding:40px;color:#666">Không có dữ liệu</td>
            </tr>
            <tr v-for="(p,i) in products" :key="p.id"
              :style="{background:i%2===0?'#fafafa':'white',borderBottom:'1px solid #eee'}">
              <td style="padding:12px;font-weight:bold;color:#1976d2">{{ p.code }}</td>
              <td style="padding:12px">{{ p.name }}</td>
              <td style="padding:12px;text-align:center;font-size:18px;font-weight:bold"
                :style="{color: p.isLowStock ? '#c62828' : '#2e7d32'}">
                {{ p.stockQuantity }}
              </td>
              <td style="padding:12px;text-align:center;color:#666">{{ p.minStockThreshold }}</td>
              <td style="padding:12px;text-align:right">{{ formatPrice(p.salePrice) }}</td>
              <td style="padding:12px;text-align:center">
                <span :style="{
                  background: p.stockQuantity===0?'#ffebee':p.isLowStock?'#fff3e0':'#e8f5e9',
                  color: p.stockQuantity===0?'#c62828':p.isLowStock?'#e65100':'#2e7d32',
                  padding:'4px 10px',borderRadius:'12px',fontSize:'13px'
                }">
                  {{ p.stockQuantity===0 ? '🔴 Hết hàng' : p.isLowStock ? '🟡 Sắp hết' : '🟢 Còn hàng' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Tab Phiếu nhập hàng -->
    <div v-if="activeTab==='receipts'">
      <div style="background:white;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);overflow:hidden">
        <table style="width:100%;border-collapse:collapse">
          <thead>
            <tr style="background:#37474f;color:white">
              <th style="padding:12px;text-align:left">Mã phiếu</th>
              <th style="padding:12px;text-align:left">Ngày tạo</th>
              <th style="padding:12px;text-align:left">Ghi chú</th>
              <th style="padding:12px;text-align:center">Số mặt hàng</th>
              <th style="padding:12px;text-align:center">Tổng giá trị</th>
              <th style="padding:12px;text-align:center">Trạng thái</th>
              <th style="padding:12px;text-align:center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="receipts.length===0">
              <td colspan="7" style="text-align:center;padding:40px;color:#666">Chưa có phiếu nhập hàng</td>
            </tr>
            <tr v-for="(r,i) in receipts" :key="r.id"
              :style="{background:i%2===0?'#fafafa':'white',borderBottom:'1px solid #eee'}">

              <!-- Mã phiếu → click để xem chi tiết -->
              <td style="padding:12px">
                <span @click="viewReceipt(r)"
                  style="color:#1976d2;font-weight:bold;cursor:pointer;text-decoration:underline"
                  title="Click để xem chi tiết">
                  {{ r.receiptCode }}
                </span>
              </td>

              <td style="padding:12px">{{ formatDate(r.receiptDate) }}</td>
              <td style="padding:12px;color:#666">{{ r.note || '—' }}</td>
              <td style="padding:12px;text-align:center">{{ r.items?.length || 0 }} mặt hàng</td>
              <td style="padding:12px;text-align:center;color:#2e7d32;font-weight:bold">
                {{ formatPrice(totalReceiptValue(r)) }}
              </td>
              <td style="padding:12px;text-align:center">
                <span :style="{
                  background:r.status==='Confirmed'?'#e8f5e9':'#fff3e0',
                  color:r.status==='Confirmed'?'#2e7d32':'#e65100',
                  padding:'4px 10px',borderRadius:'12px',fontSize:'13px'
                }">
                  {{ r.status==='Confirmed' ? '✅ Đã xác nhận' : '⏳ Chờ xác nhận' }}
                </span>
              </td>
              <td style="padding:12px;text-align:center">
                <button @click="viewReceipt(r)"
                  style="background:#1976d2;color:white;border:none;padding:6px 12px;border-radius:4px;cursor:pointer;font-size:12px;margin-right:4px">
                  🔍 Xem
                </button>
                <button v-if="r.status==='Pending'" @click="confirmReceipt(r)"
                  style="background:#2e7d32;color:white;border:none;padding:6px 12px;border-radius:4px;cursor:pointer;font-size:12px">
                  ✅ Xác nhận
                </button>
                <span v-else style="color:#999;font-size:12px">Đã hoàn thành</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <!-- Tab Cảnh báo hết hàng -->
<div v-if="activeTab==='alerts'">
  <div v-if="alerts.length===0"
    style="background:#e8f5e9;color:#2e7d32;padding:20px;border-radius:8px;text-align:center;font-size:16px">
    ✅ Tất cả sản phẩm đều đủ hàng!
  </div>
  <div v-else>
    <!-- Tóm tắt -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
      <div style="background:#ffebee;border:1px solid #ef9a9a;border-radius:8px;padding:16px;text-align:center">
        <div style="font-size:13px;color:#c62828;font-weight:500">🔴 HẾT HÀNG</div>
        <div style="font-size:28px;font-weight:bold;color:#c62828;margin-top:4px">
          {{ alerts.filter(a=>a.status==='out_of_stock').length }}
        </div>
      </div>
      <div style="background:#fff3e0;border:1px solid #ffcc80;border-radius:8px;padding:16px;text-align:center">
        <div style="font-size:13px;color:#e65100;font-weight:500">🟡 SẮP HẾT</div>
        <div style="font-size:28px;font-weight:bold;color:#e65100;margin-top:4px">
          {{ alerts.filter(a=>a.status==='low_stock').length }}
        </div>
      </div>
    </div>

    <!-- Bảng cảnh báo -->
    <div style="background:white;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);overflow:hidden">
      <table style="width:100%;border-collapse:collapse">
        <thead>
          <tr style="background:#c62828;color:white">
            <th style="padding:12px;text-align:left">Mã SP</th>
            <th style="padding:12px;text-align:left">Tên sản phẩm</th>
            <th style="padding:12px;text-align:center">Tồn kho</th>
            <th style="padding:12px;text-align:center">Ngưỡng tối thiểu</th>
            <th style="padding:12px;text-align:center">Trạng thái</th>
            <th style="padding:12px;text-align:center">Cần nhập thêm</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(a,i) in alerts" :key="a.id"
            :style="{
              background: a.status==='out_of_stock' ? '#fff5f5' : '#fffbf0',
              borderBottom:'1px solid #eee'
            }">
            <td style="padding:12px;font-weight:bold;color:#1976d2">{{ a.code }}</td>
            <td style="padding:12px;font-weight:500">{{ a.name }}</td>
            <td style="padding:12px;text-align:center;font-size:20px;font-weight:bold"
              :style="{color: a.status==='out_of_stock'?'#c62828':'#e65100'}">
              {{ a.stockQuantity }}
            </td>
            <td style="padding:12px;text-align:center;color:#666">{{ a.minStockThreshold }}</td>
            <td style="padding:12px;text-align:center">
              <span :style="{
                background: a.status==='out_of_stock'?'#ffebee':'#fff3e0',
                color: a.status==='out_of_stock'?'#c62828':'#e65100',
                padding:'4px 12px',borderRadius:'12px',fontSize:'13px',fontWeight:'bold'
              }">
                {{ a.status==='out_of_stock' ? '🔴 Hết hàng' : '🟡 Sắp hết' }}
              </span>
            </td>
            <td style="padding:12px;text-align:center;font-weight:bold;color:#1976d2">
              +{{ a.minStockThreshold - a.stockQuantity + 10 }} sản phẩm
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>

    <!-- ══════════════════════════════════════
         MODAL XEM CHI TIẾT PHIẾU NHẬP
    ══════════════════════════════════════ -->
    <div v-if="selectedReceipt"
      style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.55);display:flex;align-items:center;justify-content:center;z-index:1000">
      <div style="background:white;border-radius:12px;width:700px;max-height:90vh;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,0.2)">

        <!-- Header -->
        <div style="background:#37474f;color:white;padding:20px 24px;border-radius:12px 12px 0 0;display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="font-size:18px;font-weight:bold">📋 Chi tiết phiếu nhập hàng</div>
            <div style="font-size:14px;opacity:0.8;margin-top:2px">{{ selectedReceipt.receiptCode }}</div>
          </div>
          <button @click="selectedReceipt = null"
            style="background:rgba(255,255,255,0.2);color:white;border:none;width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center">
            ✕
          </button>
        </div>

        <div style="padding:24px">

          <!-- Thông tin chung -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px">
            <div style="background:#f5f5f5;border-radius:8px;padding:14px">
              <div style="font-size:12px;color:#888;margin-bottom:4px">MÃ PHIẾU</div>
              <div style="font-weight:bold;color:#1976d2;font-size:15px">{{ selectedReceipt.receiptCode }}</div>
            </div>
            <div style="background:#f5f5f5;border-radius:8px;padding:14px">
              <div style="font-size:12px;color:#888;margin-bottom:4px">NGÀY TẠO</div>
              <div style="font-weight:bold;font-size:15px">{{ formatDate(selectedReceipt.receiptDate) }}</div>
            </div>
            <div style="background:#f5f5f5;border-radius:8px;padding:14px">
              <div style="font-size:12px;color:#888;margin-bottom:4px">TRẠNG THÁI</div>
              <span :style="{
                background: selectedReceipt.status==='Confirmed'?'#e8f5e9':'#fff3e0',
                color: selectedReceipt.status==='Confirmed'?'#2e7d32':'#e65100',
                padding:'4px 12px',borderRadius:'12px',fontSize:'13px',fontWeight:'bold'
              }">
                {{ selectedReceipt.status==='Confirmed' ? '✅ Đã xác nhận' : '⏳ Chờ xác nhận' }}
              </span>
            </div>
            <div style="background:#f5f5f5;border-radius:8px;padding:14px">
              <div style="font-size:12px;color:#888;margin-bottom:4px">GHI CHÚ</div>
              <div style="font-size:14px">{{ selectedReceipt.note || '—' }}</div>
            </div>
          </div>

          <!-- Danh sách mặt hàng -->
          <div style="font-weight:600;font-size:15px;margin-bottom:12px;color:#37474f">
            📦 Danh sách mặt hàng ({{ selectedReceipt.items?.length || 0 }} sản phẩm)
          </div>

          <div style="border-radius:8px;overflow:hidden;border:1px solid #e0e0e0">
            <table style="width:100%;border-collapse:collapse">
              <thead>
                <tr style="background:#37474f;color:white">
                  <th style="padding:10px 12px;text-align:left;font-size:13px">STT</th>
                  <th style="padding:10px 12px;text-align:left;font-size:13px">Tên sản phẩm</th>
                  <th style="padding:10px 12px;text-align:center;font-size:13px">Số lượng</th>
                  <th style="padding:10px 12px;text-align:right;font-size:13px">Giá nhập</th>
                  <th style="padding:10px 12px;text-align:right;font-size:13px">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, idx) in selectedReceipt.items" :key="idx"
                  :style="{background: idx%2===0?'#fafafa':'white', borderBottom:'1px solid #eee'}">
                  <td style="padding:10px 12px;color:#888;font-size:13px">{{ idx + 1 }}</td>
                  <td style="padding:10px 12px;font-weight:500">{{ item.productName }}</td>
                  <td style="padding:10px 12px;text-align:center;font-weight:bold;color:#1976d2">{{ item.quantity }}</td>
                  <td style="padding:10px 12px;text-align:right">{{ formatPrice(item.unitCostPrice) }}</td>
                  <td style="padding:10px 12px;text-align:right;font-weight:bold;color:#2e7d32">
                    {{ formatPrice(item.quantity * item.unitCostPrice) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Tổng kết -->
          <div style="background:#e8f5e9;border-radius:8px;padding:16px;margin-top:16px;display:flex;justify-content:space-between;align-items:center">
            <div>
              <span style="color:#555;font-size:14px">Tổng số lượng: </span>
              <strong style="font-size:16px">{{ selectedReceipt.items?.reduce((s,i) => s + i.quantity, 0) }} sản phẩm</strong>
            </div>
            <div>
              <span style="color:#555;font-size:14px">Tổng giá trị nhập: </span>
              <strong style="font-size:18px;color:#2e7d32">{{ formatPrice(totalReceiptValue(selectedReceipt)) }}</strong>
            </div>
          </div>

          <!-- Nút đóng -->
          <div style="display:flex;justify-content:flex-end;margin-top:20px;gap:10px">
            <button v-if="selectedReceipt.status==='Pending'" @click="confirmReceipt(selectedReceipt); selectedReceipt=null"
              style="background:#2e7d32;color:white;border:none;padding:10px 20px;border-radius:6px;cursor:pointer;font-weight:500">
              ✅ Xác nhận nhập kho
            </button>
            <button @click="selectedReceipt = null"
              style="background:#37474f;color:white;border:none;padding:10px 24px;border-radius:6px;cursor:pointer;font-weight:500">
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════
         MODAL TẠO PHIẾU NHẬP HÀNG
    ══════════════════════════════════════ -->
    <div v-if="showReceiptModal"
      style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:1000">
      <div style="background:white;border-radius:12px;padding:32px;width:660px;max-height:90vh;overflow-y:auto">
        <h3 style="margin:0 0 24px">📥 Tạo phiếu nhập hàng</h3>

        <div style="margin-bottom:16px">
          <label style="display:block;margin-bottom:4px;font-weight:500">Ghi chú</label>
          <input v-model="receiptForm.note" placeholder="Nhập ghi chú phiếu nhập..."
            style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;box-sizing:border-box" />
        </div>

        <div style="margin-bottom:16px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
            <label style="font-weight:500;font-size:15px">Danh sách hàng nhập</label>
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
                style="background:#f44336;color:white;border:none;padding:4px 10px;border-radius:4px;cursor:pointer">✕ Xóa</button>
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
                <label style="display:block;margin-bottom:4px;font-size:13px;font-weight:500">Số lượng nhập *</label>
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
                <select v-model="item.categoryId"
                  style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;box-sizing:border-box">
                  <option :value="1">Điện tử</option>
                  <option :value="2">Thực phẩm</option>
                </select>
              </div>
            </div>
          </div>

          <div v-if="receiptForm.items.length===0"
            style="text-align:center;padding:32px;color:#999;border:2px dashed #ddd;border-radius:8px">
            Nhấn "+ Thêm mặt hàng" để bắt đầu nhập hàng
          </div>
        </div>

        <div v-if="receiptForm.items.length>0"
          style="background:#e8f5e9;padding:14px 16px;border-radius:8px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center">
          <span>Tổng số lượng: <strong>{{ totalQty }}</strong> sản phẩm</span>
          <span style="font-size:16px">Tổng giá trị nhập: <strong style="color:#2e7d32">{{ formatPrice(totalReceiptFormValue) }}</strong></span>
        </div>

        <div v-if="receiptError"
          style="background:#ffebee;color:#c62828;padding:12px;border-radius:6px;margin-bottom:12px">
          ⚠️ {{ receiptError }}
        </div>

        <div style="display:flex;gap:12px;justify-content:flex-end">
          <button @click="closeReceiptModal"
            style="padding:10px 20px;border:1px solid #ddd;border-radius:6px;cursor:pointer;background:white">Hủy</button>
          <button @click="saveReceipt" :disabled="savingReceipt"
            style="padding:10px 24px;background:#2e7d32;color:white;border:none;border-radius:6px;cursor:pointer;font-weight:500;font-size:14px">
            {{ savingReceipt ? '⏳ Đang nhập hàng...' : '💾 Xác nhận nhập hàng' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { productApi } from '../../api/axios.js'

const products         = ref([])
const receipts         = ref([])
const loading          = ref(false)
const error            = ref('')
const activeTab        = ref('stock')
const showReceiptModal = ref(false)
const savingReceipt    = ref(false)
const receiptError     = ref('')
const alerts     = ref([])
const alertCount = ref(0)
const receiptForm      = ref({ note: '', items: [] })

// ── Xem chi tiết phiếu ──
const selectedReceipt  = ref(null)

const viewReceipt = (r) => {
  selectedReceipt.value = r
}

const lowStockCount = computed(() => products.value.filter(p => p.isLowStock).length)

// Tổng giá trị 1 phiếu
const totalReceiptValue = (r) =>
  (r.items || []).reduce((s, i) => s + (i.quantity * i.unitCostPrice), 0)

// Tổng form đang nhập
const totalReceiptFormValue = computed(() =>
  receiptForm.value.items.reduce((s, i) => s + ((i.quantity || 0) * (i.unitCostPrice || 0)), 0))

const totalQty = computed(() =>
  receiptForm.value.items.reduce((s, i) => s + (parseInt(i.quantity) || 0), 0))

const formatPrice = (val) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0)
const formatDate  = (d) => new Date(d).toLocaleDateString('vi-VN')

const loadProducts = async () => {
  loading.value = true
  error.value   = ''
  try {
    const res = await productApi.get('/products')
    products.value = res.data
  } catch {
    error.value = 'Không thể tải dữ liệu kho! Kiểm tra Product Service.'
  } finally {
    loading.value = false
  }
}

const loadReceipts = async () => {
  try {
    const res = await productApi.get('/inventory')
    receipts.value = res.data
  } catch {}
}
const loadAlerts = async () => {
  try {
    const res = await productApi.get('/inventory/alerts')
    alerts.value     = res.data.items || []
    alertCount.value = res.data.total || 0
  } catch {
    alerts.value = []
  }
}

const addReceiptItem    = () => receiptForm.value.items.push({ productName:'', productCode:'', quantity:1, unitCostPrice:0, salePrice:0, categoryId:1 })
const removeReceiptItem = (idx) => receiptForm.value.items.splice(idx, 1)

const saveReceipt = async () => {
  receiptError.value = ''
  if (!receiptForm.value.items.length) { receiptError.value = 'Vui lòng thêm ít nhất 1 mặt hàng'; return }
  if (receiptForm.value.items.some(i => !i.productName || !i.productCode || i.quantity < 1)) {
    receiptError.value = 'Vui lòng điền tên, mã sản phẩm và số lượng cho tất cả dòng'; return
  }
  savingReceipt.value = true
  try {
    const createdProducts = []
    for (const item of receiptForm.value.items) {
      const res = await productApi.post('/products', {
        code: item.productCode, name: item.productName,
        costPrice:  parseFloat(item.unitCostPrice) || 0,
        salePrice:  parseFloat(item.salePrice) || parseFloat(item.unitCostPrice) || 0,
        categoryId: parseInt(item.categoryId) || 1,
        minStockThreshold: 10
      })
      createdProducts.push({ ...item, productId: res.data.id })
    }
    const receiptRes = await productApi.post('/inventory', {
      note: receiptForm.value.note,
      items: createdProducts.map(i => ({
        productId: i.productId,
        quantity: parseInt(i.quantity),
        unitCostPrice: parseFloat(i.unitCostPrice) || 0
      }))
    })
    await productApi.post(`/inventory/${receiptRes.data.id}/confirm`)
    alert(`✅ Nhập hàng thành công!\n${createdProducts.length} sản phẩm đã được thêm vào kho.`)
    closeReceiptModal()
    loadProducts()
    loadReceipts()
  } catch (e) {
    receiptError.value = 'Lỗi: ' + (e.response?.data?.title || e.response?.data || e.message)
  } finally {
    savingReceipt.value = false
  }
}

const confirmReceipt = async (r) => {
  if (!confirm(`Xác nhận nhập hàng phiếu ${r.receiptCode}?`)) return
  try {
    await productApi.post(`/inventory/${r.id}/confirm`)
    alert('✅ Xác nhận thành công! Tồn kho đã cập nhật.')
    loadProducts()
    loadReceipts()
  } catch (e) {
    alert('Lỗi: ' + (e.response?.data || e.message))
  }
}

const closeReceiptModal = () => {
  showReceiptModal.value = false
  receiptForm.value = { note: '', items: [] }
  receiptError.value = ''
}

onMounted(() => {
    loadProducts()
    loadAlerts()  
 })
</script>