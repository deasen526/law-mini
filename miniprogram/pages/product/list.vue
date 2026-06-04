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
          <text>{{ cat.icon }} {{ cat.name }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- 产品列表 -->
    <view v-if="products.length > 0">
      <ProductCard
        v-for="product in products"
        :key="product.id"
        :product="product"
      />
    </view>

    <view v-else class="empty">
      <text class="empty-icon">📭</text>
      <text class="empty-text">暂无产品</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getCategories, getProducts } from '@/api/index.js';
import ProductCard from '@/components/ProductCard.vue';

const categories = ref([]);
const products = ref([]);
const activeCategory = ref(0);

onMounted(async () => {
  try {
    const cats = await getCategories();
    categories.value = cats || [];

    // 如果有页面参数，设置分类
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const options = currentPage.$page?.options || {};

    if (options.categoryId) {
      activeCategory.value = parseInt(options.categoryId);
      await loadProducts(activeCategory.value);
    } else {
      // 默认加载全部
      await loadProducts();
    }
  } catch (e) {
    console.error('加载失败:', e);
  }
});

async function loadProducts(categoryId) {
  try {
    const prods = await getProducts(categoryId || undefined);
    products.value = prods || [];
  } catch (e) {
    products.value = [];
  }
}

function switchCategory(cat) {
  activeCategory.value = cat.id;
  loadProducts(cat.id);
}
</script>

<style scoped>
.page { padding-bottom: 40rpx; }

.category-tabs {
  background: #fff;
  white-space: nowrap;
  padding: 16rpx 0;
  margin-bottom: 8rpx;
}

.tabs-inner {
  display: inline-flex;
  padding: 0 20rpx;
  gap: 16rpx;
}

.tab-item {
  display: inline-flex;
  align-items: center;
  padding: 12rpx 24rpx;
  border-radius: 32rpx;
  font-size: 26rpx;
  background: #f5f5f5;
  color: #666;
}

.tab-item.active {
  background: #e3f2fd;
  color: #1a6fb5;
  font-weight: 500;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 200rpx;
}

.empty-icon { font-size: 80rpx; margin-bottom: 20rpx; }

.empty-text { font-size: 28rpx; color: #999; }
</style>
