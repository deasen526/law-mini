<template>
  <view class="page">
    <view class="hero">
      <view class="hero-title">遇到法律问题？</view>
      <view class="hero-sub">专业法律顾问，帮你理清每一步</view>
      <view class="hero-stats">
        <view class="stat-item">
          <view class="stat-num">12,000+</view>
          <view class="stat-label">已服务人数</view>
        </view>
        <view class="stat-item">
          <view class="stat-num">8,500+</view>
          <view class="stat-label">累计案例</view>
        </view>
        <view class="stat-item">
          <view class="stat-num">96%</view>
          <view class="stat-label">用户好评</view>
        </view>
      </view>
    </view>

    <view class="section">
      <view class="section-title">选择你的问题</view>
      <view class="scenario-grid">
        <view v-for="cat in categories" :key="cat.id" class="scenario-card" @click="goToCategory(cat)">
          <text class="scenario-icon">{{ cat.icon }}</text>
          <text class="scenario-name">{{ cat.name }}</text>
        </view>
      </view>
    </view>

    <view class="section" v-if="hotProducts.length > 0">
      <view class="section-title">热门服务</view>
      <view v-for="product in hotProducts" :key="product.id" class="product-card" @click="goDetail(product.id)">
        <view class="cover-placeholder">⚖️</view>
        <view class="info">
          <view class="name">{{ product.name }}</view>
          <view class="subtitle" v-if="product.subtitle">{{ product.subtitle }}</view>
          <view class="price-row">
            <text class="price-symbol">¥</text>
            <text class="price-value">{{ (product.price/100).toFixed(0) }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="trust-bar">
      <view class="trust-item">
        <text class="trust-icon">🔒</text>
        <text class="trust-text">合作律所背书</text>
      </view>
      <view class="trust-item">
        <text class="trust-icon">↩️</text>
        <text class="trust-text">不满意可退款</text>
      </view>
      <view class="trust-item">
        <text class="trust-icon">💬</text>
        <text class="trust-text">1对1专属服务</text>
      </view>
    </view>
  </view>
</template>

<script>
import { getCategories, getProducts } from '@/api/index.js';

export default {
  data() {
    return {
      categories: [
        { id: 1, name: '劳动维权', icon: '⚖️' },
        { id: 2, name: '租房纠纷', icon: '🏠' },
        { id: 3, name: '法律文书', icon: '📄' },
        { id: 4, name: '年度服务', icon: '⭐' },
      ],
      hotProducts: [],
    };
  },
  onLoad() {
    console.log('[首页] onLoad 触发');
    this.loadData();
  },
  methods: {
    async loadData() {
      try {
        const cats = await getCategories();
        if (cats && cats.length > 0) this.categories = cats;
      } catch (e) {
        console.error('[首页] 加载分类失败:', e);
      }
      try {
        const prods = await getProducts();
        if (prods && prods.length > 0) this.hotProducts = prods.slice(0, 3);
      } catch (e) {
        console.error('[首页] 加载产品失败:', e);
      }
    },
    goToCategory(cat) {
      uni.navigateTo({ url: `/pages/product/list?categoryId=${cat.id}&categoryName=${cat.name}` });
    },
    goDetail(id) {
      uni.navigateTo({ url: `/pages/product-detail/detail?id=${id}` });
    },
  },
};
</script>

<style scoped>
.page { padding-bottom: 40rpx; }
.hero {
  background: linear-gradient(160deg, #1a6fb5, #1565c0, #0d47a1);
  padding: 48rpx 32rpx 40rpx;
  color: #fff;
}
.hero-title { font-size: 44rpx; font-weight: 700; margin-bottom: 8rpx; }
.hero-sub { font-size: 28rpx; opacity: 0.9; margin-bottom: 24rpx; }
.hero-stats { display: flex; justify-content: space-around; padding-top: 24rpx; border-top: 1rpx solid rgba(255,255,255,0.2); }
.stat-item { text-align: center; }
.stat-num { font-size: 36rpx; font-weight: 700; }
.stat-label { font-size: 22rpx; opacity: 0.8; margin-top: 4rpx; }
.section { margin-top: 24rpx; }
.section-title { font-size: 32rpx; font-weight: 600; color: #333; padding: 24rpx 20rpx 16rpx; }
.scenario-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16rpx; padding: 0 20rpx; }
.scenario-card { background: #fff; border-radius: 16rpx; padding: 28rpx 24rpx; text-align: center; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04); display: flex; flex-direction: column; align-items: center; }
.scenario-icon { font-size: 48rpx; margin-bottom: 12rpx; }
.scenario-name { font-size: 28rpx; font-weight: 500; color: #333; }
.product-card { background: #fff; border-radius: 16rpx; margin: 20rpx; display: flex; overflow: hidden; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04); }
.cover-placeholder { width: 200rpx; height: 200rpx; flex-shrink: 0; background: linear-gradient(135deg, #e3f2fd, #bbdefb); display: flex; align-items: center; justify-content: center; font-size: 64rpx; }
.info { flex: 1; padding: 20rpx 24rpx; display: flex; flex-direction: column; justify-content: space-between; min-width: 0; }
.name { font-size: 30rpx; font-weight: 600; color: #333; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.subtitle { font-size: 24rpx; color: #999; margin-top: 6rpx; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.price-row { margin-top: 12rpx; display: flex; align-items: baseline; }
.price-symbol { font-size: 24rpx; color: #f44336; font-weight: 600; }
.price-value { font-size: 40rpx; color: #f44336; font-weight: 700; }
.trust-bar { display: flex; justify-content: space-around; padding: 24rpx 20rpx; margin: 24rpx 20rpx 0; background: #fff; border-radius: 16rpx; }
.trust-item { display: flex; flex-direction: column; align-items: center; }
.trust-icon { font-size: 32rpx; margin-bottom: 6rpx; }
.trust-text { font-size: 22rpx; color: #666; }
</style>
