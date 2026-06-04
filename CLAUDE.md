# 法律助手 - 小程序商城

## 系统架构

```
小程序(uni-app) → 后端API(Express) → JSON文件数据库
管理后台(HTML/JS) ────┘
```

## 技术栈

| 层 | 技术 | 位置 |
|---|------|------|
| 小程序 | uni-app (Vue 3 Composition API) | `/miniprogram/` |
| 后端 | Node.js + Express | `/server/` |
| 数据库 | **JSON 文件存储**（零依赖，在 `/server/data/`） | 无MySQL |
| 管理后台 | 原生 HTML/JS（无框架） | `/admin/` |
| 支付 | 微信支付 JSAPI | `/server/utils/wechatPay.js` |

## 关键决策（不要推翻）

1. **为什么是 JSON 文件数据库而不是 MySQL？** → 用户是技术小白，Windows 环境没有 MySQL。JSON 文件零安装、可直接打开查看。后期量大了再切 MySQL。
2. **为什么是 Express 而不是 Koa/Nest？** → 最通用，好招人，生态最成熟。
3. **为什么管理后台是原生 HTML 而不是 Vue/React？** → 管理后台功能简单（CRUD），原生 HTML 可以直接浏览器打开，无需编译。
4. **为什么没有购物车？** → 法律产品是单次购买服务，不需要购物车。用户选产品 → 直接下单。后期如果需要加购多个产品，再加购物车。
5. **为什么没有用户注册系统？** → 只有微信登录。用户从私域（微信）进来，天然带着微信身份。

## 产品逻辑

### 产品线（三级阶梯）

| 阶梯 | 产品 | 价格 | 目的 |
|------|------|------|------|
| 引流品 | AI法律分析报告 | 9.9元 | 让用户从免费→付费 |
| 利润品 | 劳动仲裁全程陪跑 | 599元 | 核心利润 |
| 高价品 | 律师代理劳动仲裁 | 1999元+ | 高客单 |

### 产品详情页结构（重要）

每个产品详情页按此顺序排列：
1. **场景唤醒** — 用户痛点（"被欠薪2个月..."）
2. **ROI算账** — 帮用户算他值多少钱（绿底突出）
3. **服务内容** — 具体做什么（✅ 列表）
4. **服务流程** — 步骤 1→2→3→4
5. **真实案例** — 标题+描述+结果
6. **保障承诺** — 退款条件
7. **CTA按钮** — "立即获取" 而非 "立即购买"

### 用户路径

```
小红书/抖音广告 → 加微信 → 私域沟通 → 推送小程序 → 下单支付
```

小程序**不负责获客**，只负责成交。用户打开小程序时已经被私域顾问"教育"过了。

## 数据库模型（JSON Store 字段）

### products 表
```
id, categoryId, name, subtitle, price(分), originalPrice(分),
coverImage, scenario, roiHint, features(Array), process(Array),
cases(Array), guarantee, sortOrder, isActive
```

### orders 表
```
id, orderNo, userId, productId, productName, productPrice,
quantity, amount, status(pending|paid|delivering|completed|cancelled|refunded),
wxTransactionId, paidAt, contactName, contactPhone, remark
```

### users 表
```
id, openid, unionid, nickname, avatarUrl, phone, source
```

### categories 表
```
id, name, icon(emoji), sortOrder, isActive
```

## 需要我做但做不到的事（必须真人处理）

- ❌ 微信小程序注册 + 认证 + 类目审核
- ❌ 微信支付商户号申请 + 关联小程序
- ❌ 小程序真机调试（需要扫码）
- ❌ 服务器购买 + 域名备案
- ❌ 产品封面图设计（目前用 emoji 占位）

## 当前状态

- [x] 后端 API（15个接口，全部可用）
- [x] 小程序前端（7个页面，代码完成，待编译运行）
- [x] 管理后台（登录/看板/产品/订单/用户管理）
- [x] 种子数据（4分类+6产品）
- [x] tabBar图标（8个PNG，纯JS生成）
- [ ] HBuilderX + 微信开发者工具（待安装）
- [ ] 微信小程序 AppID（待申请）
- [ ] 微信支付商户号（待申请）

## 代码规范

- 后端：ES5 CommonJS（`require/module.exports`），不使用 ES Module
- 小程序：Vue 3 Composition API（`<script setup>`）
- API 返回格式：`{ code: 0, data: ... }` 或 `{ code: 非0, msg: '错误信息' }`
- 金额单位：**分**（整数），前端显示时 `/100`
- 所有时间用 ISO 字符串存储在 JSON 中
