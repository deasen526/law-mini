const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Category', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(32),
      allowNull: false,
      comment: '分类名称',
    },
    icon: {
      type: DataTypes.STRING(128),
      allowNull: true,
      comment: '图标(emoji或图片路径)',
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '排序',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: '是否启用',
    },
  }, {
    tableName: 'categories',
    comment: '产品分类表',
  });
};
