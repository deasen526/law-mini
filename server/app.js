const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const config = require('./config');
const routes = require('./routes');

const app = express();

// 中间件
app.use(cors());
// 支付回调需要原始body
app.use('/api/orders/pay-notify', bodyParser.json({
  verify: (req, res, buf) => { req.rawBody = buf.toString(); }
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 路由
app.use('/api', routes);

// 健康检查
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// 启动服务
const port = config.port;
app.listen(port, () => {
  console.log('✅ 服务已启动');
  console.log(`  地址: http://localhost:${port}`);
  console.log(`  管理后台 API: http://localhost:${port}/api/admin/login`);
  console.log(`  健康检查: http://localhost:${port}/health`);
  console.log('');
  console.log('📦 使用 JSON 文件数据库（无需安装 MySQL）');
  console.log(`  数据目录: server/data/`);
});
