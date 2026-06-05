<template>
  <view class="page">
    <!-- 未登录 -->
    <view v-if="!isLogin" class="login-page">
      <view class="login-card">
        <view class="login-avatar">☺</view>
        <view class="login-title">登录后查看订单</view>
        <view class="login-desc">微信一键登录，安全便捷</view>
        <button class="btn-login" @click="doLogin">微信一键登录</button>
      </view>
    </view>

    <!-- 加载中 -->
    <view v-else-if="loading" class="skeleton-list">
      <view v-for="i in 3" :key="i" class="skeleton-order">
        <view class="skeleton skeleton-header"></view>
        <view class="skeleton skeleton-body"></view>
        <view class="skeleton skeleton-footer"></view>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-else-if="orders.length === 0" class="empty">
      <view class="empty-graphic">📋</view>
      <text class="empty-text">还没有订单</text>
      <text class="empty-hint">选购服务后订单会出现在这里</text>
      <view class="empty-btn" @click="goShop">去选购</view>
    </view>

    <!-- 订单列表 -->
    <view v-else>
      <view
        v-for="order in orders"
        :key="order.id"
        class="order-card pressable"
        @click="goDetail(order.id)"
      >
        <view class="order-header">
          <text class="order-no">{{ order.orderNo }}</text>
          <text class="badge" :class="'badge-' + order.status">
            {{ statusMap[order.status] || order.status }}
          </text>
        </view>
        <view class="order-body">
          <view class="order-product">{{ order.productName }}</view>
          <view class="order-price">¥{{ (order.amount/100).toFixed(0) }}</view>
        </view>
        <view class="order-time">{{ formatTime(order.createdAt) }}</view>
      </view>
    </view>
  </view>
</template>

<script>
import { getMyOrders } from '@/api/index.js';

export default {
  data: function () {
    return {
      isLogin: false,
      orders: [],
      loading: false,
      statusMap: {
        pending: '待支付', paid: '已支付', delivering: '服务中',
        completed: '已完成', cancelled: '已取消', refunded: '已退款',
      },
    };
  },
  onShow: function () {
    var token = uni.getStorageSync('token');
    this.isLogin = !!token;
    if (this.isLogin) {
      this.loadOrders();
    }
  },
  methods: {
    loadOrders: async function () {
      this.loading = true;
      try {
        var data = await getMyOrders();
        this.orders = data.list || [];
      } catch (e) {
        this.orders = [];
      } finally {
        this.loading = false;
      }
    },
    doLogin: function () {
      uni.showToast({ title: '请在微信中登录', icon: 'none' });
    },
    goDetail: function (id) {
      uni.navigateTo({ url: '/pages/order-detail/detail?id=' + id });
    },
    goShop: function () {
      uni.switchTab({ url: '/pages/product/list' });
    },
    formatTime: function (dateStr) {
      if (!dateStr) return '';
      var d = new Date(dateStr);
      var m = String(d.getMonth() + 1).padStart(2, '0');
      var day = String(d.getDate()).padStart(2, '0');
      var h = String(d.getHours()).padStart(2, '0');
      var min = String(d.getMinutes()).padStart(2, '0');
      return m + '-' + day + ' ' + h + ':' + min;
    },
  },
};
</script>

<style scoped>
.page { padding-bottom: calc(40rpx + env(safe-area-inset-bottom)); }

/* ---- 登录 ---- */
.login-page { display: flex; justify-content: center; padding-top: 160rpx; }
.login-card {
  background: #fff; border-radius: 24rpx; padding: 56rpx 48rpx;
  text-align: center; box-shadow: 0 4rpx 24rpx rgba(0,0,0,0.06);
  display: flex; flex-direction: column; align-items: center;
  width: 560rpx;
}
.login-avatar {
  width: 120rpx; height: 120rpx; border-radius: 50%;
  background: linear-gradient(135deg, #e3f2fd, #bbdefb);
  display: flex; align-items: center; justify-content: center;
  font-size: 56rpx; color: #1a6fb5; margin-bottom: 24rpx;
}
.login-title { font-size: 32rpx; font-weight: 600; color: #333; margin-bottom: 8rpx; }
.login-desc { font-size: 24rpx; color: #999; margin-bottom: 40rpx; }
.btn-login {
  background: linear-gradient(135deg, #07c160, #06ad56); color: #fff;
  font-size: 30rpx; padding: 20rpx 80rpx; border-radius: 44rpx; border: none;
}
.btn-login::after { border: none; }

/* ---- 空状态 ---- */
.empty { display: flex; flex-direction: column; align-items: center; padding-top: 180rpx; }
.empty-graphic { font-size: 80rpx; margin-bottom: 24rpx; opacity: 0.6; }
.empty-text { font-size: 28rpx; color: #999; }
.empty-hint { font-size: 24rpx; color: #ccc; margin-top: 8rpx; margin-bottom: 40rpx; }
.empty-btn {
  padding: 16rpx 48rpx; border-radius: 40rpx;
  background: linear-gradient(135deg, #1a6fb5, #2196f3); color: #fff; font-size: 28rpx;
}

/* ---- 订单卡片 ---- */
.order-card {
  background: #fff; margin: 20rpx; border-radius: 20rpx;
  padding: 24rpx; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.03);
  transition: transform 0.15s;
}
.order-card:active { transform: scale(0.98); }
.order-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16rpx; }
.order-no { font-size: 24rpx; color: #999; font-family: monospace; }
.order-body { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12rpx; }
.order-product { font-size: 30rpx; font-weight: 500; color: #333; flex: 1; }
.order-price { font-size: 32rpx; font-weight: 600; color: #f44336; }
.order-time { font-size: 24rpx; color: #999; }

/* ---- 骨架屏 ---- */
.skeleton-list { padding: 0 20rpx; }
.skeleton-order { background: #fff; border-radius: 20rpx; padding: 24rpx; margin: 20rpx 0; }
.skeleton-header { height: 24rpx; width: 50%; margin-bottom: 20rpx; }
.skeleton-body { height: 32rpx; width: 70%; margin-bottom: 16rpx; }
.skeleton-footer { height: 20rpx; width: 35%; }
</style>
