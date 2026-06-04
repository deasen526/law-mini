const { Product, Category } = require('../models');

// 获取所有分类（包含分类下的产品）
exports.getCategories = async (req, res) => {
  try {
    const categories = Category.findAll({
      where: { isActive: true },
      order: [['sortOrder', 'ASC']],
    }).rows;

    const result = categories.map(cat => {
      const products = Product.findAll({
        where: { categoryId: cat.id, isActive: true },
        order: [['sortOrder', 'ASC']],
      }).rows.map(p => ({
        id: p.id, name: p.name, subtitle: p.subtitle,
        price: p.price, originalPrice: p.originalPrice,
        coverImage: p.coverImage, sortOrder: p.sortOrder,
      }));
      return { ...cat, products };
    });

    res.json({ code: 0, data: result });
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
    if (categoryId) where.categoryId = parseInt(categoryId);

    const result = Product.findAll({
      where,
      order: [['sortOrder', 'ASC']],
    });

    const products = result.rows.map(p => ({
      id: p.id, categoryId: p.categoryId, name: p.name,
      subtitle: p.subtitle, price: p.price, originalPrice: p.originalPrice,
      coverImage: p.coverImage, scenario: p.scenario, sortOrder: p.sortOrder,
    }));

    res.json({ code: 0, data: products });
  } catch (err) {
    console.error('获取产品列表失败:', err);
    res.status(500).json({ code: 500, msg: '服务器错误' });
  }
};

// 获取产品详情
exports.getProductDetail = async (req, res) => {
  try {
    const product = Product.findById(parseInt(req.params.id));

    if (!product || !product.isActive) {
      return res.status(404).json({ code: 404, msg: '产品不存在' });
    }

    // 关联分类信息
    const category = Category.findById(product.categoryId);
    const result = {
      ...product,
      category: category ? { id: category.id, name: category.name } : null,
    };

    res.json({ code: 0, data: result });
  } catch (err) {
    console.error('获取产品详情失败:', err);
    res.status(500).json({ code: 500, msg: '服务器错误' });
  }
};
