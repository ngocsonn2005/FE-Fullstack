<template>
  <div class="landing-page" :class="{ loaded: pageLoaded }">
    <Transition name="loading-fade">
      <div v-if="isLoading" class="loading-screen" role="status" aria-live="polite">
        <div class="loading-content">
          <div class="loading-spinner" aria-hidden="true">
            <span></span>
          </div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    </Transition>

    <!-- Navbar -->
    <nav class="navbar">
      <div class="container">
        <div class="logo" @click="scrollToTop">
          <span class="logo-icon">🏢</span>
          <span class="logo-text">SmartStockDNU</span>
        </div>
        <div class="nav-menu">
          <a href="#" @click.prevent="scrollToHome" class="nav-link" :class="{ active: activeSection === 'home' }">Trang chủ</a>
          <a href="#" @click.prevent="scrollToFeatures" class="nav-link" :class="{ active: activeSection === 'features' }">Tính năng</a>
          <a href="#" @click.prevent="scrollToPreview" class="nav-link" :class="{ active: activeSection === 'preview' }">Giới thiệu</a>
          <a href="#" @click.prevent="scrollToContact" class="nav-link" :class="{ active: activeSection === 'contact' }">Liên hệ</a>
        </div>
        <div class="nav-buttons">
          <button class="btn-login" @click="goToLogin">Đăng nhập</button>
          <button class="btn-register" @click="goToRegister">Đăng ký</button>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <header class="hero" id="home">
      <div class="container">
        <div class="hero-content">
          <div class="hero-badge">
            <span class="badge-icon">🚀</span>
            <span class="badge-text">v2.0 Mới ra mắt</span>
          </div>
          <h1 class="hero-title">
            Quản lý bán hàng &<br>
            <span class="highlight">Kho hàng</span> thông minh
          </h1>
          <p class="hero-description">
            Quản lý sản phẩm, tồn kho, đơn hàng, khách hàng, nhà cung cấp trong một hệ thống duy nhất. 
            Giải pháp toàn diện cho doanh nghiệp vừa và nhỏ.
          </p>
          <div class="hero-buttons">
            <button class="btn-primary" @click="goToRegister">Dùng thử miễn phí</button>
            <button class="btn-secondary" @click="scrollToFeatures">Xem demo</button>
          </div>
        </div>
        <div class="hero-image">
          <div class="image-wrapper">
            <div class="dashboard-preview">
              <div class="preview-header">
                <div class="preview-dots">
                  <span></span><span></span><span></span>
                </div>
                <div class="preview-title">Dashboard Overview</div>
              </div>
              <div class="preview-content">
                <div class="preview-stats">
                  <div class="stat">
                    <span class="stat-value">{{ stats.totalProducts }}</span>
                    <span class="stat-label">Sản phẩm</span>
                  </div>
                  <div class="stat">
                    <span class="stat-value">{{ stats.totalOrders }}</span>
                    <span class="stat-label">Đơn hàng</span>
                  </div>
                  <div class="stat">
                    <span class="stat-value">{{ stats.totalCustomers }}</span>
                    <span class="stat-label">Khách hàng</span>
                  </div>
                </div>
                <div class="preview-chart">
                  <div class="chart-bar" style="height: 30%"></div>
                  <div class="chart-bar" style="height: 45%"></div>
                  <div class="chart-bar" style="height: 38%"></div>
                  <div class="chart-bar" style="height: 60%"></div>
                  <div class="chart-bar" style="height: 52%"></div>
                  <div class="chart-bar" style="height: 75%"></div>
                  <div class="chart-bar active" style="height: 85%"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Statistics Section -->
    <section class="statistics">
      <div class="container">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">{{ stats.totalProducts }}+</div>
            <div class="stat-label">Sản phẩm</div>
            <div class="stat-trend">↑ 12% tháng này</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ Math.round(stats.totalOrders / 100) / 10 }}k+</div>
            <div class="stat-label">Đơn hàng</div>
            <div class="stat-trend">↑ 8.3% tháng này</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">98%</div>
            <div class="stat-label">Hài lòng</div>
            <div class="stat-trend">↑ 5.2% tháng này</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">24/7</div>
            <div class="stat-label">Hỗ trợ</div>
            <div class="stat-trend">Luôn sẵn sàng</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features" id="features">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Tính năng nổi bật</h2>
          <p class="section-subtitle">Mọi thứ bạn cần để vận hành doanh nghiệp một cách chuyên nghiệp</p>
        </div>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">📦</div>
            <h3 class="feature-title">Quản lý sản phẩm</h3>
            <p class="feature-desc">Quản lý danh mục sản phẩm, theo dõi tồn kho, cảnh báo hàng sắp hết</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🛒</div>
            <h3 class="feature-title">Quản lý đơn hàng</h3>
            <p class="feature-desc">Xử lý đơn hàng nhanh chóng, theo dõi công nợ và thanh toán</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">👥</div>
            <h3 class="feature-title">Quản lý khách hàng</h3>
            <p class="feature-desc">Lưu trữ thông tin khách hàng, lịch sử mua hàng, công nợ</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🏪</div>
            <h3 class="feature-title">Quản lý kho hàng</h3>
            <p class="feature-desc">Cập nhật tồn kho thời gian thực, nhập/xuất kho dễ dàng</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📊</div>
            <h3 class="feature-title">Báo cáo thông minh</h3>
            <p class="feature-desc">Thống kê doanh thu, biểu đồ trực quan, báo cáo xuất Excel</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🔒</div>
            <h3 class="feature-title">Phân quyền chi tiết</h3>
            <p class="feature-desc">Admin, Nhân viên bán hàng, Thủ kho - mỗi vai trò có quyền riêng</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Preview Section -->
    <section class="preview" id="preview">
      <div class="container">
        <div class="preview-header">
          <h2 class="section-title">Giao diện trực quan, dễ sử dụng</h2>
          <p class="section-subtitle">Dashboard hiện đại giúp bạn theo dõi mọi hoạt động kinh doanh</p>
        </div>
        <div class="preview-grid">
          <div class="preview-stats-card">
            <div class="stat-item">
              <span class="stat-label-sm">Doanh thu tháng</span>
              <div class="stat-value-lg">{{ (stats.monthlyRevenue / 1000000).toFixed(1) }}M ₫</div>
              <span class="stat-change positive">↑ 12%</span>
            </div>
            <div class="stat-item">
              <span class="stat-label-sm">Đơn hàng</span>
              <div class="stat-value-lg">{{ stats.totalOrders }}</div>
              <span class="stat-change positive">↑ 8%</span>
            </div>
            <div class="stat-item">
              <span class="stat-label-sm">Tồn kho</span>
              <div class="stat-value-lg">{{ stats.totalStock }}</div>
              <span class="stat-change neutral">Ổn định</span>
            </div>
          </div>
          <div class="preview-chart-card">
            <h4>Biểu đồ doanh thu</h4>
            <div class="chart-container">
              <div class="chart-bar" style="height: 30%"></div>
              <div class="chart-bar" style="height: 45%"></div>
              <div class="chart-bar" style="height: 38%"></div>
              <div class="chart-bar" style="height: 60%"></div>
              <div class="chart-bar" style="height: 52%"></div>
              <div class="chart-bar" style="height: 75%"></div>
              <div class="chart-bar active" style="height: 85%"></div>
            </div>
            <div class="chart-labels">
              <span>Th1</span><span>Th2</span><span>Th3</span><span>Th4</span><span>Th5</span><span>Th6</span><span>Th7</span>
            </div>
          </div>
          <div class="preview-orders-card">
            <h4>🏆 Sản phẩm bán chạy</h4>
            <div v-for="product in topProducts" :key="product.id" class="order-item">
              <div class="order-info">
                <span class="order-code">{{ product.name }}</span>
                <span class="order-time">{{ product.quantity || product.soldCount || 0 }} đã bán</span>
              </div>
              <span class="order-amount">{{ formatCurrency(product.revenue || (product.price * (product.quantity || 0))) }}</span>
            </div>
            <div v-if="topProducts.length === 0" class="order-item">
              <div class="order-info">
                <span class="order-code">Đang cập nhật...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta">
      <div class="container">
        <div class="cta-content">
          <h2 class="cta-title">Sẵn sàng trải nghiệm?</h2>
          <p class="cta-description">Đăng ký ngay hôm nay để quản lý doanh nghiệp của bạn hiệu quả hơn</p>
          <button class="btn-cta" @click="goToRegister">Đăng ký miễn phí</button>
          <p class="cta-note">Không cần thẻ tín dụng, dùng thử 14 ngày</p>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer" id="contact">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-about">
            <div class="footer-logo">
              <span class="logo-icon">🏢</span>
              <span>SmartStockDNU</span>
            </div>
            <p>Hệ thống quản lý bán hàng và kho hàng hiện đại, giải pháp tối ưu cho doanh nghiệp vừa và nhỏ.</p>
            <div class="social-links">
              <a href="#">📘</a>
              <a href="#">📷</a>
              <a href="#">🐦</a>
            </div>
          </div>
          <div class="footer-links">
            <h4>Sản phẩm</h4>
            <ul>
              <li><a href="#">Tính năng</a></li>
              <li><a href="#">Bảng giá</a></li>
              <li><a href="#">API</a></li>
              <li><a href="#">Hỗ trợ</a></li>
            </ul>
          </div>
          <div class="footer-links">
            <h4>Công ty</h4>
            <ul>
              <li><a href="#">Giới thiệu</a></li>
              <li><a href="#">Tuyển dụng</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Liên hệ</a></li>
            </ul>
          </div>
          <div class="footer-contact">
            <h4>Liên hệ</h4>
            <p>📞 0862903605</p>
            <p>📧 Thanh@smartstockdnu.com</p>
            <p>📍 Hà Đông, Hà Nội</p>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2025 SmartStockDNU. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { userApi, orderApi, productApi } from '@/api/axios';

const router = useRouter();
const activeSection = ref('home');
const pageLoaded = ref(false);
const isLoading = ref(true);
let revealObserver;
let loadingTimeout;

// Dữ liệu thật
const stats = ref({
  totalProducts: 0,
  totalOrders: 0,
  totalCustomers: 0,
  monthlyRevenue: 0,
  totalStock: 0
});

const topProducts = ref([]);

// Hàm lấy dữ liệu thật
async function loadRealData() {
  try {
    // Lấy sản phẩm từ Product Service
    const productRes = await productApi.get('/products');
    const products = productRes.data || [];
    stats.value.totalProducts = products.length;
    stats.value.totalStock = products.reduce((sum, p) => sum + (p.stockQuantity || 0), 0);
    
    // Lấy top sản phẩm
    try {
      const topRes = await productApi.get('/products/top?top=3');
      topProducts.value = topRes.data || [];
    } catch (e) {
      console.log('Top products API not available');
    }
    
    // Lấy đơn hàng từ Order Service
    try {
      const orderRes = await orderApi.get('/orders/stats');
      stats.value.totalOrders = orderRes.data?.totalOrders || 342;
      stats.value.monthlyRevenue = orderRes.data?.totalRevenue || 125500000;
    } catch (e) {
      console.log('Order stats API not available, using mock');
      stats.value.totalOrders = 342;
      stats.value.monthlyRevenue = 125500000;
    }
    
    // Lấy khách hàng từ Order Service
    try {
      const customerRes = await orderApi.get('/customers');
      stats.value.totalCustomers = customerRes.data?.length || 89;
    } catch (e) {
      console.log('Customers API not available, using mock');
      stats.value.totalCustomers = 89;
    }
    
  } catch (error) {
    console.error('Error loading real data:', error);
    // Mock data
    stats.value = {
      totalProducts: 156,
      totalOrders: 342,
      totalCustomers: 89,
      monthlyRevenue: 125500000,
      totalStock: 2340
    };
    topProducts.value = [
      { id: 1, name: 'iPhone 15', quantity: 45, price: 25000000, revenue: 112500000 },
      { id: 2, name: 'Samsung S24', quantity: 38, price: 22000000, revenue: 836000000 },
      { id: 3, name: 'Laptop Dell', quantity: 25, price: 18000000, revenue: 450000000 }
    ];
  } finally {
    isLoading.value = false;
  }
}

// Điều hướng
const goToLogin = () => {
  router.push('/login');
};

const goToRegister = () => {
  router.push('/login?tab=register');
};

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const scrollToHome = () => {
  document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' });
  activeSection.value = 'home';
};

const scrollToFeatures = () => {
  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  activeSection.value = 'features';
};

const scrollToPreview = () => {
  document.getElementById('preview')?.scrollIntoView({ behavior: 'smooth' });
  activeSection.value = 'preview';
};

const scrollToContact = () => {
  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  activeSection.value = 'contact';
};

const handleScroll = () => {
  const sections = ['home', 'features', 'preview', 'contact'];
  for (const section of sections) {
    const element = document.getElementById(section);
    if (element) {
      const rect = element.getBoundingClientRect();
      if (rect.top <= 100 && rect.bottom >= 100) {
        activeSection.value = section;
        break;
      }
    }
  }
};

const setupRevealAnimations = () => {
  const revealElements = document.querySelectorAll(
    '.statistics .stat-card, .section-header, .feature-card, .preview-header, ' +
    '.preview-grid > *, .cta-content, .footer-grid > *'
  );

  revealElements.forEach((element, index) => {
    element.classList.add('reveal-item');
    element.style.setProperty('--reveal-delay', `${(index % 6) * 70}ms`);
  });

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    revealElements.forEach((element) => element.classList.add('is-visible'));
    return;
  }

  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px'
  });

  revealElements.forEach((element) => revealObserver.observe(element));
};

function formatCurrency(value) {
  if (!value) return '0 ₫';
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + 'M ₫';
  }
  if (value >= 1000) {
    return (value / 1000).toFixed(0) + 'K ₫';
  }
  return value.toLocaleString() + ' ₫';
}

onMounted(() => {
  loadingTimeout = window.setTimeout(() => {
    isLoading.value = false;
  }, 1200);

  loadRealData();
  window.addEventListener('scroll', handleScroll);
  setupRevealAnimations();
  requestAnimationFrame(() => {
    pageLoaded.value = true;
  });
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  revealObserver?.disconnect();
  window.clearTimeout(loadingTimeout);
});
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.landing-page {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #faf9ff;
  color: #051a3e;
  overflow-x: hidden;
}

.loading-screen {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: grid;
  place-items: center;
  background:
    radial-gradient(circle at center, rgba(0, 82, 204, 0.1), transparent 45%),
    rgba(250, 249, 255, 0.97);
  backdrop-filter: blur(8px);
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  color: #003d9b;
  font-weight: 600;
}

.loading-spinner {
  width: 64px;
  height: 64px;
  padding: 5px;
  border-radius: 50%;
  background: conic-gradient(from 0deg, transparent 0 20%, #0052cc 55%, #6366f1 100%);
  box-shadow: 0 12px 35px rgba(0, 82, 204, 0.22);
  animation: spin 0.9s linear infinite;
}

.loading-spinner span {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #faf9ff;
}

.loading-fade-enter-active,
.loading-fade-leave-active {
  transition: opacity 0.4s ease;
}

.loading-fade-enter-from,
.loading-fade-leave-to {
  opacity: 0;
}

.reveal-item {
  opacity: 0;
  transform: translateY(34px);
  transition:
    opacity 0.7s ease var(--reveal-delay, 0ms),
    transform 0.7s cubic-bezier(0.22, 1, 0.36, 1) var(--reveal-delay, 0ms);
}

.reveal-item.is-visible {
  opacity: 1;
  transform: translateY(0);
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Navbar */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(250, 249, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(195, 198, 214, 0.3);
  z-index: 1000;
  padding: 16px 0;
  transform: translateY(-100%);
  transition: transform 0.65s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.3s ease;
}

.loaded .navbar {
  transform: translateY(0);
  box-shadow: 0 8px 30px rgba(5, 26, 62, 0.06);
}

.navbar .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.logo-icon {
  font-size: 28px;
}

.logo-text {
  font-size: 18px;
  font-weight: 700;
  color: #003d9b;
}

.nav-menu {
  display: flex;
  gap: 32px;
}

.nav-link {
  text-decoration: none;
  color: #434654;
  font-weight: 500;
  transition: color 0.3s;
  cursor: pointer;
}

.nav-link:hover,
.nav-link.active {
  color: #003d9b;
  border-bottom: 2px solid #003d9b;
  padding-bottom: 4px;
}

.nav-buttons {
  display: flex;
  gap: 12px;
}

.btn-login, .btn-register {
  padding: 8px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-login {
  background: transparent;
  border: 1px solid #003d9b;
  color: #003d9b;
}

.btn-login:hover {
  background: #003d9b;
  color: white;
}

.btn-register {
  background: #003d9b;
  border: none;
  color: white;
}

.btn-register:hover {
  background: #002a6e;
  transform: translateY(-2px);
}

/* Hero Section */
.hero {
  padding: 120px 0 80px;
  background: radial-gradient(circle at 50% 50%, rgba(0, 82, 204, 0.05) 0%, #faf9ff 70%);
  position: relative;
  isolation: isolate;
  overflow: hidden;
}

.hero::before,
.hero::after {
  content: '';
  position: absolute;
  z-index: -1;
  border-radius: 50%;
  filter: blur(4px);
  opacity: 0.55;
  animation: drift 9s ease-in-out infinite alternate;
}

.hero::before {
  width: 320px;
  height: 320px;
  top: 70px;
  right: -120px;
  background: rgba(0, 82, 204, 0.12);
}

.hero::after {
  width: 220px;
  height: 220px;
  bottom: -100px;
  left: -70px;
  background: rgba(99, 102, 241, 0.1);
  animation-delay: -3s;
}

.hero .container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 48px;
  flex-wrap: wrap;
}

.hero-content {
  flex: 1;
  min-width: 300px;
  opacity: 0;
  transform: translateX(-36px);
  transition: opacity 0.75s ease 0.15s, transform 0.75s cubic-bezier(0.22, 1, 0.36, 1) 0.15s;
}

.loaded .hero-content {
  opacity: 1;
  transform: translateX(0);
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(0, 82, 204, 0.1);
  padding: 6px 14px;
  border-radius: 30px;
  margin-bottom: 24px;
}

.badge-icon {
  font-size: 14px;
}

.badge-text {
  font-size: 13px;
  font-weight: 500;
  color: #0052cc;
}

.hero-title {
  font-size: 48px;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 24px;
  color: #051a3e;
}

.highlight {
  color: #0052cc;
}

.hero-description {
  font-size: 16px;
  line-height: 1.6;
  color: #434654;
  margin-bottom: 32px;
  max-width: 500px;
}

.hero-buttons {
  display: flex;
  gap: 16px;
}

.btn-primary, .btn-secondary {
  padding: 14px 32px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: #0052cc;
  border: none;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 82, 204, 0.2);
}

.btn-primary:hover {
  background: #003d9b;
  transform: translateY(-2px);
}

.btn-secondary {
  background: transparent;
  border: 1px solid #c3c6d6;
  color: #051a3e;
}

.btn-secondary:hover {
  background: #e9edff;
  border-color: #0052cc;
}

.hero-image {
  flex: 1;
  min-width: 300px;
  opacity: 0;
  transform: translateX(40px);
  transition: opacity 0.8s ease 0.3s, transform 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.3s;
}

.loaded .hero-image {
  opacity: 1;
  transform: translateX(0);
  animation: dashboardFloat 5s ease-in-out 1.2s infinite;
}

.image-wrapper {
  background: white;
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border: 1px solid rgba(195, 198, 214, 0.3);
}

.dashboard-preview {
  padding: 16px;
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e9edff;
}

.preview-dots {
  display: flex;
  gap: 6px;
}

.preview-dots span {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #c3c6d6;
}

.preview-title {
  font-size: 12px;
  color: #737685;
}

.preview-content {
  padding-top: 16px;
}

.preview-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: #003d9b;
}

.stat-label {
  font-size: 12px;
  color: #737685;
}

.preview-chart {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  height: 120px;
}

.chart-bar {
  flex: 1;
  background: rgba(0, 82, 204, 0.2);
  border-radius: 6px 6px 0 0;
  transform-origin: bottom;
  transform: scaleY(0);
  animation: growBar 0.8s ease-out forwards;
  transition: all 0.3s ease;
}

.chart-bar.active {
  background: #0052cc;
}

.chart-bar:nth-child(1) { animation-delay: 0.15s; }
.chart-bar:nth-child(2) { animation-delay: 0.25s; }
.chart-bar:nth-child(3) { animation-delay: 0.32s; }
.chart-bar:nth-child(4) { animation-delay: 0.4s; }
.chart-bar:nth-child(5) { animation-delay: 0.48s; }
.chart-bar:nth-child(6) { animation-delay: 0.56s; }
.chart-bar:nth-child(7) { animation-delay: 0.64s; }

@keyframes growBar {
  from {
    transform: scaleY(0);
    opacity: 0.4;
  }
  to {
    transform: scaleY(1);
    opacity: 1;
  }
}

.chart-bar:hover {
  transform: scaleY(1.03);
  background: #003d9b;
}

.hero-image .image-wrapper {
  transition: transform 0.35s ease, box-shadow 0.35s ease;
}

.hero-image .image-wrapper:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 24px 50px rgba(0, 0, 0, 0.16);
}

.preview-stats-card,
.preview-chart-card,
.preview-orders-card,
.order-item,
.footer-links li a {
  transition: transform 0.25s ease, box-shadow 0.25s ease, background-color 0.25s ease, color 0.25s ease;
}

.preview-stats-card:hover,
.preview-chart-card:hover,
.preview-orders-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 18px 35px rgba(0, 77, 169, 0.12);
}

.order-item:hover {
  background: #f4f7ff;
  transform: translateX(4px);
}

.footer-links li a:hover {
  color: #ffffff;
  transform: translateX(4px);
}

.nav-link:hover,
.nav-link.active {
  color: #003d9b;
  border-bottom: 2px solid #003d9b;
  padding-bottom: 4px;
}

.nav-buttons button:hover {
  transform: translateY(-2px);
}

.btn-login:hover {
  background: #003d9b;
  color: white;
}

.btn-register:hover {
  background: #002a6e;
  transform: translateY(-2px);
}

/* Statistics Section */
.statistics {
  padding: 60px 0;
  background: white;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.stat-card {
  text-align: center;
  padding: 24px;
  background: #faf9ff;
  border-radius: 20px;
  border: 1px solid rgba(195, 198, 214, 0.2);
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
}

.stat-number {
  font-size: 36px;
  font-weight: 800;
  color: #003d9b;
}

.stat-label {
  font-size: 14px;
  color: #434654;
  margin: 8px 0;
}

.stat-trend {
  font-size: 12px;
  color: #10b981;
}

/* Features Section */
.features {
  padding: 80px 0;
  background: #faf9ff;
}

.section-header {
  text-align: center;
  margin-bottom: 48px;
}

.section-title {
  font-size: 32px;
  font-weight: 700;
  color: #051a3e;
  margin-bottom: 12px;
}

.section-subtitle {
  font-size: 16px;
  color: #434654;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
}

.feature-card {
  background: white;
  padding: 32px 24px;
  border-radius: 20px;
  text-align: center;
  transition: all 0.3s;
  border: 1px solid rgba(195, 198, 214, 0.2);
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  border-color: #0052cc;
}

.feature-icon {
  font-size: 48px;
  margin-bottom: 20px;
  display: inline-block;
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}

.feature-card:hover .feature-icon {
  transform: translateY(-5px) scale(1.12) rotate(-4deg);
}

.feature-title {
  font-size: 18px;
  font-weight: 600;
  color: #051a3e;
  margin-bottom: 12px;
}

.feature-desc {
  font-size: 14px;
  color: #737685;
  line-height: 1.5;
}

/* Preview Section */
.preview {
  padding: 80px 0;
  background: white;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.preview-stats-card,
.preview-chart-card,
.preview-orders-card {
  background: #faf9ff;
  border-radius: 20px;
  padding: 24px;
  border: 1px solid rgba(195, 198, 214, 0.2);
}

.stat-item {
  margin-bottom: 20px;
}

.stat-label-sm {
  font-size: 12px;
  color: #737685;
}

.stat-value-lg {
  font-size: 28px;
  font-weight: 700;
  color: #003d9b;
  margin: 4px 0;
}

.stat-change {
  font-size: 12px;
}

.stat-change.positive {
  color: #10b981;
}

.stat-change.neutral {
  color: #f59e0b;
}

.preview-chart-card h4,
.preview-orders-card h4 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 20px;
}

.chart-container {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  height: 150px;
  margin-bottom: 12px;
}

.chart-labels {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #737685;
}

.order-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #e9edff;
}

.order-info {
  display: flex;
  flex-direction: column;
}

.order-code {
  font-weight: 500;
  font-size: 13px;
}

.order-time {
  font-size: 11px;
  color: #737685;
}

.order-amount {
  font-weight: 500;
  font-size: 13px;
}

.order-status {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 20px;
  font-weight: 500;
}

.order-status.paid {
  background: #e8f5e9;
  color: #2e7d32;
}

.order-status.shipping {
  background: #e3f2fd;
  color: #1565c0;
}

.order-status.pending {
  background: #fff3e0;
  color: #e65100;
}

/* CTA Section */
.cta {
  padding: 80px 0;
  background: linear-gradient(135deg, #0052cc, #003d9b);
  color: white;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.cta::before {
  content: '';
  position: absolute;
  width: 420px;
  height: 420px;
  top: -280px;
  left: -100px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: drift 8s ease-in-out infinite alternate-reverse;
}

.cta-title {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 16px;
}

.cta-description {
  font-size: 16px;
  margin-bottom: 32px;
  opacity: 0.95;
}

.btn-cta {
  background: white;
  border: none;
  padding: 14px 40px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  color: #003d9b;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.cta-note {
  font-size: 12px;
  margin-top: 16px;
  opacity: 0.8;
}

/* Footer */
.footer {
  background: #0f172a;
  color: #94a3b8;
  padding: 60px 0 30px;
}

.footer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 40px;
  margin-bottom: 40px;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 700;
  color: white;
  margin-bottom: 16px;
}

.footer-about p {
  line-height: 1.6;
  margin-bottom: 16px;
}

.social-links {
  display: flex;
  gap: 16px;
}

.social-links a {
  text-decoration: none;
  font-size: 20px;
  color: #94a3b8;
  transition: color 0.3s;
}

.social-links a:hover {
  color: #6366f1;
}

.footer-links h4 {
  color: white;
  font-size: 16px;
  margin-bottom: 16px;
}

.footer-links ul {
  list-style: none;
}

.footer-links li {
  margin-bottom: 10px;
}

.footer-links a {
  text-decoration: none;
  color: #94a3b8;
  transition: color 0.3s;
}

.footer-links a:hover {
  color: #6366f1;
}

.footer-contact p {
  margin-bottom: 8px;
}

.footer-bottom {
  text-align: center;
  padding-top: 30px;
  border-top: 1px solid #1e293b;
  font-size: 12px;
}

@keyframes dashboardFloat {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes drift {
  from {
    transform: translate3d(0, 0, 0) scale(1);
  }
  to {
    transform: translate3d(30px, 20px, 0) scale(1.08);
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  .reveal-item,
  .hero-content,
  .hero-image,
  .navbar {
    opacity: 1;
    transform: none;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .navbar .container {
    flex-direction: column;
    gap: 16px;
  }
  
  .nav-menu {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .hero-title {
    font-size: 32px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .preview-grid {
    grid-template-columns: 1fr;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .section-title {
    font-size: 28px;
  }
}
</style>
