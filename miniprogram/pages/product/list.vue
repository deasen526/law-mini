<template>
  <view class="page">
    <!-- 分类标签 -->
    <scroll-view scroll-x class="category-tabs">
      <view class="tabs-inner">
        <view
          v-for="cat in categories"
          :key="cat.id"
          class="tab-item"
          :class="{ active: activeCategory === cat.id }"
          @click="switchCategory(cat)"
        >
          <text>{{ cat.name }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- 加载态 -->
    <view v-if="loading" class="skeleton-list">
      <view v-for="i in 3" :key="i" class="skeleton-card">
        <view class="skeleton skeleton-img"></view>
        <view class="skeleton-info">
          <view class="skeleton skeleton-line-long"></view>
          <view class="skeleton skeleton-line-short"></view>
          <view class="skeleton skeleton-price"></view>
        </view>
      </view>
    </view>

    <!-- 产品列表 -->
    <view v-else-if="products.length > 0">
      <ProductCard v-for="product in products" :key="product.id" :product="product" />
    </view>

    <!-- 空状态 -->
    <view v-else class="empty">
      <view class="empty-graphic">📄</view>
      <text class="empty-text">该分类下暂无服务</text>
      <text class="empty-hint">敬请期待更多法律产品</text>
      <view class="empty-btn" @click="goHome">返回首页</view>
    </view>
  </view>
</template>

<script>
import { getCategories, getProducts } from '@/api/index.js';
import ProductCard from '@/components/ProductCard.vue';

export default {
  components: { ProductCard },
  data: function () {
    return {
      categories: [],
      products: [],
      activeCategory: 0,
      loading: true,
    };
  },
  onLoad: function (options) {
    if (options.categoryId) {
      this.activeCategory = parseInt(options.categoryId);
    }
    this.loadCategories();
  },
  methods: {
    loadCategories: async function () {
      try {
        var cats = await getCategories();
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
    loadProducts: async function (categoryId) {
      this.loading = true;
      try {
        var prods = await getProducts(categoryId || undefined);
        this.products = prods || [];
      } catch (e) {
        this.products = [];
      } finally {
        this.loading = false;
      }
    },
    switchCategory: function (cat) {
      this.activeCategory = cat.id;
      this.loadProducts(cat.id);
    },
    goDetail: function (id) {
      uni.navigateTo({ url: '/pages/product-detail/detail?id=' + id });
    },
    goHome: function () {
      uni.switchTab({ url: '/pages/index/index' });
    },
  },
};
</script>

<style scoped>
.page { padding-bottom: calc(40rpx + env(safe-area-inset-bottom)); }

/* ---- 分类标签 ---- */
.category-tabs { background: #fff; white-space: nowrap; padding: 20rpx 0; margin-bottom: 8rpx; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.03); }
.tabs-inner { display: inline-flex; padding: 0 20rpx; gap: 16rpx; }
.tab-item {
  display: inline-flex; align-items: center;
  padding: 14rpx 28rpx; border-radius: 32rpx;
  font-size: 26rpx; background: #f5f5f5; color: #666;
  transition: all 0.2s ease;
}
.tab-item.active { background: #1a6fb5; color: #fff; font-weight: 500; box-shadow: 0 2rpx 8rpx rgba(26,111,181,0.25); }

/* ---- 骨架屏 ---- */
.skeleton-list { padding: 0 20rpx; }
.skeleton-card { display: flex; margin: 20rpx 0; background: #fff; border-radius: 16rpx; overflow: hidden; height: 200rpx; }
.skeleton-img { width: 200rpx; height: 200rpx; flex-shrink: 0; }
.skeleton-info { flex: 1; padding: 28rpx 24rpx; display: flex; flex-direction: column; gap: 16rpx; }
.skeleton-line-long { height: 24rpx; width: 70%; }
.skeleton-line-short { height: 20rpx; width: 45%; }
.skeleton-price { height: 32rpx; width: 30%; }

/* ---- 空状态 ---- */
.empty { display: flex; flex-direction: column; align-items: center; padding-top: 180rpx; }
.empty-graphic { font-size: 80rpx; margin-bottom: 24rpx; opacity: 0.6; }
.empty-text { font-size: 28rpx; color: #999; }
.empty-hint { font-size: 24rpx; color: #ccc; margin-top: 8rpx; margin-bottom: 40rpx; }
.empty-btn {
  padding: 16rpx 48rpx; border-radius: 40rpx;
  background: linear-gradient(135deg, #1a6fb5, #2196f3);
  color: #fff; font-size: 28rpx;
}
</style>
