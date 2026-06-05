<template>
  <view class="page">
    <!-- 头部 -->
    <view class="user-header">
      <image v-if="isLogin && avatarUrl" :src="avatarUrl" class="avatar" mode="aspectFill" />
      <view v-else class="avatar-placeholder">&#9786;</view>
      <view class="user-info">
        <view class="nickname">{{ nickname }}</view>
        <view class="user-tip" v-if="!isLogin">点击登录，管理您的法律服务</view>
      </view>
    </view>

    <!-- 菜单 -->
    <view class="menu-list">
      <view class="menu-item" @click="goOrderList">
        <text class="menu-icon icon-orders">&#9776;</text>
        <text class="menu-text">我的订单</text>
        <text class="menu-arrow">&#8250;</text>
      </view>

      <button class="menu-item menu-btn" open-type="contact" session-from="user_center">
        <text class="menu-icon icon-service">&#9993;</text>
        <text class="menu-text">联系客服</text>
        <text class="menu-arrow">&#8250;</text>
      </button>

      <view class="menu-item" @click="showFAQ">
        <text class="menu-icon icon-faq">&#63;</text>
        <text class="menu-text">常见问题</text>
        <text class="menu-arrow">&#8250;</text>
      </view>

      <view class="menu-item" @click="showAbout">
        <text class="menu-icon icon-about">&#8505;</text>
        <text class="menu-text">关于我们</text>
        <text class="menu-arrow">&#8250;</text>
      </view>
    </view>

    <!-- 退出登录 -->
    <view class="logout-section" v-if="isLogin">
      <view class="logout-btn" @click="doLogout">退出登录</view>
    </view>
  </view>
</template>

<script>
import { useUserStore } from '@/store/index.js';

export default {
  data: function () {
    return {
      userStore: useUserStore(),
    };
  },
  computed: {
    nickname: function () {
      return this.userStore.userInfo && this.userStore.userInfo.nickname
        ? this.userStore.userInfo.nickname : '个人中心';
    },
    avatarUrl: function () {
      return this.userStore.userInfo && this.userStore.userInfo.avatarUrl
        ? this.userStore.userInfo.avatarUrl : '';
    },
    isLogin: function () {
      return this.userStore.isLogin;
    },
  },
  onShow: function () {
    this.userStore.checkLogin();
  },
  methods: {
    goOrderList: function () {
      uni.switchTab({ url: '/pages/order-list/list' });
    },
    showAbout: function () {
      uni.showModal({
        title: '关于我们',
        content: '法律助手——让每个人都用得起法律服务。\n\n我们致力于为普通老百姓提供普惠、专业、可信赖的法律咨询和维权辅助服务。',
        showCancel: false,
        confirmText: '我知道了',
      });
    },
    showFAQ: function () {
      uni.showModal({
        title: '常见问题',
        content: 'Q: 下单后多久联系我？\nA: 24小时内会有法律顾问联系您。\n\nQ: 不满意能退款吗？\nA: 购买后7天内可申请退款。\n\nQ: 服务是否保密？\nA: 我们严格遵守律师-客户保密义务。',
        showCancel: false,
        confirmText: '我知道了',
      });
    },
    doLogout: function () {
      var that = this;
      uni.showModal({
        title: '确认退出',
        content: '退出后需要重新登录',
        success: function (res) {
          if (res.confirm) {
            that.userStore.logout();
          }
        },
      });
    },
  },
};
</script>

<style scoped>
.page { padding-bottom: calc(40rpx + env(safe-area-inset-bottom)); }

/* ---- 头部 ---- */
.user-header {
  background: linear-gradient(160deg, #1a6fb5, #1565c0);
  padding: 64rpx 32rpx 56rpx; display: flex; align-items: center;
  border-radius: 0 0 48rpx 48rpx;
}
.avatar { width: 120rpx; height: 120rpx; border-radius: 50%; border: 4rpx solid rgba(255,255,255,0.35); }
.avatar-placeholder {
  width: 120rpx; height: 120rpx; border-radius: 50%;
  background: rgba(255,255,255,0.18); border: 4rpx solid rgba(255,255,255,0.25);
  display: flex; align-items: center; justify-content: center;
  font-size: 52rpx; color: rgba(255,255,255,0.7);
}
.user-info { flex: 1; margin-left: 24rpx; }
.nickname { font-size: 36rpx; color: #fff; font-weight: 600; }
.user-tip { font-size: 24rpx; color: rgba(255,255,255,0.7); margin-top: 6rpx; }

/* ---- 菜单 ---- */
.menu-list { background: #fff; margin: 24rpx 20rpx; border-radius: 20rpx; overflow: hidden; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.03); }
.menu-item { display: flex; align-items: center; padding: 32rpx 24rpx; border-bottom: 1rpx solid #f5f5f5; font-size: 28rpx; transition: background 0.15s; }
.menu-item:active { background: #f9f9f9; }
.menu-item:last-child { border-bottom: none; }
.menu-btn { background: none; border: none; width: 100%; text-align: left; margin: 0; line-height: 1.4; }
.menu-btn::after { border: none; }
.menu-icon { font-size: 36rpx; margin-right: 20rpx; width: 52rpx; text-align: center; color: #666; }
.menu-text { flex: 1; color: #333; font-size: 28rpx; }
.menu-arrow { color: #ccc; font-size: 26rpx; }

/* ---- 退出 ---- */
.logout-section { padding: 40rpx 20rpx; text-align: center; }
.logout-btn { display: inline-block; padding: 16rpx 48rpx; font-size: 26rpx; color: #f44336; border: 2rpx solid #f44336; border-radius: 40rpx; }
</style>
