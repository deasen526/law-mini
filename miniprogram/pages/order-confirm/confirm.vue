<template>
  <view>
    <view class="page" v-if="product">
    <!-- 产品摘要 -->
    <view class="card product-summary">
      <view class="product-icon" :style="{ background: catGradient }">
        <text>{{ catSymbol }}</text>
      </view>
      <view class="product-info">
        <view class="product-name">{{ product.name }}</view>
        <view class="product-subtitle" v-if="product.subtitle">{{ product.subtitle }}</view>
      </view>
      <view class="product-price">
        <text class="symbol">¥</text>
        <text class="value">{{ (product.price/100).toFixed(0) }}</text>
      </view>
    </view>

    <!-- 联系信息 -->
    <view class="card form-card">
      <view class="form-title">联系信息（选填）</view>
      <view class="form-item">
        <text class="label">👤 姓名</text>
        <input class="input-field" v-model="contactName" placeholder="如何称呼您" maxlength="20" />
      </view>
      <view class="form-item">
        <text class="label">📞 手机号</text>
        <input class="input-field" v-model="contactPhone" type="number" placeholder="方便顾问联系您" maxlength="11" />
      </view>
    </view>

    <!-- 支付明细 -->
    <view class="card pay-summary">
      <view class="pay-row">
        <text class="pay-label">服务费用</text>
        <text class="pay-value">¥{{ (product.price/100).toFixed(0) }}</text>
      </view>
      <view class="pay-row total">
        <text class="pay-label">合计</text>
        <text class="pay-value total-price">¥{{ (product.price/100).toFixed(0) }}</text>
      </view>
    </view>

    <!-- 协议 -->
    <view class="agreement">
      <text class="agree-check">✓</text>
      <text>下单即表示同意《服务协议》</text>
    </view>

    <!-- 底部栏 -->
    <view style="height: 140rpx;"></view>
    <view class="bottom-bar">
      <view class="bottom-total">
        <text>合计：</text>
        <text class="total-num">¥{{ (product.price/100).toFixed(0) }}</text>
      </view>
      <button class="btn-submit" @click="submitOrder">确认支付</button>
    </view>
  </view>

  <!-- 骨架屏 -->
  <view v-else class="loading-page">
    <view class="skeleton skeleton-card" style="height:100rpx; margin:20rpx;"></view>
    <view class="skeleton skeleton-card" style="height:200rpx; margin:20rpx;"></view>
    <view class="skeleton skeleton-card" style="height:120rpx; margin:20rpx;"></view>
  </view>
  </view>
</template>

<script>
import { getProductDetail } from '@/api/index.js';

var CAT_GRADIENTS = {
  1: { bg: 'linear-gradient(135deg, #1a6fb5, #42a5f5)', sym: '§' },
  2: { bg: 'linear-gradient(135deg, #ff9800, #ffb74d)', sym: '⌂' },
  3: { bg: 'linear-gradient(135deg, #4caf50, #81c784)', sym: '¶' },
  4: { bg: 'linear-gradient(135deg, #7b1fa2, #ba68c8)', sym: '★' },
};

export default {
  data: function () {
    return {
      product: null,
      contactName: '',
      contactPhone: '',
    };
  },
  computed: {
    catGradient: function () {
      var p = this.product;
      if (!p) return 'linear-gradient(135deg, #e3f2fd, #bbdefb)';
      return (CAT_GRADIENTS[p.categoryId] || CAT_GRADIENTS[1]).bg;
    },
    catSymbol: function () {
      var p = this.product;
      if (!p) return '?';
      return (CAT_GRADIENTS[p.categoryId] || CAT_GRADIENTS[1]).sym;
    },
  },
  onLoad: function (options) {
    if (options.id) {
      this.loadProduct(options.id);
    }
  },
  methods: {
    loadProduct: async function (id) {
      try {
        this.product = await getProductDetail(id);
      } catch (e) {
        uni.showToast({ title: '加载失败', icon: 'none' });
      }
    },
    submitOrder: function () {
      uni.showToast({ title: '预览模式，请在微信小程序中支付', icon: 'none' });
    },
  },
};
</script>

<style scoped>
.page { padding-bottom: 0; }

/* ---- 产品摘要 ---- */
.card { background: #fff; border-radius: 20rpx; margin: 20rpx; padding: 28rpx; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.03); }
.product-summary { display: flex; align-items: center; }
.product-icon {
  width: 72rpx; height: 72rpx; border-radius: 18rpx; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 32rpx; color: rgba(255,255,255,0.85);
  font-family: Georgia, 'Times New Roman', serif;
}
.product-info { flex: 1; margin-left: 20rpx; min-width: 0; }
.product-name { font-size: 30rpx; font-weight: 500; color: #333; }
.product-subtitle { font-size: 24rpx; color: #999; margin-top: 4rpx; }
.product-price { display: flex; align-items: baseline; flex-shrink: 0; margin-left: 16rpx; }
.symbol { font-size: 24rpx; color: #f44336; }
.value { font-size: 36rpx; color: #f44336; font-weight: 700; }

/* ---- 表单 ---- */
.form-title { font-size: 28rpx; font-weight: 600; color: #333; margin-bottom: 20rpx; padding-left: 20rpx; border-left: 6rpx solid #1a6fb5; }
.form-item { margin-bottom: 16rpx; }
.form-item:last-child { margin-bottom: 0; }
.label { font-size: 26rpx; color: #666; display: block; margin-bottom: 10rpx; }
.input-field {
  width: 100%; height: 88rpx; background: #f7f8fa; border-radius: 12rpx;
  padding: 0 24rpx; font-size: 28rpx; color: #333; border: 2rpx solid transparent;
  transition: border-color 0.2s, background 0.2s; box-sizing: border-box;
}
.input-field:focus { border-color: #1a6fb5; background: #fff; }

/* ---- 支付明细 ---- */
.pay-summary { margin-top: 0; }
.pay-row { display: flex; justify-content: space-between; padding: 12rpx 0; }
.pay-label { font-size: 28rpx; color: #666; }
.pay-value { font-size: 28rpx; color: #333; }
.pay-row.total { border-top: 1rpx solid #f0f0f0; padding-top: 20rpx; margin-top: 8rpx; }
.total-price { font-size: 36rpx; font-weight: 700; color: #f44336; }

/* ---- 协议 ---- */
.agreement { text-align: center; padding: 20rpx; font-size: 24rpx; color: #999; display: flex; align-items: center; justify-content: center; }
.agree-check { color: #4caf50; font-weight: 700; margin-right: 6rpx; }

/* ---- 底部栏 ---- */
.bottom-bar { position: fixed; bottom: 0; left: 0; right: 0; background: #fff; padding: 16rpx 24rpx; padding-bottom: calc(16rpx + env(safe-area-inset-bottom)); display: flex; align-items: center; justify-content: space-between; box-shadow: 0 -2rpx 16rpx rgba(0,0,0,0.06); z-index: 100; }
.bottom-total { font-size: 28rpx; color: #333; }
.total-num { font-size: 36rpx; color: #f44336; font-weight: 700; }
.btn-submit { background: linear-gradient(135deg, #1a6fb5, #2196f3); color: #fff; font-size: 32rpx; font-weight: 500; padding: 20rpx 52rpx; border-radius: 44rpx; border: none; }
.btn-submit::after { border: none; }
.btn-submit:active { opacity: 0.85; transform: scale(0.97); }

/* ---- 骨架屏 ---- */
.loading-page { padding-bottom: 40rpx; }
.skeleton-card { border-radius: 20rpx; }
</style>
