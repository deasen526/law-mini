const { Sequelize } = require('sequelize');
const config = require('../config');

const sequelize = new Sequelize(config.db);

// 导入模型定义
const defineUser = require('./User');
const defineCategory = require('./Category');
const defineProduct = require('./Product');
const defineOrder = require('./Order');

// 定义模型
const User = defineUser(sequelize);
const Category = defineCategory(sequelize);
const Product = defineProduct(sequelize);
const Order = defineOrder(sequelize);

// 模型关联
Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Product.hasMany(Order, { foreignKey: 'productId', as: 'orders' });
Order.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

module.exports = {
  sequelize,
  User,
  Category,
  Product,
  Order,
};
