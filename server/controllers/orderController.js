const { Order, Product } = require('../models');
const { generateOrderNo } = require('../utils/orderNo');
const { jsapiPay, verifyNotifySign, decryptNotify } = require('../utils/wechatPay');

// 创建订单
exports.createOrder = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ code: 401, msg: '请先登录' });
    }

    const { productId, quantity = 1, contactName, contactPhone, remark } = req.body;

    // 查找产品
    const product = Product.findById(parseInt(productId));
    if (!product || !product.isActive) {
      return res.status(404).json({ code: 404, msg: '产品不存在或已下架' });
    }

    const amount = product.price * quantity;
    const orderNo = generateOrderNo();

    const order = Order.create({
      orderNo,
      userId: req.user.id,
      productId: product.id,
      productName: product.name,
      productPrice: product.price,
      quantity,
      amount,
      status: 'pending',
      contactName: contactName || null,
      contactPhone: contactPhone || null,
      remark: remark || null,
    });

    res.json({
      code: 0,
      data: {
        id: order.id,
        orderNo: order.orderNo,
        amount: order.amount,
        status: order.status,
        productName: order.productName,
        createdAt: order.createdAt,
      },
    });
  } catch (err) {
    console.error('创建订单失败:', err);
    res.status(500).json({ code: 500, msg: '服务器错误' });
  }
};

// 发起微信支付
exports.payOrder = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ code: 401, msg: '请先登录' });
    }

    const order = Order.findOne({ id: parseInt(req.params.id), userId: req.user.id });

    if (!order) {
      return res.status(404).json({ code: 404, msg: '订单不存在' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ code: 400, msg: '订单状态不允许支付' });
    }

    // 调用微信支付
    const payParams = await jsapiPay({
      openid: req.user.openid,
      orderNo: order.orderNo,
      amount: order.amount,
      description: order.productName,
    });

    res.json({
      code: 0,
      data: {
        ...payParams,
        orderNo: order.orderNo,
      },
    });
  } catch (err) {
    console.error('发起支付失败:', err);
    res.status(500).json({ code: 500, msg: '支付失败，请重试' });
  }
};

// 支付回调（微信服务器调用）
exports.payNotify = async (req, res) => {
  try {
    const { headers, body } = req;

    // 验签
    const timestamp = headers['wechatpay-timestamp'];
    const nonce = headers['wechatpay-nonce'];
    const signature = headers['wechatpay-signature'];

    const bodyStr = req.rawBody || JSON.stringify(body);
    const isValid = verifyNotifySign(timestamp, nonce, bodyStr, signature);

    if (!isValid) {
      console.error('支付回调验签失败');
      return res.status(400).json({ code: 'FAIL', message: '验签失败' });
    }

    // 解密
    const resource = body.resource;
    const decrypted = decryptNotify(
      resource.ciphertext,
      resource.nonce,
      resource.associated_data
    );

    const orderNo = decrypted.out_trade_no;
    const transactionId = decrypted.transaction_id;

    // 更新订单状态
    const order = Order.findOne({ orderNo });
    if (order && order.status === 'pending') {
      Order.update(order.id, {
        status: 'paid',
        wxTransactionId: transactionId,
        paidAt: new Date().toISOString(),
      });
    }

    res.status(200).json({ code: 'SUCCESS', message: '成功' });
  } catch (err) {
    console.error('支付回调处理失败:', err);
    res.status(500).json({ code: 'FAIL', message: '服务器错误' });
  }
};

// 查询我的订单列表
exports.getMyOrders = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ code: 401, msg: '请先登录' });
    }

    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * pageSize;

    const result = Order.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: pageSize,
      offset,
    });

    // 关联产品封面图
    const list = result.rows.map(order => {
      const product = Product.findById(order.productId);
      return {
        ...order,
        wxTransactionId: undefined, // 不暴露给前端
        product: product ? { id: product.id, coverImage: product.coverImage } : null,
      };
    });

    res.json({
      code: 0,
      data: {
        list,
        total: result.count,
        page,
        pageSize,
      },
    });
  } catch (err) {
    console.error('获取订单列表失败:', err);
    res.status(500).json({ code: 500, msg: '服务器错误' });
  }
};

// 查询订单详情
exports.getOrderDetail = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ code: 401, msg: '请先登录' });
    }

    const order = Order.findOne({
      id: parseInt(req.params.id),
      userId: req.user.id,
    });

    if (!order) {
      return res.status(404).json({ code: 404, msg: '订单不存在' });
    }

    const product = Product.findById(order.productId);
    const result = {
      ...order,
      product: product ? {
        id: product.id,
        name: product.name,
        coverImage: product.coverImage,
        features: product.features,
        process: product.process,
      } : null,
    };

    res.json({ code: 0, data: result });
  } catch (err) {
    console.error('获取订单详情失败:', err);
    res.status(500).json({ code: 500, msg: '服务器错误' });
  }
};
