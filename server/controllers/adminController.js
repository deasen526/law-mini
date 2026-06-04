const jwt = require('jsonwebtoken');
const config = require('../config');
const { Product, Category, Order, User, sequelize } = require('../models');
const { Op } = require('sequelize');

// ========== 登录 ==========
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (username !== config.admin.username || password !== config.admin.password) {
      return res.status(401).json({ code: 401, msg: '账号或密码错误' });
    }

    const token = jwt.sign(
      { type: 'admin', username },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    res.json({ code: 0, data: { token } });
  } catch (err) {
    res.status(500).json({ code: 500, msg: '服务器错误' });
  }
};

// ========== 数据看板 ==========
exports.dashboard = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalOrders,
      todayOrders,
      totalRevenue,
      todayRevenue,
      totalUsers,
      todayUsers,
    ] = await Promise.all([
      Order.count(),
      Order.count({ where: { createdAt: { [Op.gte]: today } } }),
      Order.sum('amount', { where: { status: { [Op.in]: ['paid', 'delivering', 'completed'] } } }),
      Order.sum('amount', { where: { status: { [Op.in]: ['paid', 'delivering', 'completed'] }, createdAt: { [Op.gte]: today } } }),
      User.count(),
      User.count({ where: { createdAt: { [Op.gte]: today } } }),
    ]);

    res.json({
      code: 0,
      data: {
        totalOrders,
        todayOrders,
        totalRevenue: totalRevenue || 0,
        todayRevenue: todayRevenue || 0,
        totalUsers,
        todayUsers,
      },
    });
  } catch (err) {
    console.error('获取看板数据失败:', err);
    res.status(500).json({ code: 500, msg: '服务器错误' });
  }
};

// ========== 产品管理 ==========
exports.getProducts = async (req, res) => {
  try {
    const { page = 1, pageSize = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(pageSize);

    const { rows, count } = await Product.findAndCountAll({
      include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }],
      order: [['sortOrder', 'ASC']],
      limit: parseInt(pageSize),
      offset,
    });

    res.json({ code: 0, data: { list: rows, total: count } });
  } catch (err) {
    res.status(500).json({ code: 500, msg: '服务器错误' });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.json({ code: 0, data: product });
  } catch (err) {
    console.error('创建产品失败:', err);
    res.status(500).json({ code: 500, msg: '服务器错误' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ code: 404, msg: '产品不存在' });
    }
    await product.update(req.body);
    res.json({ code: 0, data: product });
  } catch (err) {
    console.error('更新产品失败:', err);
    res.status(500).json({ code: 500, msg: '服务器错误' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ code: 404, msg: '产品不存在' });
    }
    // 软删除：下架
    await product.update({ isActive: false });
    res.json({ code: 0, msg: '已下架' });
  } catch (err) {
    res.status(500).json({ code: 500, msg: '服务器错误' });
  }
};

// ========== 分类管理 ==========
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({ order: [['sortOrder', 'ASC']] });
    res.json({ code: 0, data: categories });
  } catch (err) {
    res.status(500).json({ code: 500, msg: '服务器错误' });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.json({ code: 0, data: category });
  } catch (err) {
    res.status(500).json({ code: 500, msg: '服务器错误' });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ code: 404, msg: '分类不存在' });
    await category.update(req.body);
    res.json({ code: 0, data: category });
  } catch (err) {
    res.status(500).json({ code: 500, msg: '服务器错误' });
  }
};

// ========== 订单管理 ==========
exports.getOrders = async (req, res) => {
  try {
    const { page = 1, pageSize = 20, status, keyword } = req.query;
    const where = {};
    if (status) where.status = status;
    if (keyword) {
      where[Op.or] = [
        { orderNo: { [Op.like]: `%${keyword}%` } },
        { productName: { [Op.like]: `%${keyword}%` } },
        { contactName: { [Op.like]: `%${keyword}%` } },
        { contactPhone: { [Op.like]: `%${keyword}%` } },
      ];
    }

    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const { rows, count } = await Order.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'nickname', 'phone'] },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(pageSize),
      offset,
    });

    res.json({ code: 0, data: { list: rows, total: count } });
  } catch (err) {
    console.error('获取订单列表失败:', err);
    res.status(500).json({ code: 500, msg: '服务器错误' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ code: 404, msg: '订单不存在' });

    const { status } = req.body;
    const allowedStatus = ['delivering', 'completed', 'cancelled', 'refunded'];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ code: 400, msg: '无效的状态' });
    }

    await order.update({ status });
    res.json({ code: 0, data: order });
  } catch (err) {
    res.status(500).json({ code: 500, msg: '服务器错误' });
  }
};

// ========== 用户管理 ==========
exports.getUsers = async (req, res) => {
  try {
    const { page = 1, pageSize = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(pageSize);

    const { rows, count } = await User.findAndCountAll({
      order: [['createdAt', 'DESC']],
      limit: parseInt(pageSize),
      offset,
      attributes: { exclude: ['openid', 'unionid'] },
    });

    res.json({ code: 0, data: { list: rows, total: count } });
  } catch (err) {
    res.status(500).json({ code: 500, msg: '服务器错误' });
  }
};
