const axios = require('axios');
const crypto = require('crypto');
const config = require('../config');

/**
 * 微信支付 JSAPI 下单
 * @param {Object} params
 * @param {string} params.openid - 用户openid
 * @param {string} params.orderNo - 商户订单号
 * @param {number} params.amount - 金额（分）
 * @param {string} params.description - 商品描述
 * @returns {Object} { prepay_id, nonceStr, paySign, timeStamp, signType }
 */
async function jsapiPay({ openid, orderNo, amount, description }) {
  const { appId, mchId, apiV3Key, notifyUrl } = config.wx;

  // 请求体
  const body = {
    appid: appId,
    mchid: mchId,
    description: description.slice(0, 127), // 微信限制127字符
    out_trade_no: orderNo,
    notify_url: notifyUrl,
    amount: {
      total: amount,
      currency: 'CNY',
    },
    payer: {
      openid: openid,
    },
  };

  // 生成签名
  const nonceStr = generateNonceStr();
  const timestamp = Math.floor(Date.now() / 1000);
  const method = 'POST';
  const url = '/v3/pay/transactions/jsapi';
  const signStr = `${method}\n${url}\n${timestamp}\n${nonceStr}\n${JSON.stringify(body)}\n`;
  const signature = sign(signStr, apiV3Key);

  try {
    const res = await axios.post(`https://api.mch.weixin.qq.com${url}`, body, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `WECHATPAY2-SHA256-RSA2048 mchid="${mchId}",nonce_str="${nonceStr}",signature="${signature}",timestamp="${timestamp}",serial_no="${getSerialNo()}"`,
      },
    });

    const prepayId = res.data.prepay_id;

    // 生成小程序调起支付的签名
    const paySignParams = {
      appId: appId,
      timeStamp: String(timestamp),
      nonceStr: nonceStr,
      package: `prepay_id=${prepayId}`,
      signType: 'RSA',
    };
    const paySignStr = `${paySignParams.appId}\n${paySignParams.timeStamp}\n${paySignParams.nonceStr}\n${paySignParams.package}\n`;
    const paySign = sign(paySignStr, apiV3Key);

    return {
      prepayId,
      nonceStr,
      paySign,
      timeStamp: String(timestamp),
      signType: 'RSA',
    };
  } catch (err) {
    console.error('微信支付下单失败:', err.response?.data || err.message);
    throw new Error('微信支付下单失败');
  }
}

/**
 * 验签支付回调
 */
function verifyNotifySign(timestamp, nonce, body, signature) {
  const signStr = `${timestamp}\n${nonce}\n${body}\n`;
  const expected = sign(signStr, config.wx.apiV3Key);
  return expected === signature;
}

/**
 * 解密回调数据
 */
function decryptNotify(ciphertext, nonce, associatedData) {
  const key = config.wx.apiV3Key;
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(nonce, 'utf8'));
  decipher.setAAD(Buffer.from(associatedData || '', 'utf8'));
  decipher.setAuthTag(Buffer.from(ciphertext.slice(-32), 'hex')); // 最后16字节是认证标签
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(ciphertext.slice(0, -32), 'hex')),
    decipher.final(),
  ]);
  return JSON.parse(decrypted.toString('utf8'));
}

// --- 辅助函数 ---

function generateNonceStr(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function sign(data, key) {
  return crypto.createSign('RSA-SHA256').update(data).sign(key, 'base64');
}

function getSerialNo() {
  // 从证书中解析序列号，简化处理
  // 实际生产环境需要用真实商户证书
  return process.env.WX_MCH_SERIAL_NO || '';
}

module.exports = {
  jsapiPay,
  verifyNotifySign,
  decryptNotify,
};
