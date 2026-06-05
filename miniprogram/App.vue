<script>
export default {
  onLaunch() {
    console.log('法律助手小程序启动');
  },
  onShow() {
    console.log('App Show');
  },
  onHide() {
    console.log('App Hide');
  },
};
</script>

<style lang="scss">
/* 全局样式 */
@import '@/uni.scss';

page {
  background-color: $bg-color;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC',
    'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial,
    sans-serif;
  color: $text-primary;
  font-size: $font-md;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* — 通用按钮 — */
.btn-primary {
  background: linear-gradient(135deg, $primary-color, $primary-light);
  color: #fff;
  border: none;
  border-radius: $radius-md;
  padding: 24rpx;
  font-size: $font-lg;
  font-weight: 500;
}

/* — 卡片 — */
.card {
  background: #fff;
  border-radius: $radius-lg;
  padding: $spacing-md;
  margin: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

/* — 可按压元素 — */
.pressable {
  transition: transform 0.15s, opacity 0.15s;
  &:active {
    transform: scale(0.97);
    opacity: 0.85;
  }
}

/* — 表单输入框 — */
.input-field {
  background: #f9f9f9;
  border-radius: $radius-md;
  padding: 0 $spacing-md;
  height: 88rpx;
  border: 2rpx solid transparent;
  transition: border-color 0.2s, background 0.2s;
  font-size: $font-md;
  color: $text-primary;
}
.input-field:focus {
  border-color: $primary-color;
  background: #fff;
}

/* — 彩色徽章（药丸） — */
.badge {
  display: inline-block;
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  font-weight: 500;
  line-height: 1.6;
}
.badge-pending { background: #fff3e0; color: #f57c00; }
.badge-paid { background: #e3f2fd; color: $primary-color; }
.badge-delivering { background: #e8f5e9; color: #388e3c; }
.badge-completed { background: #e8f5e9; color: #2e7d32; }
.badge-cancelled { background: #f5f5f5; color: #999; }
.badge-refunded { background: #fce4ec; color: #c62828; }

/* — 骨架屏 — */
@keyframes shimmer {
  to { background-position-x: -200%; }
}
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 8rpx;
}

/* — Safe-Area 变量 — */
page {
  --safe-insert-bottom: env(safe-area-inset-bottom, 0);
  --safe-insert-top: env(safe-area-inset-top, 0);
}
.safe-bottom {
  padding-bottom: var(--safe-insert-bottom);
}
.safe-top {
  padding-top: var(--safe-insert-top);
}
</style>
