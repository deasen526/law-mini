<template>
  <view class="page">
    <scroll-view scroll-x class="category-tabs">
      <view class="tabs-inner">
        <view
          v-for="cat in categories"
          :key="cat.id"
          class="tab-item"
          :class="{ active: activeCategory === cat.id }"
          @click="switchCategory(cat)"
        >
          <text>{{ cat.icon }} {{ cat.name }}</text>
        </view>
      </view>
    </scroll-view>

    <view v-if="products.length > 0">
      <view v-for="product in products" :key="product.id" class="product-card" @click="goDetail(product.id)">
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

    <view v-else class="empty">
      <text class="empty-icon">📭</text>
      <text class="empty-text">暂无产品</text>
    </view>
  </view>
</template>

<script>
import { getCategories, getProducts } from '@/api/index.js';

export default {
  data() {
    return {
      categories: [],
      products: [],
      activeCategory: 0,
    };
  },
  onLoad(options) {
    if (options.categoryId) {
      this.activeCategory = parseInt(options.categoryId);
    }
    this.loadCategories();
  },
  methods: {
    async loadCategories() {
      try {
        const cats = await getCategories();
        this.categories = cats || [];
      } catch (e) {
        console.error(e);
      }
      if (this.activeCategory) {
        this.loadProducts(this.activeCategory);
      } else {
        this.loadProducts();
      }
    },
    async loadProducts(categoryId) {
      try {
        const prods = await getProducts(categoryId || undefined);
        this.products = prods || [];
      } catch (e) {
        this.products = [];
      }
    },
    switchCategory(cat) {
      this.activeCategory = cat.id;
      this.loadProducts(cat.id);
    },
    goDetail(id) {
      uni.navigateTo({ url: `/pages/product-detail/detail?id=${id}` });
    },
  },
};
</script>

<style scoped>
.page { padding-bottom: 40rpx; }
.category-tabs { background: #fff; white-space: nowrap; padding: 16rpx 0; margin-bottom: 8rpx; }
.tabs-inner { display: inline-flex; padding: 0 20rpx; gap: 16rpx; }
.tab-item { display: inline-flex; align-items: center; padding: 12rpx 24rpx; border-radius: 32rpx; font-size: 26rpx; background: #f5f5f5; color: #666; }
.tab-item.active { background: #e3f2fd; color: #1a6fb5; font-weight: 500; }
.product-card { background: #fff; border-radius: 16rpx; margin: 20rpx; display: flex; overflow: hidden; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04); }
.cover-placeholder { width: 200rpx; height: 200rpx; flex-shrink: 0; background: linear-gradient(135deg, #e3f2fd, #bbdefb); display: flex; align-items: center; justify-content: center; font-size: 64rpx; }
.info { flex: 1; padding: 20rpx 24rpx; display: flex; flex-direction: column; justify-content: space-between; min-width: 0; }
.name { font-size: 30rpx; font-weight: 600; color: #333; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.subtitle { font-size: 24rpx; color: #999; margin-top: 6rpx; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.price-row { margin-top: 12rpx; display: flex; align-items: baseline; }
.price-symbol { font-size: 24rpx; color: #f44336; font-weight: 600; }
.price-value { font-size: 40rpx; color: #f44336; font-weight: 700; }
.empty { display: flex; flex-direction: column; align-items: center; padding-top: 200rpx; }
.empty-icon { font-size: 80rpx; margin-bottom: 20rpx; }
.empty-text { font-size: 28rpx; color: #999; }
</style>
