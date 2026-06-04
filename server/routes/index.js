const express = require('express');
const router = express.Router();

const { adminAuth } = require('../middleware/auth');
const { userAuth } = require('../middleware/wxAuth');

// 控制器
const productCtrl = require('../controllers/productController');
const userCtrl = require('../controllers/userController');
const orderCtrl = require('../controllers/orderController');
const adminCtrl = require('../controllers/adminController');

// ==================== 小程序端 API ====================

// 分类 & 产品
router.get('/categories', productCtrl.getCategories);
router.get('/products', productCtrl.getProducts);
router.get('/products/:id', productCtrl.getProductDetail);

// 用户
router.post('/users/login', userCtrl.wxLogin);
router.get('/users/profile', userAuth, userCtrl.getProfile);

// 订单
router.post('/orders', userAuth, orderCtrl.createOrder);
router.post('/orders/:id/pay', userAuth, orderCtrl.payOrder);
router.get('/orders', userAuth, orderCtrl.getMyOrders);
router.get('/orders/:id', userAuth, orderCtrl.getOrderDetail);

// 支付回调（微信服务器调用，不需要认证）
router.post('/orders/pay-notify', orderCtrl.payNotify);

// ==================== 管理后台 API ====================

router.post('/admin/login', adminCtrl.login);

// 需要管理员认证
router.get('/admin/dashboard', adminAuth, adminCtrl.dashboard);

// 产品管理
router.get('/admin/products', adminAuth, adminCtrl.getProducts);
router.post('/admin/products', adminAuth, adminCtrl.createProduct);
router.put('/admin/products/:id', adminAuth, adminCtrl.updateProduct);
router.delete('/admin/products/:id', adminAuth, adminCtrl.deleteProduct);

// 分类管理
router.get('/admin/categories', adminAuth, adminCtrl.getCategories);
router.post('/admin/categories', adminAuth, adminCtrl.createCategory);
router.put('/admin/categories/:id', adminAuth, adminCtrl.updateCategory);

// 订单管理
router.get('/admin/orders', adminAuth, adminCtrl.getOrders);
router.put('/admin/orders/:id/status', adminAuth, adminCtrl.updateOrderStatus);

// 用户管理
router.get('/admin/users', adminAuth, adminCtrl.getUsers);

module.exports = router;
