const jwt = require('jsonwebtoken');
const config = require('../config');

// 管理后台 JWT 验证
function adminAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ code: 401, msg: '请先登录' });
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    if (decoded.type !== 'admin') {
      return res.status(403).json({ code: 403, msg: '无权限' });
    }
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ code: 401, msg: '登录已过期，请重新登录' });
  }
}

module.exports = { adminAuth };
