# 法律助手 - 小程序商城

## 技术栈

| 层 | 技术 |
|---|------|
| 小程序 | uni-app (Vue 3) |
| 后端 | Node.js + Express |
| 数据库 | MySQL + Sequelize ORM |
| 管理后台 | 原生 HTML/JS |
| 支付 | 微信支付 JSAPI |

## 项目结构

```
law/
├── server/           # Node.js 后端
│   ├── app.js        # 服务入口
│   ├── config/       # 配置
│   ├── models/       # 数据模型
│   ├── routes/       # 路由
│   ├── controllers/  # 控制器
│   ├── middleware/    # 中间件
│   ├── utils/        # 工具（微信支付等）
│   └── seed/         # 种子数据
├── miniprogram/      # uni-app 小程序
│   ├── pages/        # 页面
│   ├── components/   # 组件
│   ├── api/          # API 封装
│   ├── store/        # Pinia 状态管理
│   └── static/       # 静态资源
└── admin/            # 管理后台
    ├── login.html
    ├── index.html
    └── js/admin.js
```

## 快速启动

### 1. 环境准备

- Node.js >= 18
- MySQL >= 5.7
- HBuilderX（用于编译 uni-app 小程序）
- 微信开发者工具

### 2. 后端部署

```bash
cd server
cp .env.example .env
# 编辑 .env 填入数据库密码等信息

npm install
npm run seed    # 初始化数据库 + 种子数据
npm run dev     # 启动开发服务器 → http://localhost:3000
```

### 3. 小程序配置

1. 用 HBuilderX 打开 `miniprogram/` 目录
2. 修改 `manifest.json` 中的微信小程序 AppID
3. 修改 `api/index.js` 中的 `BASE_URL` 为实际后端地址
4. 运行 → 微信开发者工具

> **注意：** 需要在 `miniprogram/static/tab/` 下放置 tabBar 图标文件：
> - home.png / home-active.png
> - product.png / product-active.png
> - order.png / order-active.png
> - user.png / user-active.png

### 4. 管理后台

直接浏览器打开 `admin/login.html`
- 默认账号: `admin`
- 默认密码: `admin123456`
- 修改密码请在 `.env` 中配置 `ADMIN_USERNAME` 和 `ADMIN_PASSWORD`

## API 一览

### 小程序端

| 方法 | 路径 | 说明 |
|-----|------|------|
| GET | /api/categories | 获取分类+产品 |
| GET | /api/products | 产品列表 |
| GET | /api/products/:id | 产品详情 |
| POST | /api/users/login | 微信登录 |
| GET | /api/users/profile | 用户信息 |
| POST | /api/orders | 创建订单 |
| POST | /api/orders/:id/pay | 发起支付 |
| GET | /api/orders | 我的订单 |
| GET | /api/orders/:id | 订单详情 |
| POST | /api/orders/pay-notify | 微信支付回调 |

### 管理后台

| 方法 | 路径 | 说明 |
|-----|------|------|
| POST | /api/admin/login | 登录 |
| GET | /api/admin/dashboard | 数据看板 |
| CRUD | /api/admin/products | 产品管理 |
| CRUD | /api/admin/categories | 分类管理 |
| GET | /api/admin/orders | 订单列表 |
| PUT | /api/admin/orders/:id/status | 更新订单状态 |
| GET | /api/admin/users | 用户列表 |

## 部署检查清单

- [ ] MySQL 数据库已创建（`CREATE DATABASE law_shop CHARACTER SET utf8mb4;`）
- [ ] `.env` 配置已填入真实值
- [ ] 微信小程序 AppID 已配置
- [ ] 微信支付商户号已配置
- [ ] 支付回调 URL 已配置为公网可访问地址
- [ ] 小程序类目审核通过（法律服务-法律咨询）
- [ ] 微信支付商户号已关联小程序
- [ ] 生产环境修改 `ADMIN_USERNAME` / `ADMIN_PASSWORD`

## 生产环境

```bash
# 使用 PM2 运行
npm install -g pm2
pm2 start app.js --name law-shop
```
