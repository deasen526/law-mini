const dayjs = require('dayjs');

/**
 * 生成订单号
 * 格式：LS + 年月日时分秒 + 4位随机数
 * 示例：LS202406051430250001
 */
function generateOrderNo() {
  const now = dayjs().format('YYYYMMDDHHmmss');
  const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  return `LS${now}${random}`;
}

module.exports = { generateOrderNo };
