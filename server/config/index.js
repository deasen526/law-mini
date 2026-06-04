require('dotenv').config();

module.exports = {
  // 服务端口
  port: process.env.PORT || 3000,

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'law-shop-dev-secret-key-2024',
    expiresIn: '7d',
  },

  // 管理员账号
  admin: {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || 'admin123456',
  },

  // 微信配置
  wx: {
    appId: process.env.WX_APPID || '',
    appSecret: process.env.WX_APPSECRET || '',
    mchId: process.env.WX_MCHID || '',
    apiV3Key: process.env.WX_API_V3_KEY || '',
    notifyUrl: process.env.WX_NOTIFY_URL || '',
    mchSerialNo: process.env.WX_MCH_SERIAL_NO || '',
  },
};
