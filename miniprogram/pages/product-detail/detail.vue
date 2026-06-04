<template>
  <view class="page" v-if="product">
    <!-- 产品头图 -->
    <view class="header">
      <image v-if="product.coverImage" :src="product.coverImage" mode="aspectFill" class="cover" />
      <view v-else class="cover-placeholder">⚖️</view>

      <view class="header-info">
        <view class="name">{{ product.name }}</view>
        <view class="subtitle" v-if="product.subtitle">{{ product.subtitle }}</view>
        <view class="price-row">
          <text class="price-symbol">¥</text>
          <text class="price-value">{{ (product.price / 100).toFixed(0) }}</text>
          <text v-if="product.originalPrice && product.originalPrice > product.price" class="original-price">
            ¥{{ (product.originalPrice / 100).toFixed(0) }}
          </text>
        </view>
      </view>
    </view>

    <!-- 场景唤醒 -->
    <view class="card scenario-card" v-if="product.scenario">
      <view class="card-title">💡 你是不是遇到了这种情况？</view>
      <view class="scenario-text">{{ product.scenario }}</view>
    </view>

    <!-- ROI算账 -->
    <view class="card roi-card" v-if="product.roiHint">
      <view class="roi-hint">{{ product.roiHint }}</view>
    </view>

    <!-- 服务内容 -->
    <view class="card" v-if="product.features && product.features.length">
      <view class="card-title">📋 服务内容</view>
      <view class="feature-item" v-for="(item, idx) in product.features" :key="idx">
        <text>{{ item }}</text>
      </view>
    </view>

    <!-- 服务流程 -->
    <view class="card" v-if="product.process && product.process.length">
      <view class="card-title">🔄 服务流程</view>
      <view class="process-item" v-for="(step, idx) in product.process" :key="idx">
        <view class="step-num">{{ step.step || idx + 1 }}</view>
        <view class="step-content">
          <view class="step-title">{{ step.title }}</view>
          <view class="step-desc" v-if="step.desc">{{ step.desc }}</view>
        </view>
      </view>
    </view>

    <!-- 真实案例 -->
    <view class="card" v-if="product.cases && product.cases.length">
      <view class="card-title">🏆 真实案例</view>
      <view class="case-item" v-for="(item, idx) in product.cases" :key="idx">
        <view class="case-title">{{ item.title }}</view>
        <view class="case-desc">{{ item.desc }}</view>
        <view class="case-result" v-if="item.result">
          <text class="result-label">结果：</text>
          <text class="result-value">{{ item.result }}</text>
        </view>
      </view>
    </view>

    <!-- 保障 -->
    <view class="card guarantee-card" v-if="product.guarantee">
      <view class="guarantee-text">
        🛡️ {{ product.guarantee }}
      </view>
    </view>

    <!-- 底部占位 -->
    <view style="height: 140rpx;"></view>

    <!-- 底部下单栏 -->
    <view class="bottom-bar">
      <view class="bottom-price">
        <text class="bp-symbol">¥</text>
        <text class="bp-value">{{ (product.price / 100).toFixed(0) }}</text>
      </view>
      <button class="btn-buy" @click="buyNow">
        立即获取
      </button>
    </view>
  </view>

  <view v-else class="loading">
    <text>加载中...</text>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getProductDetail } from '@/api/index.js';
import { useCartStore } from '@/store/index.js';

const product = ref(null);
const cartStore = useCartStore();

onMounted(async () => {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const id = currentPage.$page?.options?.id;

  if (!id) {
    uni.showToast({ title: '产品不存在', icon: 'none' });
    setTimeout(() => uni.navigateBack(), 1500);
    return;
  }

  try {
    product.value = await getProductDetail(id);
  } catch (e) {
    uni.showToast({ title: '加载失败', icon: 'none' });
  }
});

function buyNow() {
  if (!product.value) return;
  cartStore.setCurrentProduct(product.value);
  uni.navigateTo({ url: `/pages/order-confirm/confirm?id=${product.value.id}` });
}
</script>

<style scoped>
.page { padding-bottom: 0; }

.header {
  background: #fff;
  display: flex;
  padding: 32rpx 24rpx;
}

.cover {
  width: 200rpx;
  height: 200rpx;
  border-radius: 12rpx;
  flex-shrink: 0;
}

.cover-placeholder {
  width: 200rpx;
  height: 200rpx;
  border-radius: 12rpx;
  flex-shrink: 0;
  background: linear-gradient(135deg, #e3f2fd, #bbdefb);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 80rpx;
}

.header-info {
  flex: 1;
  margin-left: 24rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.name {
  font-size: 34rpx;
  font-weight: 700;
  color: #333;
  line-height: 1.3;
}

.subtitle {
  font-size: 26rpx;
  color: #999;
  margin-top: 8rpx;
}

.price-row {
  margin-top: 16rpx;
  display: flex;
  align-items: baseline;
}

.price-symbol { font-size: 28rpx; color: #f44336; font-weight: 600; }

.price-value {
  font-size: 48rpx;
  color: #f44336;
  font-weight: 700;
  line-height: 1;
}

.original-price {
  font-size: 26rpx;
  color: #ccc;
  text-decoration: line-through;
  margin-left: 12rpx;
}

.card {
  background: #fff;
  border-radius: 16rpx;
  margin: 20rpx;
  padding: 28rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.03);
}

.card-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 18rpx;
}

.scenario-text {
  font-size: 28rpx;
  color: #555;
  line-height: 1.7;
}

.roi-card {
  background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
}

.roi-hint {
  font-size: 28rpx;
  color: #2e7d32;
  line-height: 1.7;
}

.feature-item {
  font-size: 28rpx;
  color: #555;
  padding: 10rpx 0;
  line-height: 1.6;
  border-bottom: 1rpx solid #f5f5f5;
}

.feature-item:last-child { border-bottom: none; }

.process-item {
  display: flex;
  margin-bottom: 24rpx;
}

.process-item:last-child { margin-bottom: 0; }

.step-num {
  width: 48rpx;
  height: 48rpx;
  background: #1a6fb5;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: 600;
  flex-shrink: 0;
  margin-right: 20rpx;
}

.step-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
}

.step-desc {
  font-size: 24rpx;
  color: #999;
  margin-top: 4rpx;
}

.case-item {
  padding: 18rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}

.case-item:last-child { border-bottom: none; }

.case-title { font-size: 28rpx; font-weight: 500; color: #333; }

.case-desc { font-size: 26rpx; color: #666; margin-top: 8rpx; line-height: 1.5; }

.case-result { margin-top: 10rpx; }

.result-label { font-size: 26rpx; color: #999; }

.result-value { font-size: 28rpx; color: #4caf50; font-weight: 600; }

.guarantee-text {
  font-size: 28rpx;
  color: #ff9800;
  text-align: center;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 16rpx 24rpx;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 -2rpx 12rpx rgba(0,0,0,0.06);
  z-index: 100;
}

.bottom-price {
  display: flex;
  align-items: baseline;
}

.bp-symbol { font-size: 24rpx; color: #f44336; font-weight: 600; }

.bp-value {
  font-size: 44rpx;
  color: #f44336;
  font-weight: 700;
  line-height: 1;
}

.btn-buy {
  background: linear-gradient(135deg, #f44336, #e53935);
  color: #fff;
  font-size: 32rpx;
  font-weight: 500;
  padding: 20rpx 64rpx;
  border-radius: 44rpx;
  border: none;
}

.btn-buy::after { border: none; }

.loading { display: flex; justify-content: center; padding-top: 200rpx; color: #999; }
</style>
