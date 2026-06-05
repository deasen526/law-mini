<template>
  <view class="page">
    <view class="user-header">
      <view class="avatar-placeholder">👤</view>
      <view class="user-info">
        <view class="nickname">个人中心</view>
      </view>
    </view>

    <view class="menu-list">
      <view class="menu-item" @click="goOrderList">
        <text class="menu-icon">📋</text>
        <text class="menu-text">我的订单</text>
        <text class="menu-arrow">→</text>
      </view>
      <view class="menu-item" @click="showAbout">
        <text class="menu-icon">ℹ️</text>
        <text class="menu-text">关于我们</text>
        <text class="menu-arrow">→</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  methods: {
    goOrderList() {
      uni.switchTab({ url: '/pages/order-list/list' });
    },
    showAbout() {
      uni.showModal({
        title: '关于我们',
        content: '法律助手——让每个人都用得起法律服务。\n\n我们致力于为普通老百姓提供普惠、专业、可信赖的法律咨询和维权辅助服务。',
        showCancel: false,
        confirmText: '我知道了',
      });
    },
  },
};
</script>

<style scoped>
.page { padding-bottom: 40rpx; }
.user-header { background: linear-gradient(160deg, #1a6fb5, #1565c0); padding: 48rpx 32rpx; display: flex; align-items: center; }
.avatar-placeholder { width: 100rpx; height: 100rpx; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 48rpx; }
.user-info { flex: 1; margin-left: 24rpx; }
.nickname { font-size: 36rpx; color: #fff; font-weight: 500; }
.menu-list { background: #fff; margin: 20rpx; border-radius: 16rpx; overflow: hidden; }
.menu-item { display: flex; align-items: center; padding: 28rpx 24rpx; border-bottom: 1rpx solid #f5f5f5; font-size: 28rpx; }
.menu-item:last-child { border-bottom: none; }
.menu-icon { font-size: 36rpx; margin-right: 20rpx; }
.menu-text { flex: 1; color: #333; font-size: 28rpx; }
.menu-arrow { color: #ccc; font-size: 24rpx; }
</style>
