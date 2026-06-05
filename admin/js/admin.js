const API_BASE = 'http://127.0.0.1:3000/api/admin';

// ========== 认证检查 ==========
const token = localStorage.getItem('admin_token');
if (!token) {
  window.location.href = 'login.html';
}

// ========== 提示消息 ==========
function showToast(msg, isError) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = 'toast' + (isError ? ' error' : '');
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 2000);
}

// ========== 通用请求 ==========
async function api(url, options = {}) {
  const res = await fetch(API_BASE + url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
  if (res.status === 401) {
    localStorage.removeItem('admin_token');
    window.location.href = 'login.html';
    throw new Error('未登录');
  }
  const data = await res.json();
  if (data.code !== 0) throw new Error(data.msg || '请求失败');
  return data.data;
}

// ========== 导航切换 ==========
function switchTab(name) {
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  document.querySelector(`[data-section="${name}"]`).classList.add('active');
  document.querySelectorAll('.section').forEach(el => el.classList.remove('active'));
  document.getElementById('section-' + name).classList.add('active');
  if (name === 'dashboard') loadDashboard();
  if (name === 'products') loadProducts();
  if (name === 'categories') loadCategories();
  if (name === 'orders') loadOrders();
  if (name === 'users') loadUsers();
}

function logout() {
  localStorage.removeItem('admin_token');
  window.location.href = 'login.html';
}

// ========== 看板 ==========
async function loadDashboard() {
  try {
    const data = await api('/dashboard');
    document.getElementById('stat-total-orders').textContent = data.totalOrders;
    document.getElementById('stat-today-orders').textContent = data.todayOrders;
    document.getElementById('stat-total-revenue').textContent = '¥' + (data.totalRevenue / 100).toFixed(0);
    document.getElementById('stat-today-revenue').textContent = '¥' + (data.todayRevenue / 100).toFixed(0);
    document.getElementById('stat-total-users').textContent = data.totalUsers;
    document.getElementById('stat-today-users').textContent = data.todayUsers;
  } catch (e) { console.error(e); }
}

// ==================== 产品管理 ====================

// 缓存产品数据用于编辑
let productCache = {};

async function loadProducts() {
  try {
    const data = await api('/products');
    productCache = {};
    const tbody = document.getElementById('product-tbody');
    tbody.innerHTML = data.list.map(p => {
      productCache[p.id] = p;
      return `
      <tr>
        <td>${p.id}</td>
        <td><strong>${escHtml(p.name)}</strong><br><small style="color:#999">${escHtml(p.subtitle || '').slice(0, 30)}</small></td>
        <td>${escHtml(p.category?.name || '-')}</td>
        <td>¥${(p.price / 100).toFixed(0)}<br><small style="color:#ccc">原¥${((p.originalPrice || p.price) / 100).toFixed(0)}</small></td>
        <td>${p.isActive ? '<span style="color:#4caf50">上架</span>' : '<span style="color:#999">下架</span>'}</td>
        <td>${p.sortOrder}</td>
        <td>
          <button class="btn btn-primary btn-sm" onclick="editProduct(${p.id})">编辑</button>
          <button class="btn btn-danger btn-sm" onclick="deleteProduct(${p.id})">下架</button>
        </td>
      </tr>`;
    }).join('');
  } catch (e) { console.error(e); }
}

function escHtml(s) { return (s || '').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

function editProduct(id) {
  const p = productCache[id];
  if (!p) return;
  openProductModal(p);
}

function openProductModal(product) {
  document.getElementById('product-modal').classList.add('show');

  if (product) {
    document.getElementById('product-modal-title').textContent = '✏️ 编辑产品';
    document.getElementById('prod-id').value = product.id;
    document.getElementById('prod-name').value = product.name || '';
    document.getElementById('prod-subtitle').value = product.subtitle || '';
    document.getElementById('prod-price').value = (product.price / 100).toFixed(0);
    document.getElementById('prod-original-price').value = product.originalPrice ? (product.originalPrice / 100).toFixed(0) : '';
    document.getElementById('prod-scenario').value = product.scenario || '';
    document.getElementById('prod-roi').value = product.roiHint || '';
    document.getElementById('prod-sort').value = product.sortOrder || 0;
    document.getElementById('prod-active').value = product.isActive ? '1' : '0';
    document.getElementById('prod-guarantee').value = product.guarantee || '';
    // 数组转文本
    document.getElementById('prod-features').value = Array.isArray(product.features) ? product.features.join('\n') : '';
    document.getElementById('prod-process').value = Array.isArray(product.process)
      ? product.process.map(s => (s.title || '') + ' | ' + (s.desc || '')).join('\n') : '';
    document.getElementById('prod-cases').value = Array.isArray(product.cases)
      ? product.cases.map(c => (c.title || '') + ' | ' + (c.desc || '') + ' | ' + (c.result || '')).join('\n') : '';
  } else {
    document.getElementById('product-modal-title').textContent = '➕ 新增产品';
    document.getElementById('product-form').reset();
    document.getElementById('prod-id').value = '';
  }

  loadCategoryOptions(product?.categoryId);
}

function closeProductModal() {
  document.getElementById('product-modal').classList.remove('show');
}

async function loadCategoryOptions(selectedId) {
  try {
    const cats = await api('/categories');
    const sel = document.getElementById('prod-category');
    sel.innerHTML = cats.map(c =>
      `<option value="${c.id}" ${c.id === selectedId ? 'selected' : ''}>${c.icon || ''} ${c.name}</option>`
    ).join('');
  } catch (e) { console.error(e); }
}

// 解析 textarea 文本为数组
function parseLines(text) {
  return text.split('\n').map(s => s.trim()).filter(s => s);
}

function parseProcess(text) {
  return parseLines(text).map(line => {
    const parts = line.split('|');
    return { step: 0, title: (parts[0] || '').trim(), desc: (parts[1] || '').trim() };
  });
}

function parseCases(text) {
  return parseLines(text).map(line => {
    const parts = line.split('|');
    return { title: (parts[0] || '').trim(), desc: (parts[1] || '').trim(), result: (parts[2] || '').trim() };
  });
}

document.getElementById('product-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const id = document.getElementById('prod-id').value;

  const body = {
    categoryId: parseInt(document.getElementById('prod-category').value),
    name: document.getElementById('prod-name').value.trim(),
    subtitle: document.getElementById('prod-subtitle').value.trim(),
    price: Math.round(parseFloat(document.getElementById('prod-price').value) * 100),
    originalPrice: document.getElementById('prod-original-price').value
      ? Math.round(parseFloat(document.getElementById('prod-original-price').value) * 100) : null,
    scenario: document.getElementById('prod-scenario').value.trim(),
    roiHint: document.getElementById('prod-roi').value.trim(),
    features: parseLines(document.getElementById('prod-features').value),
    process: parseProcess(document.getElementById('prod-process').value),
    cases: parseCases(document.getElementById('prod-cases').value),
    guarantee: document.getElementById('prod-guarantee').value.trim(),
    sortOrder: parseInt(document.getElementById('prod-sort').value) || 0,
    isActive: document.getElementById('prod-active').value === '1',
  };

  // 清理空值
  Object.keys(body).forEach(k => {
    const v = body[k];
    if (v === '' || v === null || (Array.isArray(v) && v.length === 0 && k !== 'features' && k !== 'process' && k !== 'cases')) {
      delete body[k];
    }
  });

  try {
    if (id) {
      await api('/products/' + id, { method: 'PUT', body: JSON.stringify(body) });
      showToast('✅ 产品已更新');
    } else {
      await api('/products', { method: 'POST', body: JSON.stringify(body) });
      showToast('✅ 产品已创建');
    }
    closeProductModal();
    loadProducts();
  } catch (err) {
    showToast('❌ ' + err.message, true);
  }
});

async function deleteProduct(id) {
  if (!confirm('确定下架该产品吗？下架后用户将看不到该产品。')) return;
  try {
    await api('/products/' + id, { method: 'DELETE' });
    showToast('产品已下架');
    loadProducts();
  } catch (err) {
    showToast('❌ ' + err.message, true);
  }
}

// ==================== 分类管理 ====================
async function loadCategories() {
  try {
    const data = await api('/categories');
    const tbody = document.getElementById('category-tbody');
    tbody.innerHTML = data.map(c => `
      <tr>
        <td>${c.id}</td>
        <td style="font-size:24px">${c.icon || '📁'}</td>
        <td>${escHtml(c.name)}</td>
        <td>${c.sortOrder}</td>
        <td>${c.isActive ? '<span style="color:#4caf50">启用</span>' : '<span style="color:#999">禁用</span>'}</td>
        <td>
          <button class="btn btn-primary btn-sm" onclick="editCategory(${c.id})">编辑</button>
        </td>
      </tr>
    `).join('');

    // 缓存分类数据
    window._catCache = {};
    data.forEach(c => { window._catCache[c.id] = c; });
  } catch (e) { console.error(e); }
}

function editCategory(id) {
  const c = window._catCache[id];
  if (c) openCategoryModal(c);
}

function openCategoryModal(cat) {
  document.getElementById('category-modal').classList.add('show');
  if (cat) {
    document.getElementById('category-modal-title').textContent = '✏️ 编辑分类';
    document.getElementById('cat-id').value = cat.id;
    document.getElementById('cat-name').value = cat.name;
    document.getElementById('cat-icon').value = cat.icon || '';
    document.getElementById('cat-sort').value = cat.sortOrder || 0;
  } else {
    document.getElementById('category-modal-title').textContent = '➕ 新增分类';
    document.getElementById('category-form').reset();
    document.getElementById('cat-id').value = '';
  }
}

function closeCategoryModal() {
  document.getElementById('category-modal').classList.remove('show');
}

document.getElementById('category-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const id = document.getElementById('cat-id').value;
  const body = {
    name: document.getElementById('cat-name').value.trim(),
    icon: document.getElementById('cat-icon').value.trim(),
    sortOrder: parseInt(document.getElementById('cat-sort').value) || 0,
  };
  try {
    if (id) {
      await api('/categories/' + id, { method: 'PUT', body: JSON.stringify(body) });
      showToast('✅ 分类已更新');
    } else {
      await api('/categories', { method: 'POST', body: JSON.stringify(body) });
      showToast('✅ 分类已创建');
    }
    closeCategoryModal();
    loadCategories();
  } catch (err) {
    showToast('❌ ' + err.message, true);
  }
});

// ==================== 订单管理 ====================
const statusLabels = {
  pending: '待支付', paid: '已支付', delivering: '服务中',
  completed: '已完成', cancelled: '已取消', refunded: '已退款',
};

async function loadOrders() {
  try {
    const status = document.getElementById('order-status-filter')?.value || '';
    const data = await api('/orders?pageSize=50' + (status ? '&status=' + status : ''));
    const tbody = document.getElementById('order-tbody');
    tbody.innerHTML = data.list.map(o => `
      <tr>
        <td>${o.id}</td>
        <td style="font-family:monospace;font-size:11px;">${o.orderNo}</td>
        <td>${escHtml(o.productName)}</td>
        <td>${escHtml(o.user?.nickname || '-')}</td>
        <td>¥${(o.amount / 100).toFixed(0)}</td>
        <td><span class="tag tag-${o.status}">${statusLabels[o.status] || o.status}</span></td>
        <td style="font-size:12px;">${o.createdAt ? new Date(o.createdAt).toLocaleString('zh-CN') : '-'}</td>
        <td>
          ${o.status === 'paid' ? `<button class="btn btn-primary btn-sm" onclick="updateOrderStatus(${o.id}, 'delivering')">开始服务</button>` : ''}
          ${o.status === 'delivering' ? `<button class="btn btn-primary btn-sm" onclick="updateOrderStatus(${o.id}, 'completed')">完成</button>` : ''}
        </td>
      </tr>
    `).join('');
  } catch (e) { console.error(e); }
}

async function updateOrderStatus(id, status) {
  try {
    await api('/orders/' + id + '/status', { method: 'PUT', body: JSON.stringify({ status }) });
    showToast('✅ 订单状态已更新');
    loadOrders();
  } catch (err) {
    showToast('❌ ' + err.message, true);
  }
}

// ==================== 用户管理 ====================
async function loadUsers() {
  try {
    const data = await api('/users?pageSize=50');
    const tbody = document.getElementById('user-tbody');
    tbody.innerHTML = data.list.map(u => `
      <tr>
        <td>${u.id}</td>
        <td>${escHtml(u.nickname || '-')}</td>
        <td>${u.phone || '-'}</td>
        <td>${u.source || '-'}</td>
        <td>${u.createdAt ? new Date(u.createdAt).toLocaleString('zh-CN') : '-'}</td>
      </tr>
    `).join('');
  } catch (e) { console.error(e); }
}

// ========== 初始化 ==========
loadDashboard();
