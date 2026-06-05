<template>
  <view class="page" v-if="product">
    <!-- 头部 -->
    <view class="header">
      <view class="cover-placeholder" :style="{ background: categoryGradient }">
        <text class="cover-symbol">{{ categorySymbol }}</text>
      </view>
      <view class="header-info">
        <view class="name">{{ product.name }}</view>
        <view class="subtitle" v-if="product.subtitle">{{ product.subtitle }}</view>
        <view class="price-row">
          <text class="price-symbol">¥</text>
          <text class="price-value">{{ (product.price/100).toFixed(0) }}</text>
          <text v-if="product.originalPrice && product.originalPrice > product.price" class="original-price">
            ¥{{ (product.originalPrice/100).toFixed(0) }}
          </text>
        </view>
        <!-- 客服入口 -->
        <button class="btn-service" open-type="contact" session-from="product_detail">✉ 联系客服</button>
      </view>
    </view>

    <!-- 场景唤醒 -->
    <view class="card" v-if="product.scenario">
      <view class="card-title accent-orange">{{ product.scenario }}</view>
    </view>

    <!-- ROI 算账 -->
    <view class="card roi-card" v-if="product.roiHint">
      <view class="roi-hint">{{ product.roiHint }}</view>
    </view>

    <!-- 服务内容 -->
    <view class="card" v-if="product.features && product.features.length">
      <view class="card-title accent-blue">服务内容</view>
      <view class="feature-item" v-for="(item, idx) in product.features" :key="idx">
        <text class="feature-check">✓</text>
        <text>{{ item }}</text>
      </view>
    </view>

    <!-- 服务流程 -->
    <view class="card" v-if="product.process && product.process.length">
      <view class="card-title accent-blue">服务流程</view>
      <view class="process-list">
        <view class="process-item" v-for="(step, idx) in product.process" :key="idx">
          <view class="step-num">{{ step.step || idx + 1 }}</view>
          <view class="step-content">
            <view class="step-title">{{ step.title }}</view>
            <view class="step-desc" v-if="step.desc">{{ step.desc }}</view>
          </view>
        </view>
      </view>
    </view>

    <!-- 真实案例 -->
    <view class="card" v-if="product.cases && product.cases.length">
      <view class="card-title accent-purple">真实案例</view>
      <view class="case-item" v-for="(item, idx) in product.cases" :key="idx">
        <view class="case-title">{{ item.title }}</view>
        <view class="case-desc">{{ item.desc }}</view>
        <view class="case-result" v-if="item.result">
          <text class="result-badge">{{ item.result }}</text>
        </view>
      </view>
    </view>

    <!-- 保障承诺 -->
    <view class="card guarantee-card" v-if="product.guarantee">
      <view class="card-title accent-gold">保障承诺</view>
      <view class="guarantee-text">{{ product.guarantee }}</view>
    </view>

    <!-- 底部按钮 -->
    <view style="height: 160rpx;"></view>
    <view class="bottom-bar">
      <view class="bottom-price">
        <text class="bp-symbol">¥</text>
        <text class="bp-value">{{ (product.price/100).toFixed(0) }}</text>
      </view>
      <view class="bottom-actions">
        <button class="btn-share" open-type="share">⇕ 分享</button>
        <button class="btn-buy" @click="buyNow">立即获取</button>
      </view>
    </view>
  </view>

  <!-- 骨架屏 -->
  <view v-else class="loading-page">
    <view class="skeleton-header">
      <view class="skeleton skeleton-cover"></view>
      <view class="skeleton-info">
        <view class="skeleton skeleton-line" style="width:80%"></view>
        <view class="skeleton skeleton-line" style="width:50%"></view>
        <view class="skeleton skeleton-line" style="width:35%"></view>
      </view>
    </view>
    <view class="skeleton skeleton-card"></view>
    <view class="skeleton skeleton-card"></view>
    <view class="skeleton skeleton-card"></view>
  </view>
</template>

<script>
import { getProductDetail } from '@/api/index.js';

var CATEGORY_STYLES = {
  1: { gradient: 'linear-gradient(135deg, #1a6fb5, #42a5f5)', symbol: '§' },
  2: { gradient: 'linear-gradient(135deg, #ff9800, #ffb74d)', symbol: '⌂' },
  3: { gradient: 'linear-gradient(135deg, #4caf50, #81c784)', symbol: '¶' },
  4: { gradient: 'linear-gradient(135deg, #7b1fa2, #ba68c8)', symbol: '★' },
};

export default {
  data: function () {
    return { product: null };
  },
  computed: {
    categoryGradient: function () {
      var p = this.product;
      if (!p) return 'linear-gradient(135deg, #e3f2fd, #bbdefb)';
      return (CATEGORY_STYLES[p.categoryId] || CATEGORY_STYLES[1]).gradient;
    },
    categorySymbol: function () {
      var p = this.product;
      if (!p) return '?';
      return (CATEGORY_STYLES[p.categoryId] || CATEGORY_STYLES[1]).symbol;
    },
  },
  onLoad: function (options) {
    if (options.id) {
      this.loadProduct(options.id);
    }
    // 启用分享
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline'],
    });
  },
  onShareAppMessage: function () {
    return {
      title: this.product ? this.product.name : '法律助手',
      path: '/pages/product-detail/detail?id=' + (this.product ? this.product.id : ''),
    };
  },
  methods: {
    loadProduct: async function (id) {
      try {
        this.product = await getProductDetail(id);
      } catch (e) {
        uni.showToast({ title: '加载失败', icon: 'none' });
      }
    },
    buyNow: function () {
      if (!this.product) return;
      uni.navigateTo({ url: '/pages/order-confirm/confirm?id=' + this.product.id });
    },
  },
};
</script>

<style scoped>
/* ---- 头部 ---- */
.header { background: #fff; display: flex; padding: 32rpx 24rpx; }
.cover-placeholder {
  width: 200rpx; height: 200rpx; border-radius: 16rpx; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.cover-symbol { font-size: 88rpx; color: rgba(255,255,255,0.85); font-family: Georgia, 'Times New Roman', serif; }
.header-info { flex: 1; margin-left: 24rpx; display: flex; flex-direction: column; justify-content: center; }
.name { font-size: 34rpx; font-weight: 700; color: #333; line-height: 1.3; }
.subtitle { font-size: 26rpx; color: #999; margin-top: 8rpx; }
.price-row { margin-top: 16rpx; display: flex; align-items: baseline; }
.price-symbol { font-size: 28rpx; color: #f44336; font-weight: 600; }
.price-value { font-size: 48rpx; color: #f44336; font-weight: 700; line-height: 1; }
.original-price { font-size: 26rpx; color: #ccc; text-decoration: line-through; margin-left: 12rpx; }

/* 客服按钮 */
.btn-service {
  margin-top: 16rpx; padding: 10rpx 20rpx; font-size: 24rpx;
  color: #1a6fb5; background: none; border: 2rpx solid #1a6fb5;
  border-radius: 32rpx; display: inline-block; width: auto; line-height: 1.4;
}
.btn-service::after { border: none; }

/* ---- 卡片通用 ---- */
.card { background: #fff; border-radius: 20rpx; margin: 20rpx; padding: 32rpx 28rpx; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.03); }

/* ---- 标题（左侧色条替代 emoji）---- */
.card-title {
  font-size: 30rpx; font-weight: 600; color: #333;
  padding-left: 20rpx; border-left: 6rpx solid #1a6fb5; margin-bottom: 20rpx;
  line-height: 1.4;
}
.card-title.accent-blue { border-left-color: #1a6fb5; }
.card-title.accent-orange { border-left-color: #ff9800; }
.card-title.accent-purple { border-left-color: #7b1fa2; }
.card-title.accent-gold { border-left-color: #ff9800; }

/* ---- 场景 ---- */
.accent-orange { border-left-color: #ff9800 !important; color: #555; font-weight: 400; }

/* ---- ROI ---- */
.roi-card { background: linear-gradient(135deg, #e8f5e9, #c8e6c9); }
.roi-hint { font-size: 28rpx; color: #2e7d32; line-height: 1.7; }

/* ---- 服务内容 ---- */
.feature-item {
  font-size: 28rpx; color: #555; padding: 12rpx 0; line-height: 1.6;
  border-bottom: 1rpx solid #f5f5f5; display: flex; align-items: baseline;
}
.feature-item:last-child { border-bottom: none; }
.feature-check { color: #4caf50; font-weight: 700; margin-right: 12rpx; flex-shrink: 0; }

/* ---- 服务流程（时间线）---- */
.process-list { border-left: 2rpx dashed #e0e0e0; padding-left: 16rpx; margin-left: 20rpx; }
.process-item { display: flex; margin-bottom: 28rpx; position: relative; }
.process-item:last-child { margin-bottom: 0; }
.step-num {
  width: 48rpx; height: 48rpx; background: #1a6fb5; color: #fff;
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-size: 24rpx; font-weight: 600; flex-shrink: 0;
  margin-right: 20rpx; margin-left: -24rpx;
  box-shadow: 0 0 0 6rpx rgba(26,111,181,0.12);
}
.step-content { flex: 1; padding-top: 4rpx; }
.step-title { font-size: 28rpx; font-weight: 500; color: #333; }
.step-desc { font-size: 24rpx; color: #999; margin-top: 6rpx; line-height: 1.5; }

/* ---- 案例 ---- */
.case-item { padding: 20rpx 0; border-bottom: 1rpx solid #f5f5f5; }
.case-item:last-child { border-bottom: none; }
.case-title { font-size: 28rpx; font-weight: 500; color: #333; }
.case-desc { font-size: 26rpx; color: #666; margin-top: 8rpx; line-height: 1.5; }
.case-result { margin-top: 12rpx; }
.result-badge {
  display: inline-block; padding: 4rpx 16rpx; border-radius: 20rpx;
  font-size: 24rpx; font-weight: 500; background: #e8f5e9; color: #2e7d32;
}

/* ---- 保障 ---- */
.guarantee-card { text-align: center; }
.guarantee-text { font-size: 28rpx; color: #ff9800; }

/* ---- 底部栏 ---- */
.bottom-bar {
  position: fixed; bottom: 0; left: 0; right: 0; background: #fff;
  padding: 16rpx 24rpx; padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  display: flex; align-items: center; justify-content: space-between;
  box-shadow: 0 -2rpx 16rpx rgba(0,0,0,0.06); z-index: 100;
}
.bottom-price { display: flex; align-items: baseline; }
.bp-symbol { font-size: 24rpx; color: #f44336; font-weight: 600; }
.bp-value { font-size: 44rpx; color: #f44336; font-weight: 700; line-height: 1; }
.bottom-actions { display: flex; gap: 16rpx; align-items: center; }
.btn-share {
  font-size: 26rpx; color: #666; padding: 16rpx 24rpx;
  border-radius: 44rpx; border: 2rpx solid #e0e0e0; background: none; line-height: 1;
}
.btn-share::after { border: none; }
.btn-buy {
  background: linear-gradient(135deg, #f44336, #e53935); color: #fff;
  font-size: 30rpx; font-weight: 500; padding: 18rpx 52rpx;
  border-radius: 44rpx; border: none; line-height: 1;
}
.btn-buy::after { border: none; }
.btn-buy:active { opacity: 0.85; transform: scale(0.97); }

/* ---- 骨架屏 ---- */
.loading-page { padding: 0 20rpx; }
.skeleton-header { display: flex; margin: 32rpx 0 20rpx; background: #fff; border-radius: 16rpx; padding: 32rpx 24rpx; }
.skeleton-cover { width: 200rpx; height: 200rpx; flex-shrink: 0; border-radius: 16rpx; }
.skeleton-info { flex: 1; margin-left: 24rpx; display: flex; flex-direction: column; gap: 14rpx; padding-top: 24rpx; }
.skeleton-line { height: 28rpx; }
.skeleton-card { height: 160rpx; margin-bottom: 20rpx; border-radius: 16rpx; }
</style>
