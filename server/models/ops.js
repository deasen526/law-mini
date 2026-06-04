// 操作符常量（字符串形式，确保 Object.entries() 能正常遍历）
module.exports = {
  Op: {
    gte: '$gte',
    lte: '$lte',
    like: '$like',
    in: '$in',
    or: '$or',
    ne: '$ne',
  },
};
