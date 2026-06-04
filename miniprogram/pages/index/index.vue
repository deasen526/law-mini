<template>
  <view class="page">
    <!-- 顶部横幅 -->
    <view class="hero">
      <view class="hero-title">遇到法律问题？</view>
      <view class="hero-sub">专业法律顾问，帮你理清每一步</view>
      <view class="hero-stats">
        <view class="stat-item">
          <view class="stat-num">{{ stats.serviceCount }}</view>
          <view class="stat-label">已服务人数</view>
        </view>
        <view class="stat-item">
          <view class="stat-num">{{ stats.caseCount }}</view>
          <view class="stat-label">累计案例</view>
        </view>
        <view class="stat-item">
          <view class="stat-num">{{ stats.satisfaction }}%</view>
          <view class="stat-label">用户好评</view>
        </view>
      </view>
    </view>

    <!-- 场景入口 -->
    <view class="section">
      <view class="section-title">选择你的问题</view>
      <view class="scenario-grid">
        <view
          v-for="cat in categories"
          :key="cat.id"
          class="scenario-card"
          @click="goToCategory(cat)"
        >
          <text class="scenario-icon">{{ cat.icon }}</text>
          <text class="scenario-name">{{ cat.name }}</text>
          <text class="scenario-count" v-if="cat.products">
            {{ cat.products.length }}个服务
          </text>
        </view>
      </view>
    </view>

    <!-- 热门产品 -->
    <view class="section">
      <view class="section-title">热门服务</view>
      <ProductCard
        v-for="product in hotProducts"
        :key="product.id"
        :product="product"
      />
      <view class="view-more" @click="goToAllProducts">
        查看全部服务 →
      </view>
    </view>

    <!-- 底部信任栏 -->
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

<script setup>
import { ref, onMounted } from 'vue';
import { getCategories, getProducts } from '@/api/index.js';
import ProductCard from '@/components/ProductCard.vue';

const categories = ref([]);
const hotProducts = ref([]);
const stats = ref({ serviceCount: '12,000+', caseCount: '8,500+', satisfaction: '96' });

onMounted(async () => {
  try {
    const cats = await getCategories();
    categories.value = cats || [];
  } catch (e) {
    // 使用默认数据
    categories.value = [
      { id: 1, name: '劳动维权', icon: '⚖️' },
      { id: 2, name: '租房纠纷', icon: '🏠' },
      { id: 3, name: '法律文书', icon: '📄' },
      { id: 4, name: '年度服务', icon: '⭐' },
    ];
  }

  try {
    const prods = await getProducts();
    hotProducts.value = (prods || []).slice(0, 3);
  } catch (e) {
    hotProducts.value = [];
  }
});

function goToCategory(cat) {
  uni.navigateTo({ url: `/pages/product/list?categoryId=${cat.id}&categoryName=${cat.name}` });
}

function goToAllProducts() {
  uni.switchTab({ url: '/pages/product/list' });
}
</script>

<style scoped>
.page { padding-bottom: 40rpx; }

.hero {
  background: linear-gradient(160deg, #1a6fb5, #1565c0, #0d47a1);
  padding: 48rpx 32rpx 40rpx;
  color: #fff;
}

.hero-title {
  font-size: 44rpx;
  font-weight: 700;
  margin-bottom: 8rpx;
}

.hero-sub {
  font-size: 28rpx;
  opacity: 0.9;
  margin-bottom: 24rpx;
}

.hero-stats {
  display: flex;
  justify-content: space-around;
  padding-top: 24rpx;
  border-top: 1rpx solid rgba(255, 255, 255, 0.2);
}

.stat-item { text-align: center; }

.stat-num {
  font-size: 36rpx;
  font-weight: 700;
}

.stat-label {
  font-size: 22rpx;
  opacity: 0.8;
  margin-top: 4rpx;
}

.section {
  margin-top: 24rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  padding: 24rpx 20rpx 16rpx;
}

.scenario-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;
  padding: 0 20rpx;
}

.scenario-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 28rpx 24rpx;
  text-align: center;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.scenario-card:active { background: #f0f7ff; }

.scenario-icon { font-size: 48rpx; margin-bottom: 12rpx; }

.scenario-name {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
}

.scenario-count {
  font-size: 22rpx;
  color: #999;
  margin-top: 6rpx;
}

.view-more {
  text-align: center;
  padding: 24rpx;
  font-size: 28rpx;
  color: #1a6fb5;
}

.trust-bar {
  display: flex;
  justify-content: space-around;
  padding: 24rpx 20rpx;
  margin: 24rpx 20rpx 0;
  background: #fff;
  border-radius: 16rpx;
}

.trust-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.trust-icon { font-size: 32rpx; margin-bottom: 6rpx; }

.trust-text { font-size: 22rpx; color: #666; }
</style>
