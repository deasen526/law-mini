require('dotenv').config();

module.exports = {
  // 服务端口
  port: process.env.PORT || 3000,

  // 数据库
  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT) || 3306,
    database: process.env.DB_NAME || 'law_shop',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    dialect: 'mysql',
    logging: false,
    timezone: '+08:00',
    define: {
      timestamps: true,
      underscored: true,
      charset: 'utf8mb4',
    },
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-me',
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
  },
};
