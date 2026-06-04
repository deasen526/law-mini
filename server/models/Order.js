const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Order', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    orderNo: {
      type: DataTypes.STRING(32),
      unique: true,
      allowNull: false,
      comment: '订单号',
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '用户ID',
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '产品ID',
    },
    productName: {
      type: DataTypes.STRING(128),
      allowNull: false,
      comment: '产品名称（快照）',
    },
    productPrice: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '产品单价（分，快照）',
    },
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: '数量',
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '实付金额（分）',
    },
    status: {
      type: DataTypes.ENUM('pending', 'paid', 'delivering', 'completed', 'cancelled', 'refunded'),
      defaultValue: 'pending',
      comment: '订单状态',
    },
    wxTransactionId: {
      type: DataTypes.STRING(64),
      allowNull: true,
      comment: '微信支付交易号',
    },
    paidAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '支付时间',
    },
    contactName: {
      type: DataTypes.STRING(32),
      allowNull: true,
      comment: '联系人姓名',
    },
    contactPhone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: '联系人电话',
    },
    remark: {
      type: DataTypes.STRING(512),
      allowNull: true,
      comment: '用户备注',
    },
  }, {
    tableName: 'orders',
    comment: '订单表',
  });
};
