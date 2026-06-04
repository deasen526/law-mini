<template>
  <view class="page">
    <!-- 未登录提示 -->
    <view v-if="!loginChecked" class="loading">
      <text>加载中...</text>
    </view>

    <view v-else-if="!isLogin">
      <view class="login-prompt">
        <text class="login-icon">🔐</text>
        <text class="login-text">登录后查看您的订单</text>
        <button class="btn-login" @click="doLogin">微信一键登录</button>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-else-if="orders.length === 0" class="empty">
      <text class="empty-icon">📋</text>
      <text class="empty-text">还没有订单</text>
      <button class="btn-go" @click="goHome">去看看服务</button>
    </view>

    <!-- 订单列表 -->
    <view v-else>
      <view
        v-for="order in orders"
        :key="order.id"
        class="order-card"
        @click="goDetail(order.id)"
      >
        <view class="order-header">
          <text class="order-no">订单号：{{ order.orderNo }}</text>
          <text class="order-status" :class="'status-' + order.status">
            {{ statusMap[order.status] || order.status }}
          </text>
        </view>
        <view class="order-body">
          <view class="order-product">{{ order.productName }}</view>
          <view class="order-price">¥{{ (order.amount / 100).toFixed(0) }}</view>
        </view>
        <view class="order-time">{{ formatTime(order.createdAt) }}</view>
      </view>

      <!-- 加载更多 -->
      <view v-if="hasMore" class="load-more" @click="loadMore">
        <text>加载更多</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getMyOrders } from '@/api/index.js';
import { useUserStore } from '@/store/index.js';

const userStore = useUserStore();
const isLogin = ref(false);
const loginChecked = ref(false);
const orders = ref([]);
const page = ref(1);
const hasMore = ref(false);

const statusMap = {
  pending: '待支付',
  paid: '已支付',
  delivering: '服务中',
  completed: '已完成',
  cancelled: '已取消',
  refunded: '已退款',
};

onMounted(async () => {
  const loggedIn = await userStore.checkLogin();
  isLogin.value = loggedIn;
  loginChecked.value = true;

  if (loggedIn) {
    await loadOrders();
  }
});

async function loadOrders() {
  try {
    const data = await getMyOrders(page.value);
    if (page.value === 1) {
      orders.value = data.list;
    } else {
      orders.value.push(...data.list);
    }
    hasMore.value = orders.value.length < data.total;
  } catch (e) {
    console.error('加载订单失败:', e);
  }
}

async function doLogin() {
  try {
    await userStore.wxLogin();
    isLogin.value = true;
    await loadOrders();
  } catch (e) {
    // 登录失败
  }
}

function loadMore() {
  page.value++;
  loadOrders();
}

function goDetail(id) {
  uni.navigateTo({ url: `/pages/order-detail/detail?id=${id}` });
}

function goHome() {
  uni.switchTab({ url: '/pages/index/index' });
}

function formatTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hour = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${month}-${day} ${hour}:${min}`;
}
</script>

<style scoped>
.page { padding-bottom: 40rpx; }

.loading, .login-prompt, .empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 200rpx;
}

.login-icon, .empty-icon { font-size: 80rpx; margin-bottom: 20rpx; }

.login-text, .empty-text { font-size: 28rpx; color: #999; margin-bottom: 32rpx; }

.btn-login {
  background: linear-gradient(135deg, #07c160, #06ad56);
  color: #fff;
  font-size: 30rpx;
  padding: 20rpx 64rpx;
  border-radius: 44rpx;
  border: none;
}

.btn-login::after { border: none; }

.btn-go {
  background: #1a6fb5;
  color: #fff;
  font-size: 28rpx;
  padding: 16rpx 48rpx;
  border-radius: 44rpx;
  border: none;
}

.btn-go::after { border: none; }

.order-card {
  background: #fff;
  margin: 20rpx;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.03);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.order-no { font-size: 24rpx; color: #999; }

.order-status { font-size: 24rpx; font-weight: 500; }

.status-pending { color: #ff9800; }
.status-paid { color: #1a6fb5; }
.status-delivering { color: #2196f3; }
.status-completed { color: #4caf50; }
.status-cancelled { color: #ccc; }
.status-refunded { color: #999; }

.order-body {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.order-product { font-size: 30rpx; font-weight: 500; color: #333; flex: 1; }

.order-price { font-size: 32rpx; font-weight: 600; color: #333; }

.order-time { font-size: 24rpx; color: #999; }

.load-more {
  text-align: center;
  padding: 24rpx;
  font-size: 26rpx;
  color: #1a6fb5;
}
</style>
