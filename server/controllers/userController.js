const axios = require('axios');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { User } = require('../models');

// 微信登录
exports.wxLogin = async (req, res) => {
  try {
    const { code, nickname, avatarUrl } = req.body;

    if (!code) {
      return res.status(400).json({ code: 400, msg: '缺少登录凭证code' });
    }

    // 调用微信接口换取 openid
    const { appId, appSecret } = config.wx;
    const wxRes = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
      params: {
        appid: appId,
        secret: appSecret,
        js_code: code,
        grant_type: 'authorization_code',
      },
    });

    const { openid, unionid, errcode, errmsg } = wxRes.data;

    if (errcode) {
      console.error('微信登录失败:', errcode, errmsg);
      return res.status(400).json({ code: 400, msg: '微信登录失败，请重试' });
    }

    if (!openid) {
      return res.status(400).json({ code: 400, msg: '获取openid失败' });
    }

    // 查找或创建用户
    let user = User.findOne({ openid });

    if (!user) {
      user = User.create({
        openid,
        unionid: unionid || null,
        nickname: nickname || null,
        avatarUrl: avatarUrl || null,
      });
    } else {
      // 更新用户信息
      const updates = {};
      if (nickname) updates.nickname = nickname;
      if (avatarUrl) updates.avatarUrl = avatarUrl;
      if (unionid && !user.unionid) updates.unionid = unionid;

      if (Object.keys(updates).length > 0) {
        user = User.update(user.id, updates);
      }
    }

    // 生成 JWT
    const token = jwt.sign(
      { userId: user.id, openid: user.openid },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    res.json({
      code: 0,
      data: {
        token,
        user: {
          id: user.id,
          nickname: user.nickname || nickname,
          avatarUrl: user.avatarUrl || avatarUrl,
          phone: user.phone,
        },
      },
    });
  } catch (err) {
    console.error('登录失败:', err);
    res.status(500).json({ code: 500, msg: '服务器错误' });
  }
};

// 获取用户信息
exports.getProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.json({ code: 0, data: null });
    }
    res.json({
      code: 0,
      data: {
        id: req.user.id,
        nickname: req.user.nickname,
        avatarUrl: req.user.avatarUrl,
        phone: req.user.phone,
      },
    });
  } catch (err) {
    res.status(500).json({ code: 500, msg: '服务器错误' });
  }
};
