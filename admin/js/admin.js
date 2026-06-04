const API_BASE = 'http://localhost:3000/api/admin';

// ========== 认证检查 ==========
const token = localStorage.getItem('admin_token');
if (!token) {
  window.location.href = 'login.html';
}

// 通用请求
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
  } catch (e) {
    console.error(e);
  }
}

// ========== 产品管理 ==========
async function loadProducts() {
  try {
    const data = await api('/products');
    const tbody = document.getElementById('product-tbody');
    tbody.innerHTML = data.list.map(p => `
      <tr>
        <td>${p.id}</td>
        <td><strong>${p.name}</strong></td>
        <td>${p.category?.name || '-'}</td>
        <td>¥${(p.price / 100).toFixed(0)}</td>
        <td>${p.isActive ? '<span style="color:#4caf50">上架</span>' : '<span style="color:#999">下架</span>'}</td>
        <td>${p.sortOrder}</td>
        <td>
          <button class="btn btn-primary btn-sm" onclick='editProduct(${JSON.stringify(p).replace(/'/g, "&#39;")})'>编辑</button>
          <button class="btn btn-danger btn-sm" onclick="deleteProduct(${p.id})">下架</button>
        </td>
      </tr>
    `).join('');
  } catch (e) {
    console.error(e);
  }
}

function openProductModal(product) {
  document.getElementById('product-modal').classList.add('show');
  document.getElementById('prod-id').value = '';

  if (product) {
    document.getElementById('product-modal-title').textContent = '编辑产品';
    document.getElementById('prod-id').value = product.id;
    document.getElementById('prod-name').value = product.name;
    document.getElementById('prod-subtitle').value = product.subtitle || '';
    document.getElementById('prod-price').value = (product.price / 100).toFixed(0);
    document.getElementById('prod-original-price').value = product.originalPrice ? (product.originalPrice / 100).toFixed(0) : '';
    document.getElementById('prod-scenario').value = product.scenario || '';
    document.getElementById('prod-roi').value = product.roiHint || '';
    document.getElementById('prod-sort').value = product.sortOrder || 0;
    document.getElementById('prod-active').value = product.isActive ? '1' : '0';
  } else {
    document.getElementById('product-modal-title').textContent = '新增产品';
    document.getElementById('product-form').reset();
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
  } catch (e) {
    console.error(e);
  }
}

document.getElementById('product-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const id = document.getElementById('prod-id').value;
  const body = {
    categoryId: parseInt(document.getElementById('prod-category').value),
    name: document.getElementById('prod-name').value,
    subtitle: document.getElementById('prod-subtitle').value,
    price: Math.round(parseFloat(document.getElementById('prod-price').value) * 100),
    originalPrice: document.getElementById('prod-original-price').value
      ? Math.round(parseFloat(document.getElementById('prod-original-price').value) * 100) : null,
    scenario: document.getElementById('prod-scenario').value,
    roiHint: document.getElementById('prod-roi').value,
    sortOrder: parseInt(document.getElementById('prod-sort').value) || 0,
    isActive: document.getElementById('prod-active').value === '1',
  };
  // 移除空字段
  Object.keys(body).forEach(k => { if (body[k] === '' || body[k] === null) delete body[k]; });

  try {
    if (id) {
      await api('/products/' + id, { method: 'PUT', body: JSON.stringify(body) });
    } else {
      await api('/products', { method: 'POST', body: JSON.stringify(body) });
    }
    closeProductModal();
    loadProducts();
  } catch (err) {
    alert(err.message);
  }
});

function editProduct(p) {
  openProductModal(p);
}

async function deleteProduct(id) {
  if (!confirm('确定下架该产品吗？')) return;
  try {
    await api('/products/' + id, { method: 'DELETE' });
    loadProducts();
  } catch (err) {
    alert(err.message);
  }
}

// ========== 分类管理 ==========
async function loadCategories() {
  try {
    const data = await api('/categories');
    const tbody = document.getElementById('category-tbody');
    tbody.innerHTML = data.map(c => `
      <tr>
        <td>${c.id}</td>
        <td>${c.icon || '-'}</td>
        <td>${c.name}</td>
        <td>${c.sortOrder}</td>
        <td>${c.isActive ? '<span style="color:#4caf50">启用</span>' : '<span style="color:#999">禁用</span>'}</td>
        <td>
          <button class="btn btn-primary btn-sm" onclick='editCategory(${JSON.stringify(c).replace(/'/g, "&#39;")})'>编辑</button>
        </td>
      </tr>
    `).join('');
  } catch (e) {
    console.error(e);
  }
}

function openCategoryModal(cat) {
  document.getElementById('category-modal').classList.add('show');
  document.getElementById('cat-id').value = '';
  if (cat) {
    document.getElementById('category-modal-title').textContent = '编辑分类';
    document.getElementById('cat-id').value = cat.id;
    document.getElementById('cat-name').value = cat.name;
    document.getElementById('cat-icon').value = cat.icon || '';
    document.getElementById('cat-sort').value = cat.sortOrder || 0;
  } else {
    document.getElementById('category-modal-title').textContent = '新增分类';
    document.getElementById('category-form').reset();
  }
}

function closeCategoryModal() {
  document.getElementById('category-modal').classList.remove('show');
}

function editCategory(c) {
  openCategoryModal(c);
}

document.getElementById('category-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const id = document.getElementById('cat-id').value;
  const body = {
    name: document.getElementById('cat-name').value,
    icon: document.getElementById('cat-icon').value,
    sortOrder: parseInt(document.getElementById('cat-sort').value) || 0,
  };

  try {
    if (id) {
      await api('/categories/' + id, { method: 'PUT', body: JSON.stringify(body) });
    } else {
      await api('/categories', { method: 'POST', body: JSON.stringify(body) });
    }
    closeCategoryModal();
    loadCategories();
  } catch (err) {
    alert(err.message);
  }
});

// ========== 订单管理 ==========
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
        <td style="font-family:monospace;font-size:12px;">${o.orderNo}</td>
        <td>${o.productName}</td>
        <td>${o.user?.nickname || '-'}</td>
        <td>¥${(o.amount / 100).toFixed(0)}</td>
        <td><span class="tag tag-${o.status}">${statusLabels[o.status] || o.status}</span></td>
        <td style="font-size:12px;">${o.createdAt ? new Date(o.createdAt).toLocaleString('zh-CN') : '-'}</td>
        <td>
          ${o.status === 'paid' ? `<button class="btn btn-primary btn-sm" onclick="updateOrderStatus(${o.id}, 'delivering')">开始服务</button>` : ''}
          ${o.status === 'delivering' ? `<button class="btn btn-primary btn-sm" onclick="updateOrderStatus(${o.id}, 'completed')">完成</button>` : ''}
        </td>
      </tr>
    `).join('');
  } catch (e) {
    console.error(e);
  }
}

async function updateOrderStatus(id, status) {
  try {
    await api('/orders/' + id + '/status', {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    loadOrders();
  } catch (err) {
    alert(err.message);
  }
}

// ========== 用户管理 ==========
async function loadUsers() {
  try {
    const data = await api('/users?pageSize=50');
    const tbody = document.getElementById('user-tbody');
    tbody.innerHTML = data.list.map(u => `
      <tr>
        <td>${u.id}</td>
        <td>${u.nickname || '-'}</td>
        <td>${u.phone || '-'}</td>
        <td>${u.source || '-'}</td>
        <td>${u.createdAt ? new Date(u.createdAt).toLocaleString('zh-CN') : '-'}</td>
      </tr>
    `).join('');
  } catch (e) {
    console.error(e);
  }
}

// ========== 初始化 ==========
loadDashboard();
