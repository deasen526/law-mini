const { Product, Category } = require('../models');

// 获取所有分类（包含分类下的产品）
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { isActive: true },
      order: [['sortOrder', 'ASC']],
      include: [{
        model: Product,
        as: 'products',
        where: { isActive: true },
        attributes: ['id', 'name', 'subtitle', 'price', 'originalPrice', 'coverImage', 'sortOrder'],
        required: false,
        order: [['sortOrder', 'ASC']],
      }],
    });
    res.json({ code: 0, data: categories });
  } catch (err) {
    console.error('获取分类失败:', err);
    res.status(500).json({ code: 500, msg: '服务器错误' });
  }
};

// 获取产品列表
exports.getProducts = async (req, res) => {
  try {
    const { categoryId } = req.query;
    const where = { isActive: true };
    if (categoryId) {
      where.categoryId = parseInt(categoryId);
    }

    const products = await Product.findAll({
      where,
      order: [['sortOrder', 'ASC']],
      attributes: ['id', 'categoryId', 'name', 'subtitle', 'price', 'originalPrice', 'coverImage', 'scenario', 'sortOrder'],
    });
    res.json({ code: 0, data: products });
  } catch (err) {
    console.error('获取产品列表失败:', err);
    res.status(500).json({ code: 500, msg: '服务器错误' });
  }
};

// 获取产品详情
exports.getProductDetail = async (req, res) => {
  try {
    const product = await Product.findOne({
      where: { id: req.params.id, isActive: true },
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name'],
      }],
    });

    if (!product) {
      return res.status(404).json({ code: 404, msg: '产品不存在' });
    }

    res.json({ code: 0, data: product });
  } catch (err) {
    console.error('获取产品详情失败:', err);
    res.status(500).json({ code: 500, msg: '服务器错误' });
  }
};
