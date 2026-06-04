<template>
  <view class="product-card" @click="goDetail">
    <image v-if="product.coverImage" :src="imageBase + product.coverImage" mode="aspectFill" class="cover" />
    <view v-else class="cover-placeholder">
      <text class="placeholder-icon">⚖️</text>
    </view>

    <view class="info">
      <view class="name">{{ product.name }}</view>
      <view class="subtitle" v-if="product.subtitle">{{ product.subtitle }}</view>

      <view class="price-row">
        <text class="price-symbol">¥</text>
        <text class="price-value">{{ (product.price / 100).toFixed(0) }}</text>
        <text v-if="product.originalPrice && product.originalPrice > product.price" class="original-price">
          ¥{{ (product.originalPrice / 100).toFixed(0) }}
        </text>
      </view>

      <view class="tag-row" v-if="product.scenario">
        <text class="tag">{{ product.scenario.slice(0, 28) }}...</text>
      </view>
    </view>
  </view>
</template>

<script setup>
const props = defineProps({
  product: { type: Object, required: true },
  imageBase: { type: String, default: '' },
});

function goDetail() {
  uni.navigateTo({ url: `/pages/product-detail/detail?id=${props.product.id}` });
}
</script>

<style scoped>
.product-card {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  margin: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: row;
}

.cover {
  width: 200rpx;
  height: 200rpx;
  flex-shrink: 0;
  object-fit: cover;
}

.cover-placeholder {
  width: 200rpx;
  height: 200rpx;
  flex-shrink: 0;
  background: linear-gradient(135deg, #e3f2fd, #bbdefb);
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-icon {
  font-size: 64rpx;
}

.info {
  flex: 1;
  padding: 20rpx 24rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
}

.name {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.subtitle {
  font-size: 24rpx;
  color: #999;
  margin-top: 6rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.price-row {
  margin-top: 12rpx;
  display: flex;
  align-items: baseline;
}

.price-symbol {
  font-size: 24rpx;
  color: #f44336;
  font-weight: 600;
}

.price-value {
  font-size: 40rpx;
  color: #f44336;
  font-weight: 700;
  line-height: 1;
}

.original-price {
  font-size: 24rpx;
  color: #ccc;
  text-decoration: line-through;
  margin-left: 12rpx;
}

.tag-row {
  margin-top: 10rpx;
}

.tag {
  font-size: 22rpx;
  color: #1a6fb5;
  background: #e3f2fd;
  padding: 4rpx 12rpx;
  border-radius: 6rpx;
}
</style>
