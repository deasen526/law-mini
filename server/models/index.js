/**
 * 数据层入口
 * 使用纯 JSON 文件存储（零依赖，无需安装数据库）
 */
const { getStore, Op } = require('./store');

// 导出 Store 实例（兼容旧 Sequelize 接口）
const User = getStore('users');
const Category = getStore('categories');
const Product = getStore('products');
const Order = getStore('orders');

module.exports = {
  User,
  Category,
  Product,
  Order,
  Op,
  // sequelize 占位（兼容旧代码）
  sequelize: {
    sync: async () => true,
  },
};
