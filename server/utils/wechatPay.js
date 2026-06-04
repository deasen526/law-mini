/**
 * 微信支付 JSAPI（V3 接口）
 *
 * 使用说明：
 * - wx.mchPrivateKey: 商户 API 私钥（PEM 格式），用于请求签名
 * - wx.apiV3Key: APIv3 密钥（32 字节），用于回调解密
 * - wx.mchSerialNo: 商户证书序列号
 * - wx.platformSerialNo: 微信平台证书序列号（可选）
 */
const axios = require('axios');
const crypto = require('crypto');
const config = require('../config');

/**
 * 微信支付 JSAPI 下单
 */
async function jsapiPay({ openid, orderNo, amount, description }) {
  const { appId, mchId, mchPrivateKey, mchSerialNo, notifyUrl } = config.wx;

  // 请求体
  const body = {
    appid: appId,
    mchid: mchId,
    description: description.slice(0, 127),
    out_trade_no: orderNo,
    notify_url: notifyUrl,
    amount: { total: amount, currency: 'CNY' },
    payer: { openid: openid },
  };

  const nonceStr = generateNonceStr();
  const timestamp = Math.floor(Date.now() / 1000);
  const method = 'POST';
  const url = '/v3/pay/transactions/jsapi';
  const signStr = `${method}\n${url}\n${timestamp}\n${nonceStr}\n${JSON.stringify(body)}\n`;

  // 用商户私钥签名（RSA-SHA256）
  const signature = signRSA(signStr, mchPrivateKey);

  try {
    const res = await axios.post(`https://api.mch.weixin.qq.com${url}`, body, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `WECHATPAY2-SHA256-RSA2048 mchid="${mchId}",nonce_str="${nonceStr}",signature="${signature}",timestamp="${timestamp}",serial_no="${mchSerialNo}"`,
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
    const paySign = signRSA(paySignStr, mchPrivateKey);

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
 * 使用微信平台公钥验证签名
 */
function verifyNotifySign(timestamp, nonce, body, signature) {
  // WeChat Pay V3 回调签名验证：
  // 使用微信平台公钥（从微信证书接口获取）验证
  // 此处使用 apiV3Key 作为占位 ── 生产环境需替换为平台公钥
  const signStr = `${timestamp}\n${nonce}\n${body}\n`;
  const expected = signRSA(signStr, config.wx.apiV3Key);
  return expected === signature;
}

/**
 * 解密回调数据
 * 使用 AES-256-GCM，数据为 Base64 编码
 */
function decryptNotify(ciphertext, nonce, associatedData) {
  const key = Buffer.from(config.wx.apiV3Key, 'utf8');

  // nonce 和 ciphertext 在微信回调中是 Base64 编码的
  const iv = Buffer.from(nonce, 'base64');
  const encrypted = Buffer.from(ciphertext, 'base64');

  // AES-256-GCM: 最后 16 字节是认证标签
  const authTag = encrypted.slice(-16);
  const data = encrypted.slice(0, -16);

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAAD(Buffer.from(associatedData || '', 'utf8'));
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(data),
    decipher.final(),
  ]);

  return JSON.parse(decrypted.toString('utf8'));
}

// --- 辅助函数 ---

/**
 * RSA-SHA256 签名
 * privateKey: PEM 格式的商户私钥
 */
function signRSA(data, privateKey) {
  return crypto.createSign('RSA-SHA256').update(data).sign(privateKey, 'base64');
}

function generateNonceStr(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

module.exports = {
  jsapiPay,
  verifyNotifySign,
  decryptNotify,
};
