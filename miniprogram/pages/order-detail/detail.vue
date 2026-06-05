<template>
  <view class="page" v-if="order">
    <!-- 状态栏 -->
    <view class="status-bar" :class="'status-bg-' + order.status">
      <view class="status-text">{{ statusMap[order.status] }}</view>
      <view class="status-sub">{{ statusSub[order.status] }}</view>
    </view>

    <!-- 服务信息 -->
    <view class="card">
      <view class="card-title">服务信息</view>
      <view class="info-row">
        <text class="info-label">服务名称</text>
        <text class="info-value">{{ order.productName }}</text>
      </view>
      <view class="info-row">
        <text class="info-label">订单编号</text>
        <text class="info-value mono">{{ order.orderNo }}</text>
      </view>
      <view class="info-row">
        <text class="info-label">支付金额</text>
        <text class="info-value price">¥{{ (order.amount/100).toFixed(0) }}</text>
      </view>
      <view class="info-row">
        <text class="info-label">创建时间</text>
        <text class="info-value">{{ formatDate(order.createdAt) }}</text>
      </view>
    </view>

    <!-- 导航 -->
    <view class="nav-links">
      <view class="nav-btn" @click="goHome">返回首页</view>
      <view class="nav-btn nav-btn-primary" @click="goOrders">查看全部订单</view>
    </view>
  </view>

  <!-- 骨架屏 -->
  <view v-else class="loading-page">
    <view class="skeleton skeleton-bar"></view>
    <view class="skeleton skeleton-card" style="height:280rpx;"></view>
  </view>
</template>

<script>
import { getOrderDetail } from '@/api/index.js';

export default {
  data: function () {
    return {
      order: null,
      statusMap: {
        pending: '待支付', paid: '已支付', delivering: '服务中',
        completed: '已完成', cancelled: '已取消', refunded: '已退款',
      },
      statusSub: {
        pending: '请尽快完成支付', paid: '顾问将尽快联系您', delivering: '服务进行中',
        completed: '感谢您的信任', cancelled: '订单已取消', refunded: '已退款',
      },
    };
  },
  onLoad: function (options) {
    if (options.id) {
      this.loadOrder(options.id);
    }
  },
  methods: {
    loadOrder: async function (id) {
      try {
        this.order = await getOrderDetail(id);
      } catch (e) {
        uni.showToast({ title: '加载失败', icon: 'none' });
      }
    },
    goHome: function () { uni.switchTab({ url: '/pages/index/index' }); },
    goOrders: function () { uni.switchTab({ url: '/pages/order-list/list' }); },
    formatDate: function (dateStr) {
      if (!dateStr) return '';
      var d = new Date(dateStr);
      var y = d.getFullYear();
      var m = String(d.getMonth() + 1).padStart(2, '0');
      var day = String(d.getDate()).padStart(2, '0');
      var h = String(d.getHours()).padStart(2, '0');
      var min = String(d.getMinutes()).padStart(2, '0');
      return y + '-' + m + '-' + day + ' ' + h + ':' + min;
    },
  },
};
</script>

<style scoped>
.page { padding-bottom: calc(40rpx + env(safe-area-inset-bottom)); }

/* ---- 状态栏 ---- */
.status-bar {
  padding: 56rpx 32rpx 40rpx; text-align: center; color: #fff;
}
.status-bg-pending { background: linear-gradient(135deg, #ff9800, #f57c00); }
.status-bg-paid { background: linear-gradient(135deg, #1a6fb5, #2196f3); }
.status-bg-delivering { background: linear-gradient(135deg, #2196f3, #42a5f5); }
.status-bg-completed { background: linear-gradient(135deg, #4caf50, #66bb6a); }
.status-bg-cancelled { background: #ccc; }
.status-bg-refunded { background: #999; }
.status-text { font-size: 40rpx; font-weight: 700; letter-spacing: 2rpx; }
.status-sub { font-size: 24rpx; opacity: 0.85; margin-top: 8rpx; }

/* ---- 卡片 ---- */
.card { background: #fff; border-radius: 20rpx; margin: 20rpx; padding: 32rpx 28rpx; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.03); }
.card-title { font-size: 30rpx; font-weight: 600; color: #333; margin-bottom: 20rpx; padding-bottom: 16rpx; border-bottom: 1rpx solid #f0f0f0; padding-left: 20rpx; border-left: 6rpx solid #1a6fb5; }
.info-row { display: flex; justify-content: space-between; align-items: center; padding: 14rpx 0; }
.info-label { font-size: 28rpx; color: #999; }
.info-value { font-size: 28rpx; color: #333; }
.info-value.mono { font-family: monospace; font-size: 24rpx; letter-spacing: 1rpx; }
.info-value.price { color: #f44336; font-weight: 600; font-size: 32rpx; }

/* ---- 导航 ---- */
.nav-links { display: flex; justify-content: center; gap: 24rpx; padding: 24rpx 20rpx; }
.nav-btn {
  padding: 16rpx 40rpx; border-radius: 40rpx;
  font-size: 26rpx; color: #666; background: #f5f5f5;
  transition: background 0.15s;
}
.nav-btn-primary { background: #1a6fb5; color: #fff; }

/* ---- 骨架屏 ---- */
.loading-page { padding: 20rpx; }
.skeleton-bar { height: 180rpx; margin-bottom: 20rpx; border-radius: 0; }
.skeleton-card { border-radius: 20rpx; }
</style>
