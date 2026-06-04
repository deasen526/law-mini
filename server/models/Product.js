const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Product', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '分类ID',
    },
    name: {
      type: DataTypes.STRING(128),
      allowNull: false,
      comment: '产品名称',
    },
    subtitle: {
      type: DataTypes.STRING(256),
      allowNull: true,
      comment: '副标题/一句话卖点',
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '售价（分）',
    },
    originalPrice: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '原价（分）',
    },
    coverImage: {
      type: DataTypes.STRING(512),
      allowNull: true,
      comment: '封面图',
    },
    images: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '详情图片列表',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '产品描述（富文本）',
    },
    scenario: {
      type: DataTypes.STRING(256),
      allowNull: true,
      comment: '适用场景（唤醒用户痛点）',
    },
    roiHint: {
      type: DataTypes.STRING(256),
      allowNull: true,
      comment: 'ROI提示（帮用户算账）',
    },
    features: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '服务内容列表',
    },
    process: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '服务流程',
    },
    cases: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '案例列表',
    },
    guarantee: {
      type: DataTypes.STRING(256),
      allowNull: true,
      comment: '保障承诺',
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '排序',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: '是否上架',
    },
  }, {
    tableName: 'products',
    comment: '产品表',
  });
};
