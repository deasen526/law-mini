<template>
  <view class="page" v-if="product">
    <!-- 产品摘要 -->
    <view class="card product-summary">
      <view class="product-name">{{ product.name }}</view>
      <view class="product-price">
        <text class="symbol">¥</text>
        <text class="value">{{ (product.price / 100).toFixed(0) }}</text>
      </view>
    </view>

    <!-- 联系信息 -->
    <view class="card form-card">
      <view class="form-title">联系信息（选填）</view>
      <view class="form-item">
        <text class="label">姓名</text>
        <input class="input" v-model="contactName" placeholder="如何称呼您" />
      </view>
      <view class="form-item">
        <text class="label">手机号</text>
        <input class="input" v-model="contactPhone" type="number" placeholder="方便顾问联系您" maxlength="11" />
      </view>
      <view class="form-item">
        <text class="label">备注</text>
        <textarea class="textarea" v-model="remark" placeholder="补充说明您的具体情况（选填）" />
      </view>
    </view>

    <!-- 支付信息 -->
    <view class="card pay-summary">
      <view class="pay-row">
        <text class="pay-label">服务费用</text>
        <text class="pay-value">¥{{ (product.price / 100).toFixed(0) }}</text>
      </view>
      <view class="pay-row total">
        <text class="pay-label">合计</text>
        <text class="pay-value total-price">¥{{ (product.price / 100).toFixed(0) }}</text>
      </view>
    </view>

    <!-- 协议 -->
    <view class="agreement">
      <text>下单即表示同意</text>
      <text class="link" @click="showAgreement">《服务协议》</text>
    </view>

    <!-- 底部下单 -->
    <view style="height: 140rpx;"></view>
    <view class="bottom-bar">
      <view class="bottom-total">
        <text>合计：</text>
        <text class="total-num">¥{{ (product.price / 100).toFixed(0) }}</text>
      </view>
      <button class="btn-submit" :disabled="submitting" @click="submitOrder">
        {{ submitting ? '处理中...' : '确认支付' }}
      </button>
    </view>
  </view>

  <view v-else class="loading"><text>加载中...</text></view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getProductDetail, createOrder, payOrder } from '@/api/index.js';
import { useUserStore } from '@/store/index.js';

const product = ref(null);
const contactName = ref('');
const contactPhone = ref('');
const remark = ref('');
const submitting = ref(false);
const userStore = useUserStore();

onMounted(async () => {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const id = currentPage.$page?.options?.id;

  if (!id) {
    uni.showToast({ title: '参数错误', icon: 'none' });
    setTimeout(() => uni.navigateBack(), 1500);
    return;
  }

  try {
    product.value = await getProductDetail(id);
  } catch (e) {
    uni.showToast({ title: '加载失败', icon: 'none' });
  }
});

async function submitOrder() {
  if (submitting.value) return;

  // 确保已登录
  if (!userStore.isLogin) {
    try {
      await userStore.wxLogin();
    } catch (e) {
      return;
    }
  }

  submitting.value = true;

  try {
    // 1. 创建订单
    const order = await createOrder({
      productId: product.value.id,
      quantity: 1,
      contactName: contactName.value || undefined,
      contactPhone: contactPhone.value || undefined,
      remark: remark.value || undefined,
    });

    // 2. 发起微信支付
    const payData = await payOrder(order.id);

    // 3. 调起微信支付
    wx.requestPayment({
      timeStamp: payData.timeStamp,
      nonceStr: payData.nonceStr,
      package: `prepay_id=${payData.prepayId}`,
      signType: payData.signType || 'RSA',
      paySign: payData.paySign,
      success() {
        uni.showToast({ title: '支付成功', icon: 'success' });
        setTimeout(() => {
          uni.redirectTo({ url: `/pages/order-detail/detail?id=${order.id}` });
        }, 1000);
      },
      fail(err) {
        if (err.errMsg.includes('cancel')) {
          uni.showToast({ title: '已取消支付', icon: 'none' });
        } else {
          uni.showToast({ title: '支付失败，请在订单中重试', icon: 'none' });
        }
        uni.redirectTo({ url: '/pages/order-list/list' });
      },
    });
  } catch (err) {
    uni.showToast({ title: err.message || '下单失败', icon: 'none' });
  } finally {
    submitting.value = false;
  }
}

function showAgreement() {
  uni.showModal({
    title: '服务协议',
    content: '1. 本服务为法律信息咨询及维权辅助服务，非律师代理服务。\n2. 付款后如未使用，可在7天内申请退款。\n3. 服务过程中涉及的法律风险由用户自行承担，我们会尽最大努力提供准确建议。',
    showCancel: false,
    confirmText: '我知道了',
  });
}
</script>

<style scoped>
.page { padding-bottom: 0; }

.card {
  background: #fff;
  border-radius: 16rpx;
  margin: 20rpx;
  padding: 28rpx;
}

.product-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-name { font-size: 30rpx; font-weight: 500; color: #333; flex: 1; }

.product-price { display: flex; align-items: baseline; flex-shrink: 0; margin-left: 24rpx; }

.symbol { font-size: 24rpx; color: #f44336; }

.value { font-size: 36rpx; color: #f44336; font-weight: 700; }

.form-title { font-size: 28rpx; font-weight: 600; color: #333; margin-bottom: 20rpx; }

.form-item {
  display: flex;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.form-item:last-child { align-items: flex-start; border-bottom: none; }

.label { width: 120rpx; font-size: 28rpx; color: #666; flex-shrink: 0; }

.input { flex: 1; font-size: 28rpx; color: #333; }

.textarea { flex: 1; font-size: 28rpx; color: #333; height: 120rpx; }

.pay-summary { margin-top: 0; }

.pay-row {
  display: flex;
  justify-content: space-between;
  padding: 12rpx 0;
}

.pay-label { font-size: 28rpx; color: #666; }

.pay-value { font-size: 28rpx; color: #333; }

.pay-row.total {
  border-top: 1rpx solid #f0f0f0;
  padding-top: 20rpx;
  margin-top: 8rpx;
}

.total-price { font-size: 36rpx; font-weight: 700; color: #f44336; }

.agreement {
  text-align: center;
  padding: 20rpx;
  font-size: 24rpx;
  color: #999;
}

.agreement .link { color: #1a6fb5; }

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

.bottom-total { font-size: 28rpx; color: #333; }

.total-num { font-size: 36rpx; color: #f44336; font-weight: 700; }

.btn-submit {
  background: linear-gradient(135deg, #1a6fb5, #2196f3);
  color: #fff;
  font-size: 32rpx;
  font-weight: 500;
  padding: 20rpx 48rpx;
  border-radius: 44rpx;
  border: none;
}

.btn-submit::after { border: none; }

.btn-submit[disabled] { opacity: 0.6; }

.loading { display: flex; justify-content: center; padding-top: 200rpx; color: #999; }
</style>
