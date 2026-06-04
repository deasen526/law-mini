<template>
  <view class="page" v-if="order">
    <!-- 订单状态 -->
    <view class="status-bar" :class="'status-bg-' + order.status">
      <view class="status-icon">{{ statusIcon[order.status] }}</view>
      <view class="status-text">{{ statusMap[order.status] }}</view>
      <view class="status-hint" v-if="order.status === 'pending'">
        请在30分钟内完成支付
      </view>
    </view>

    <!-- 产品信息 -->
    <view class="card">
      <view class="card-title">服务信息</view>
      <view class="info-row">
        <text class="info-label">服务名称</text>
        <text class="info-value">{{ order.productName }}</text>
      </view>
      <view class="info-row">
        <text class="info-label">订单编号</text>
        <text class="info-value mono">{{ order.orderNo }}</text>
      </view>
      <view class="info-row">
        <text class="info-label">支付金额</text>
        <text class="info-value price">¥{{ (order.amount / 100).toFixed(0) }}</text>
      </view>
      <view class="info-row">
        <text class="info-label">创建时间</text>
        <text class="info-value">{{ formatDate(order.createdAt) }}</text>
      </view>
      <view class="info-row" v-if="order.paidAt">
        <text class="info-label">支付时间</text>
        <text class="info-value">{{ formatDate(order.paidAt) }}</text>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="actions">
      <button v-if="order.status === 'pending'" class="btn-pay" @click="retryPay">
        立即支付 ¥{{ (order.amount / 100).toFixed(0) }}
      </button>
      <button v-if="order.status === 'paid' || order.status === 'delivering'" class="btn-contact" open-type="contact">
        联系顾问
      </button>
    </view>

    <!-- 底部导航 -->
    <view class="nav-links">
      <text class="nav-link" @click="goHome">返回首页</text>
      <text class="nav-link" @click="goOrders">查看全部订单</text>
    </view>
  </view>

  <view v-else class="loading"><text>加载中...</text></view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getOrderDetail, payOrder } from '@/api/index.js';

const order = ref(null);

const statusMap = {
  pending: '待支付',
  paid: '已支付',
  delivering: '服务中',
  completed: '已完成',
  cancelled: '已取消',
  refunded: '已退款',
};

const statusIcon = {
  pending: '⏳',
  paid: '✅',
  delivering: '🔄',
  completed: '🎉',
  cancelled: '❌',
  refunded: '↩️',
};

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
    order.value = await getOrderDetail(id);
  } catch (e) {
    uni.showToast({ title: '加载失败', icon: 'none' });
  }
});

async function retryPay() {
  try {
    uni.showLoading({ title: '拉起支付...' });
    const payData = await payOrder(order.value.id);
    uni.hideLoading();

    wx.requestPayment({
      timeStamp: payData.timeStamp,
      nonceStr: payData.nonceStr,
      package: `prepay_id=${payData.prepayId}`,
      signType: payData.signType || 'RSA',
      paySign: payData.paySign,
      success() {
        uni.showToast({ title: '支付成功', icon: 'success' });
        // 重新加载订单
        setTimeout(async () => {
          try {
            order.value = await getOrderDetail(order.value.id);
          } catch (e) {}
        }, 500);
      },
      fail(err) {
        if (!err.errMsg.includes('cancel')) {
          uni.showToast({ title: '支付失败', icon: 'none' });
        }
      },
    });
  } catch (err) {
    uni.hideLoading();
    uni.showToast({ title: err.message || '支付失败', icon: 'none' });
  }
}

function goHome() {
  uni.switchTab({ url: '/pages/index/index' });
}

function goOrders() {
  uni.switchTab({ url: '/pages/order-list/list' });
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hour = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hour}:${min}`;
}
</script>

<style scoped>
.page { padding-bottom: 40rpx; }

.status-bar {
  padding: 48rpx 32rpx;
  text-align: center;
  color: #fff;
}

.status-bg-pending { background: linear-gradient(135deg, #ff9800, #f57c00); }
.status-bg-paid { background: linear-gradient(135deg, #1a6fb5, #2196f3); }
.status-bg-delivering { background: linear-gradient(135deg, #2196f3, #42a5f5); }
.status-bg-completed { background: linear-gradient(135deg, #4caf50, #66bb6a); }
.status-bg-cancelled { background: #ccc; }
.status-bg-refunded { background: #999; }

.status-icon { font-size: 64rpx; margin-bottom: 12rpx; }

.status-text { font-size: 36rpx; font-weight: 600; }

.status-hint { font-size: 24rpx; opacity: 0.9; margin-top: 8rpx; }

.card {
  background: #fff;
  border-radius: 16rpx;
  margin: 20rpx;
  padding: 28rpx;
}

.card-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 20rpx;
  padding-bottom: 16rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 14rpx 0;
}

.info-label { font-size: 28rpx; color: #999; }

.info-value { font-size: 28rpx; color: #333; }

.info-value.mono { font-family: monospace; font-size: 24rpx; }

.info-value.price { color: #f44336; font-weight: 600; font-size: 32rpx; }

.actions { margin: 20rpx; }

.btn-pay {
  background: linear-gradient(135deg, #f44336, #e53935);
  color: #fff;
  font-size: 32rpx;
  padding: 24rpx;
  border-radius: 44rpx;
  border: none;
  width: 100%;
}

.btn-pay::after { border: none; }

.btn-contact {
  background: linear-gradient(135deg, #1a6fb5, #2196f3);
  color: #fff;
  font-size: 32rpx;
  padding: 24rpx;
  border-radius: 44rpx;
  border: none;
  width: 100%;
}

.btn-contact::after { border: none; }

.nav-links {
  display: flex;
  justify-content: center;
  gap: 48rpx;
  padding: 24rpx;
}

.nav-link { font-size: 26rpx; color: #1a6fb5; }

.loading { display: flex; justify-content: center; padding-top: 200rpx; color: #999; }
</style>
