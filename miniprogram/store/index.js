import { defineStore } from 'pinia';
import { wxLogin, getProfile } from '@/api/index.js';

export const useUserStore = defineStore('user', {
  state: () => ({
    token: '',
    userInfo: null,
    isLogin: false,
  }),

  actions: {
    // 微信一键登录
    async wxLogin() {
      try {
        // 1. 获取微信登录 code
        const loginRes = await uni.login({ provider: 'weixin' });
        const code = loginRes.code;

        // 2. 获取用户信息（如果用户授权过）
        let nickname = '';
        let avatarUrl = '';
        try {
          const userInfoRes = await uni.getUserInfo({ provider: 'weixin' });
          nickname = userInfoRes.userInfo.nickName;
          avatarUrl = userInfoRes.userInfo.avatarUrl;
        } catch (e) {
          console.log('用户未授权昵称头像');
        }

        // 3. 调后端登录接口
        const data = await wxLogin(code, nickname, avatarUrl);

        this.token = data.token;
        this.userInfo = data.user;
        this.isLogin = true;

        uni.setStorageSync('token', data.token);

        uni.showToast({ title: '登录成功', icon: 'success' });
        return data;
      } catch (err) {
        console.error('登录失败:', err);
        uni.showToast({ title: '登录失败，请重试', icon: 'none' });
        throw err;
      }
    },

    // 检查登录状态
    async checkLogin() {
      const token = uni.getStorageSync('token');
      if (!token) return false;

      try {
        const user = await getProfile();
        if (user) {
          this.token = token;
          this.userInfo = user;
          this.isLogin = true;
          return true;
        }
      } catch (e) {
        this.logout();
      }
      return false;
    },

    logout() {
      this.token = '';
      this.userInfo = null;
      this.isLogin = false;
      uni.removeStorageSync('token');
    },
  },
});

export const useCartStore = defineStore('cart', {
  state: () => ({
    // 当前待购买的产品（简单商城不需要购物车，选一个直接买）
    currentProduct: null,
  }),

  actions: {
    setCurrentProduct(product) {
      this.currentProduct = product;
    },
    clearCurrentProduct() {
      this.currentProduct = null;
    },
  },
});
