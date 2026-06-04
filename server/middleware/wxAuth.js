const { User } = require('../models');

// 小程序用户认证中间件
// 从请求头 Authorization Bearer token 中获取 openid
// token 就是微信登录后返回给前端的 jwt（包含 openid）
const jwt = require('jsonwebtoken');
const config = require('../config');

async function userAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    // 未登录也可以访问部分接口（如产品列表），这里不阻断
    // 需要用户信息的接口自行判断 req.user
    return next();
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return next();
    }
    req.user = user;
    req.userId = user.id;
    next();
  } catch (err) {
    // token 无效也不阻断，当作未登录处理
    next();
  }
}

module.exports = { userAuth };
