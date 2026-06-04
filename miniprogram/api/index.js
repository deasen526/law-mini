// API 基础配置
const BASE_URL = 'http://localhost:3000/api';

// 获取存储的 token
function getToken() {
  return uni.getStorageSync('token') || '';
}

// 通用请求封装
async function request({ url, method = 'GET', data = {}, needAuth = false }) {
  const header = { 'Content-Type': 'application/json' };

  if (needAuth) {
    const token = getToken();
    if (token) {
      header['Authorization'] = `Bearer ${token}`;
    }
  }

  try {
    const res = await uni.request({
      url: BASE_URL + url,
      method,
      data,
      header,
    });

    if (res.statusCode === 200 && res.data.code === 0) {
      return res.data.data;
    }

    // 未登录
    if (res.statusCode === 401) {
      uni.removeStorageSync('token');
      uni.showToast({ title: '请先登录', icon: 'none' });
      throw new Error('未登录');
    }

    throw new Error(res.data.msg || '请求失败');
  } catch (err) {
    if (err.errMsg && err.errMsg.includes('request:fail')) {
      uni.showToast({ title: '网络异常，请重试', icon: 'none' });
    }
    throw err;
  }
}

// ==================== 产品相关 ====================
export function getCategories() {
  return request({ url: '/categories' });
}

export function getProducts(categoryId) {
  return request({ url: '/products', data: categoryId ? { categoryId } : {} });
}

export function getProductDetail(id) {
  return request({ url: `/products/${id}` });
}

// ==================== 用户相关 ====================
export function wxLogin(code, nickname, avatarUrl) {
  return request({
    url: '/users/login',
    method: 'POST',
    data: { code, nickname, avatarUrl },
  });
}

export function getProfile() {
  return request({ url: '/users/profile', needAuth: true });
}

// ==================== 订单相关 ====================
export function createOrder({ productId, quantity, contactName, contactPhone, remark }) {
  return request({
    url: '/orders',
    method: 'POST',
    data: { productId, quantity, contactName, contactPhone, remark },
    needAuth: true,
  });
}

export function payOrder(orderId) {
  return request({
    url: `/orders/${orderId}/pay`,
    method: 'POST',
    needAuth: true,
  });
}

export function getMyOrders(page = 1, pageSize = 10) {
  return request({
    url: '/orders',
    data: { page, pageSize },
    needAuth: true,
  });
}

export function getOrderDetail(id) {
  return request({ url: `/orders/${id}`, needAuth: true });
}
