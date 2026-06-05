<template>
  <view class="page" v-if="product">
    <view class="card product-summary">
      <view class="product-name">{{ product.name }}</view>
      <view class="product-price">
        <text class="symbol">¥</text>
        <text class="value">{{ (product.price/100).toFixed(0) }}</text>
      </view>
    </view>

    <view class="card form-card">
      <view class="form-title">联系信息（选填）</view>
      <view class="form-item">
        <text class="label">姓名</text>
        <input class="input" v-model="contactName" placeholder="如何称呼您" />
      </view>
      <view class="form-item">
        <text class="label">手机号</text>
        <input class="input" v-model="contactPhone" type="number" placeholder="方便顾问联系您" />
      </view>
    </view>

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

    <view class="agreement"><text>下单即表示同意《服务协议》</text></view>

    <view style="height: 140rpx;"></view>
    <view class="bottom-bar">
      <view class="bottom-total">
        <text>合计：</text>
        <text class="total-num">¥{{ (product.price/100).toFixed(0) }}</text>
      </view>
      <button class="btn-submit" @click="submitOrder">确认支付</button>
    </view>
  </view>
  <view v-else class="loading"><text>加载中...</text></view>
</template>

<script>
import { getProductDetail } from '@/api/index.js';

export default {
  data() {
    return {
      product: null,
      contactName: '',
      contactPhone: '',
    };
  },
  onLoad(options) {
    if (options.id) {
      this.loadProduct(options.id);
    }
  },
  methods: {
    async loadProduct(id) {
      try {
        this.product = await getProductDetail(id);
      } catch (e) {
        uni.showToast({ title: '加载失败', icon: 'none' });
      }
    },
    submitOrder() {
      uni.showToast({ title: '预览模式，请在微信小程序中支付', icon: 'none' });
    },
  },
};
</script>

<style scoped>
.page { padding-bottom: 0; }
.card { background: #fff; border-radius: 16rpx; margin: 20rpx; padding: 28rpx; }
.product-summary { display: flex; justify-content: space-between; align-items: center; }
.product-name { font-size: 30rpx; font-weight: 500; color: #333; flex: 1; }
.product-price { display: flex; align-items: baseline; flex-shrink: 0; margin-left: 24rpx; }
.symbol { font-size: 24rpx; color: #f44336; }
.value { font-size: 36rpx; color: #f44336; font-weight: 700; }
.form-title { font-size: 28rpx; font-weight: 600; color: #333; margin-bottom: 20rpx; }
.form-item { display: flex; align-items: center; padding: 16rpx 0; border-bottom: 1rpx solid #f0f0f0; }
.form-item:last-child { border-bottom: none; }
.label { width: 120rpx; font-size: 28rpx; color: #666; flex-shrink: 0; }
.input { flex: 1; font-size: 28rpx; color: #333; }
.pay-summary { margin-top: 0; }
.pay-row { display: flex; justify-content: space-between; padding: 12rpx 0; }
.pay-label { font-size: 28rpx; color: #666; }
.pay-value { font-size: 28rpx; color: #333; }
.pay-row.total { border-top: 1rpx solid #f0f0f0; padding-top: 20rpx; margin-top: 8rpx; }
.total-price { font-size: 36rpx; font-weight: 700; color: #f44336; }
.agreement { text-align: center; padding: 20rpx; font-size: 24rpx; color: #999; }
.bottom-bar { position: fixed; bottom: 0; left: 0; right: 0; background: #fff; padding: 16rpx 24rpx; padding-bottom: calc(16rpx + env(safe-area-inset-bottom)); display: flex; align-items: center; justify-content: space-between; box-shadow: 0 -2rpx 12rpx rgba(0,0,0,0.06); z-index: 100; }
.bottom-total { font-size: 28rpx; color: #333; }
.total-num { font-size: 36rpx; color: #f44336; font-weight: 700; }
.btn-submit { background: linear-gradient(135deg, #1a6fb5, #2196f3); color: #fff; font-size: 32rpx; font-weight: 500; padding: 20rpx 48rpx; border-radius: 44rpx; border: none; }
.btn-submit::after { border: none; }
.loading { display: flex; justify-content: center; padding-top: 200rpx; color: #999; }
</style>
