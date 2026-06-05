<template>
  <view class="product-card" @click="goDetail">
    <image v-if="product.coverImage" :src="product.coverImage" mode="aspectFill" class="cover" />
    <view v-else class="cover-placeholder" :style="{ background: categoryGradient }">
      <text class="placeholder-icon">{{ categorySymbol }}</text>
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

<script>
// 分类渐变及符号映射
var CATEGORY_STYLES = {
  1: { gradient: 'linear-gradient(135deg, #1a6fb5, #42a5f5)', symbol: '§' },   // 劳动维权 - 蓝色
  2: { gradient: 'linear-gradient(135deg, #ff9800, #ffb74d)', symbol: '⌂' },   // 租房纠纷 - 橙色
  3: { gradient: 'linear-gradient(135deg, #4caf50, #81c784)', symbol: '¶' },   // 法律文书 - 绿色
  4: { gradient: 'linear-gradient(135deg, #7b1fa2, #ba68c8)', symbol: '★' },   // 年度服务 - 紫色
};

export default {
  props: {
    product: { type: Object, required: true },
  },
  computed: {
    categoryGradient: function () {
      var catId = this.product.categoryId;
      return (CATEGORY_STYLES[catId] || CATEGORY_STYLES[1]).gradient;
    },
    categorySymbol: function () {
      var catId = this.product.categoryId;
      return (CATEGORY_STYLES[catId] || CATEGORY_STYLES[1]).symbol;
    },
  },
  methods: {
    goDetail: function () {
      uni.navigateTo({ url: '/pages/product-detail/detail?id=' + this.product.id });
    },
  },
};
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
  transition: transform 0.15s, opacity 0.15s;
}

.product-card:active {
  transform: scale(0.98);
  opacity: 0.9;
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
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-icon {
  font-size: 72rpx;
  color: rgba(255, 255, 255, 0.85);
  font-family: Georgia, 'Times New Roman', serif;
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
