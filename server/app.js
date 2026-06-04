const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const config = require('./config');
const routes = require('./routes');
const { sequelize } = require('./models');

const app = express();

// 中间件
app.use(cors());
// 支付回调需要原始body，所以放在路由之前
app.use('/api/orders/pay-notify', bodyParser.json({ verify: (req, res, buf) => { req.rawBody = buf.toString(); } }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 路由
app.use('/api', routes);

// 健康检查
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// 启动服务
async function start() {
  try {
    // 同步数据库表结构
    await sequelize.sync({ alter: true });
    console.log('✅ 数据库连接成功，表结构已同步');

    app.listen(config.port, () => {
      console.log(`✅ 服务已启动: http://localhost:${config.port}`);
      console.log(`📋 API 前缀: /api`);
      console.log(`🔧 管理后台 API: /api/admin/*`);
    });
  } catch (err) {
    console.error('❌ 启动失败:', err);
    process.exit(1);
  }
}

start();
