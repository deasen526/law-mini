const jwt = require('jsonwebtoken');
const config = require('../config');
const { Product, Category, Order, User } = require('../models');

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
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const allOrders = Order.all();
    const allUsers = User.all();

    const totalOrders = allOrders.length;
    const todayOrders = allOrders.filter(o => o.createdAt?.startsWith(today)).length;

    const paidOrders = allOrders.filter(o =>
      ['paid', 'delivering', 'completed'].includes(o.status)
    );
    const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
    const todayRevenue = paidOrders
      .filter(o => o.createdAt?.startsWith(today))
      .reduce((sum, o) => sum + (o.amount || 0), 0);

    const totalUsers = allUsers.length;
    const todayUsers = allUsers.filter(u => u.createdAt?.startsWith(today)).length;

    res.json({
      code: 0,
      data: {
        totalOrders, todayOrders,
        totalRevenue, todayRevenue,
        totalUsers, todayUsers,
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
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const offset = (page - 1) * pageSize;

    const result = Product.findAll({
      order: [['sortOrder', 'ASC']],
      limit: pageSize,
      offset,
    });

    const list = result.rows.map(p => {
      const category = Category.findById(p.categoryId);
      return {
        ...p,
        category: category ? { id: category.id, name: category.name } : null,
      };
    });

    res.json({ code: 0, data: { list, total: result.count } });
  } catch (err) {
    res.status(500).json({ code: 500, msg: '服务器错误' });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const product = Product.create(req.body);
    res.json({ code: 0, data: product });
  } catch (err) {
    console.error('创建产品失败:', err);
    res.status(500).json({ code: 500, msg: '服务器错误' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = Product.findById(parseInt(req.params.id));
    if (!product) {
      return res.status(404).json({ code: 404, msg: '产品不存在' });
    }
    const updated = Product.update(product.id, req.body);
    res.json({ code: 0, data: updated });
  } catch (err) {
    console.error('更新产品失败:', err);
    res.status(500).json({ code: 500, msg: '服务器错误' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = Product.findById(parseInt(req.params.id));
    if (!product) {
      return res.status(404).json({ code: 404, msg: '产品不存在' });
    }
    Product.update(product.id, { isActive: false });
    res.json({ code: 0, msg: '已下架' });
  } catch (err) {
    res.status(500).json({ code: 500, msg: '服务器错误' });
  }
};

// ========== 分类管理 ==========
exports.getCategories = async (req, res) => {
  try {
    const result = Category.findAll({ order: [['sortOrder', 'ASC']] });
    res.json({ code: 0, data: result.rows });
  } catch (err) {
    res.status(500).json({ code: 500, msg: '服务器错误' });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const category = Category.create(req.body);
    res.json({ code: 0, data: category });
  } catch (err) {
    res.status(500).json({ code: 500, msg: '服务器错误' });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const category = Category.findById(parseInt(req.params.id));
    if (!category) return res.status(404).json({ code: 404, msg: '分类不存在' });
    const updated = Category.update(category.id, req.body);
    res.json({ code: 0, data: updated });
  } catch (err) {
    res.status(500).json({ code: 500, msg: '服务器错误' });
  }
};

// ========== 订单管理 ==========
exports.getOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const offset = (page - 1) * pageSize;
    const { status, keyword } = req.query;

    const where = {};
    if (status) where.status = status;

    const result = Order.findAll({
      order: [['createdAt', 'DESC']],
      limit: pageSize,
      offset,
    });

    let list = result.rows;

    // 手动筛选状态
    if (status) {
      list = list.filter(o => o.status === status);
    }

    // 关键词搜索
    if (keyword) {
      list = list.filter(o =>
        (o.orderNo && o.orderNo.includes(keyword)) ||
        (o.productName && o.productName.includes(keyword)) ||
        (o.contactName && o.contactName.includes(keyword)) ||
        (o.contactPhone && o.contactPhone.includes(keyword))
      );
    }

    // 关联用户
    list = list.map(o => {
      const user = User.findById(o.userId);
      return {
        ...o,
        user: user ? { id: user.id, nickname: user.nickname, phone: user.phone } : null,
      };
    });

    res.json({ code: 0, data: { list, total: list.length } });
  } catch (err) {
    console.error('获取订单列表失败:', err);
    res.status(500).json({ code: 500, msg: '服务器错误' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const order = Order.findById(parseInt(req.params.id));
    if (!order) return res.status(404).json({ code: 404, msg: '订单不存在' });

    const { status } = req.body;
    const allowedStatus = ['delivering', 'completed', 'cancelled', 'refunded'];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ code: 400, msg: '无效的状态' });
    }

    const updated = Order.update(order.id, { status });
    res.json({ code: 0, data: updated });
  } catch (err) {
    res.status(500).json({ code: 500, msg: '服务器错误' });
  }
};

// ========== 用户管理 ==========
exports.getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const offset = (page - 1) * pageSize;

    const result = User.findAll({
      order: [['createdAt', 'DESC']],
      limit: pageSize,
      offset,
    });

    // 脱敏
    const list = result.rows.map(u => ({
      id: u.id, nickname: u.nickname, phone: u.phone,
      source: u.source, createdAt: u.createdAt,
    }));

    res.json({ code: 0, data: { list, total: result.count } });
  } catch (err) {
    res.status(500).json({ code: 500, msg: '服务器错误' });
  }
};
