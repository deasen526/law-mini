<template>
  <view class="page">
    <!-- Hero -->
    <view class="hero">
      <view class="hero-title">遇到法律问题？</view>
      <view class="hero-sub">专业法律顾问，帮你理清每一步</view>
      <view class="hero-stats">
        <view class="stat-item">
          <view class="stat-dot stat-dot-1">&#9679;</view>
          <view class="stat-num">12,000+</view>
          <view class="stat-label">已服务人数</view>
        </view>
        <view class="stat-item">
          <view class="stat-dot stat-dot-2">&#9670;</view>
          <view class="stat-num">8,500+</view>
          <view class="stat-label">累计案例</view>
        </view>
        <view class="stat-item">
          <view class="stat-dot stat-dot-3">&#9733;</view>
          <view class="stat-num">96%</view>
          <view class="stat-label">用户好评</view>
        </view>
      </view>
    </view>

    <!-- Banner Swiper -->
    <view class="banner-section">
      <swiper class="banner-swiper" autoplay circular interval="3000" indicator-dots indicator-color="rgba(26,111,181,0.3)" indicator-active-color="#1a6fb5">
        <swiper-item v-for="(banner, idx) in banners" :key="idx">
          <view class="banner-slide" :style="{ background: banner.bg }">
            <view class="banner-emoji">{{ banner.emoji }}</view>
            <view class="banner-text">
              <view class="banner-title">{{ banner.title }}</view>
              <view class="banner-desc">{{ banner.desc }}</view>
            </view>
          </view>
        </swiper-item>
      </swiper>
    </view>

    <!-- 分类入口 -->
    <view class="section">
      <view class="section-title"><view class="title-bar"></view>选择你的问题</view>
      <view class="scenario-grid">
        <view v-for="cat in categories" :key="cat.id" class="scenario-card" :class="'cat-' + cat.id" @click="goToCategory(cat)">
          <view class="scenario-icon-box">
            <text class="scenario-icon">{{ cat.icon }}</text>
          </view>
          <text class="scenario-name">{{ cat.name }}</text>
        </view>
      </view>
    </view>

    <!-- 热门服务 -->
    <view class="section" v-if="hotProducts.length > 0">
      <view class="section-title"><view class="title-bar"></view>热门服务</view>
      <ProductCard v-for="product in hotProducts" :key="product.id" :product="product" />
    </view>

    <!-- 信任栏 -->
    <view class="trust-bar">
      <view class="trust-item">
        <view class="trust-dot trust-dot-green">&#10003;</view>
        <text class="trust-text">合作律所背书</text>
      </view>
      <view class="trust-item">
        <view class="trust-dot trust-dot-orange">&#8635;</view>
        <text class="trust-text">不满意可退款</text>
      </view>
      <view class="trust-item">
        <view class="trust-dot trust-dot-blue">&#9993;</view>
        <text class="trust-text">1对1专属服务</text>
      </view>
    </view>
  </view>
</template>

<script>
import { getCategories, getProducts } from '@/api/index.js';
import ProductCard from '@/components/ProductCard.vue';

export default {
  components: { ProductCard },
  data: function () {
    return {
      categories: [
        { id: 1, name: '劳动维权', icon: '&#9878;' },
        { id: 2, name: '租房纠纷', icon: '&#8962;' },
        { id: 3, name: '法律文书', icon: '&#182;' },
        { id: 4, name: '年度服务', icon: '&#9733;' },
      ],
      hotProducts: [],
      banners: [
        { bg: 'linear-gradient(135deg, #1a6fb5, #42a5f5)', emoji: '&#9878;', title: '劳动维权专场', desc: '专业律师陪跑仲裁全流程' },
        { bg: 'linear-gradient(135deg, #4caf50, #81c784)', emoji: '&#9733;', title: '新用户福利', desc: '首次咨询立享专属优惠' },
        { bg: 'linear-gradient(135deg, #7b1fa2, #ba68c8)', emoji: '&#128737;', title: '年度会员', desc: '99元/年，无限次法律咨询' },
      ],
    };
  },
  onLoad: function () {
    console.log('[首页] onLoad 触发');
    this.loadData();
  },
  methods: {
    loadData: async function () {
      try {
        var cats = await getCategories();
        if (cats && cats.length > 0) this.categories = cats;
      } catch (e) {
        console.error('[首页] 加载分类失败:', e);
      }
      try {
        var prods = await getProducts();
        if (prods && prods.length > 0) this.hotProducts = prods.slice(0, 3);
      } catch (e) {
        console.error('[首页] 加载产品失败:', e);
      }
    },
    goToCategory: function (cat) {
      uni.navigateTo({ url: '/pages/product/list?categoryId=' + cat.id + '&categoryName=' + cat.name });
    },
    goDetail: function (id) {
      uni.navigateTo({ url: '/pages/product-detail/detail?id=' + id });
    },
  },
};
</script>

<style scoped>
.page { padding-bottom: 40rpx; }

/* ---- Hero ---- */
.hero {
  background: linear-gradient(160deg, #1a6fb5, #1565c0, #0d47a1);
  padding: 56rpx 32rpx 64rpx;
  color: #fff;
  border-radius: 0 0 48rpx 48rpx;
}
.hero-title { font-size: 48rpx; font-weight: 700; margin-bottom: 10rpx; letter-spacing: 2rpx; }
.hero-sub { font-size: 28rpx; opacity: 0.88; margin-bottom: 32rpx; }
.hero-stats { display: flex; justify-content: space-around; padding-top: 28rpx; border-top: 1rpx solid rgba(255,255,255,0.18); }
.stat-item { text-align: center; }
.stat-dot { font-size: 28rpx; margin-bottom: 8rpx; }
.stat-dot-1 { color: rgba(255,255,255,0.7); }
.stat-dot-2 { color: rgba(255,255,255,0.7); }
.stat-dot-3 { color: rgba(255,255,255,0.7); }
.stat-num { font-size: 36rpx; font-weight: 700; }
.stat-label { font-size: 22rpx; opacity: 0.75; margin-top: 4rpx; }

/* ---- Banner ---- */
.banner-section { padding: 0 20rpx; margin-top: -20rpx; position: relative; z-index: 2; }
.banner-swiper { height: 240rpx; border-radius: 20rpx; overflow: hidden; box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.1); }
.banner-slide {
  height: 100%; display: flex; align-items: center; padding: 0 40rpx;
}
.banner-emoji { font-size: 64rpx; margin-right: 28rpx; flex-shrink: 0; }
.banner-text { flex: 1; }
.banner-title { font-size: 34rpx; font-weight: 700; color: #fff; margin-bottom: 8rpx; }
.banner-desc { font-size: 24rpx; color: rgba(255,255,255,0.9); }

/* ---- Section ---- */
.section { margin-top: 32rpx; }
.section-title {
  font-size: 32rpx; font-weight: 600; color: #333;
  padding: 20rpx 20rpx 16rpx;
  display: flex; align-items: center;
}
.title-bar { width: 6rpx; height: 28rpx; background: #1a6fb5; border-radius: 3rpx; margin-right: 16rpx; }

/* ---- Category Grid ---- */
.scenario-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16rpx; padding: 0 20rpx; }
.scenario-card {
  background: #fff; border-radius: 20rpx; padding: 32rpx 20rpx 24rpx;
  text-align: center; box-shadow: 0 2rpx 16rpx rgba(0,0,0,0.05);
  display: flex; flex-direction: column; align-items: center;
  transition: transform 0.15s;
}
.scenario-card:active { transform: scale(0.97); }
.scenario-icon-box {
  width: 88rpx; height: 88rpx; border-radius: 24rpx;
  display: flex; align-items: center; justify-content: center; margin-bottom: 16rpx;
}
.cat-1 .scenario-icon-box { background: #e3f2fd; }
.cat-2 .scenario-icon-box { background: #fff3e0; }
.cat-3 .scenario-icon-box { background: #e8f5e9; }
.cat-4 .scenario-icon-box { background: #f3e5f5; }
.scenario-icon { font-size: 44rpx; }
.scenario-name { font-size: 28rpx; font-weight: 500; color: #333; }

/* ---- Trust Bar ---- */
.trust-bar { display: flex; justify-content: space-around; padding: 32rpx 20rpx; margin: 32rpx 20rpx 0; background: #fff; border-radius: 20rpx; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.03); }
.trust-item { display: flex; flex-direction: column; align-items: center; }
.trust-dot {
  width: 56rpx; height: 56rpx; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 28rpx; margin-bottom: 10rpx; color: #fff;
}
.trust-dot-green { background: #4caf50; }
.trust-dot-orange { background: #ff9800; }
.trust-dot-blue { background: #1a6fb5; }
.trust-text { font-size: 22rpx; color: #666; }
</style>
