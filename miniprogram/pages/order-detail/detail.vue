<template>
  <view class="page" v-if="order">
    <view class="status-bar" :class="'status-bg-' + order.status">
      <view class="status-icon">{{ statusIcon[order.status] }}</view>
      <view class="status-text">{{ statusMap[order.status] }}</view>
    </view>

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

    <view class="nav-links">
      <text class="nav-link" @click="goHome">返回首页</text>
      <text class="nav-link" @click="goOrders">查看全部订单</text>
    </view>
  </view>
  <view v-else class="loading"><text>加载中...</text></view>
</template>

<script>
import { getOrderDetail } from '@/api/index.js';

export default {
  data() {
    return {
      order: null,
      statusMap: {
        pending: '待支付', paid: '已支付', delivering: '服务中',
        completed: '已完成', cancelled: '已取消', refunded: '已退款',
      },
      statusIcon: {
        pending: '⏳', paid: '✅', delivering: '🔄',
        completed: '🎉', cancelled: '❌', refunded: '↩️',
      },
    };
  },
  onLoad(options) {
    if (options.id) {
      this.loadOrder(options.id);
    }
  },
  methods: {
    async loadOrder(id) {
      try {
        this.order = await getOrderDetail(id);
      } catch (e) {
        uni.showToast({ title: '加载失败', icon: 'none' });
      }
    },
    goHome() { uni.switchTab({ url: '/pages/index/index' }); },
    goOrders() { uni.switchTab({ url: '/pages/order-list/list' }); },
    formatDate(dateStr) {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const h = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      return `${y}-${m}-${day} ${h}:${min}`;
    },
  },
};
</script>

<style scoped>
.page { padding-bottom: 40rpx; }
.status-bar { padding: 48rpx 32rpx; text-align: center; color: #fff; }
.status-bg-pending { background: linear-gradient(135deg, #ff9800, #f57c00); }
.status-bg-paid { background: linear-gradient(135deg, #1a6fb5, #2196f3); }
.status-bg-delivering { background: linear-gradient(135deg, #2196f3, #42a5f5); }
.status-bg-completed { background: linear-gradient(135deg, #4caf50, #66bb6a); }
.status-bg-cancelled { background: #ccc; }
.status-bg-refunded { background: #999; }
.status-icon { font-size: 64rpx; margin-bottom: 12rpx; }
.status-text { font-size: 36rpx; font-weight: 600; }
.card { background: #fff; border-radius: 16rpx; margin: 20rpx; padding: 28rpx; }
.card-title { font-size: 30rpx; font-weight: 600; color: #333; margin-bottom: 20rpx; padding-bottom: 16rpx; border-bottom: 1rpx solid #f0f0f0; }
.info-row { display: flex; justify-content: space-between; padding: 14rpx 0; }
.info-label { font-size: 28rpx; color: #999; }
.info-value { font-size: 28rpx; color: #333; }
.info-value.mono { font-family: monospace; font-size: 24rpx; }
.info-value.price { color: #f44336; font-weight: 600; font-size: 32rpx; }
.nav-links { display: flex; justify-content: center; gap: 48rpx; padding: 24rpx; }
.nav-link { font-size: 26rpx; color: #1a6fb5; }
.loading { display: flex; justify-content: center; padding-top: 200rpx; color: #999; }
</style>
