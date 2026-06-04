<template>
  <view class="page">
    <!-- 用户信息头部 -->
    <view class="user-header">
      <image
        v-if="isLogin && userInfo.avatarUrl"
        :src="userInfo.avatarUrl"
        class="avatar"
      />
      <view v-else class="avatar-placeholder">👤</view>

      <view class="user-info">
        <view class="nickname" v-if="isLogin">
          {{ userInfo.nickname || '未设置昵称' }}
        </view>
        <view class="nickname" v-else>点击登录</view>
      </view>

      <button v-if="!isLogin" class="btn-login-sm" @click="doLogin">
        登录
      </button>
    </view>

    <!-- 订单统计 -->
    <view class="order-stats card" v-if="isLogin">
      <view class="stats-header">
        <text class="stats-title">我的订单</text>
        <text class="stats-more" @click="goOrderList">全部 →</text>
      </view>
    </view>

    <!-- 菜单 -->
    <view class="menu-list">
      <view class="menu-item" @click="goOrderList">
        <text class="menu-icon">📋</text>
        <text class="menu-text">我的订单</text>
        <text class="menu-arrow">→</text>
      </view>
      <button class="menu-item btn-item" open-type="contact">
        <text class="menu-icon">💬</text>
        <text class="menu-text">联系顾问</text>
        <text class="menu-arrow">→</text>
      </button>
      <view class="menu-item" @click="showAbout">
        <text class="menu-icon">ℹ️</text>
        <text class="menu-text">关于我们</text>
        <text class="menu-arrow">→</text>
      </view>
    </view>

    <!-- 退出登录 -->
    <view class="logout-section" v-if="isLogin">
      <button class="btn-logout" @click="doLogout">退出登录</button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useUserStore } from '@/store/index.js';

const userStore = useUserStore();
const isLogin = computed(() => userStore.isLogin);
const userInfo = computed(() => userStore.userInfo);

onMounted(async () => {
  if (!userStore.isLogin) {
    await userStore.checkLogin();
  }
});

async function doLogin() {
  try {
    await userStore.wxLogin();
  } catch (e) {
    // 登录失败
  }
}

function doLogout() {
  uni.showModal({
    title: '提示',
    content: '确定退出登录吗？',
    success(res) {
      if (res.confirm) {
        userStore.logout();
        uni.showToast({ title: '已退出', icon: 'none' });
      }
    },
  });
}

function goOrderList() {
  uni.switchTab({ url: '/pages/order-list/list' });
}

function showAbout() {
  uni.showModal({
    title: '关于我们',
    content: '法律助手——让每个人都用得起法律服务。\n\n我们致力于为普通老百姓提供普惠、专业、可信赖的法律咨询和维权辅助服务。\n\n合作律所：多家国内知名律所\n服务宗旨：用专业帮助每一个需要法律帮助的人。',
    showCancel: false,
    confirmText: '我知道了',
  });
}
</script>

<style scoped>
.page { padding-bottom: 40rpx; }

.user-header {
  background: linear-gradient(160deg, #1a6fb5, #1565c0);
  padding: 48rpx 32rpx;
  display: flex;
  align-items: center;
}

.avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  border: 4rpx solid rgba(255, 255, 255, 0.4);
}

.avatar-placeholder {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48rpx;
}

.user-info { flex: 1; margin-left: 24rpx; }

.nickname { font-size: 36rpx; color: #fff; font-weight: 500; }

.btn-login-sm {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  font-size: 26rpx;
  padding: 12rpx 32rpx;
  border-radius: 32rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.4);
}

.btn-login-sm::after { border: none; }

.card {
  background: #fff;
  border-radius: 16rpx;
  margin: 20rpx;
  padding: 28rpx;
}

.order-stats { margin-top: 24rpx; }

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stats-title { font-size: 30rpx; font-weight: 600; color: #333; }

.stats-more { font-size: 26rpx; color: #1a6fb5; }

.menu-list {
  background: #fff;
  margin: 20rpx;
  border-radius: 16rpx;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 28rpx 24rpx;
  border-bottom: 1rpx solid #f5f5f5;
  font-size: 28rpx;
}

.menu-item:last-child { border-bottom: none; }

.btn-item {
  background: none;
  border: none;
  text-align: left;
  width: 100%;
  border-radius: 0;
  border-bottom: 1rpx solid #f5f5f5;
}

.btn-item::after { border: none; }

.menu-icon { font-size: 36rpx; margin-right: 20rpx; }

.menu-text { flex: 1; color: #333; font-size: 28rpx; }

.menu-arrow { color: #ccc; font-size: 24rpx; }

.logout-section { padding: 32rpx 20rpx; }

.btn-logout {
  background: #fff;
  color: #f44336;
  font-size: 28rpx;
  padding: 24rpx;
  border-radius: 12rpx;
  border: none;
  width: 100%;
}

.btn-logout::after { border: none; }
</style>
