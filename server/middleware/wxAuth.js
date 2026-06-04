const { User } = require('../models');
const jwt = require('jsonwebtoken');
const config = require('../config');

// 小程序用户认证中间件
async function userAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    const user = User.findById(decoded.userId);
    if (!user) {
      return next();
    }
    // 挂载用户信息到请求（纯对象，不是 Sequelize 实例）
    req.user = user;
    req.userId = user.id;
    next();
  } catch (err) {
    next();
  }
}

module.exports = { userAuth };
