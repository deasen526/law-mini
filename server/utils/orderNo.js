/**
 * 生成订单号
 * 格式：LS + 年月日时分秒 + 4位随机数
 */
function generateOrderNo() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const h = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  return `LS${y}${m}${d}${h}${min}${s}${random}`;
}

module.exports = { generateOrderNo };
