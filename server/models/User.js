const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    openid: {
      type: DataTypes.STRING(64),
      unique: true,
      allowNull: false,
      comment: '微信openid',
    },
    unionid: {
      type: DataTypes.STRING(64),
      allowNull: true,
      comment: '微信unionid',
    },
    nickname: {
      type: DataTypes.STRING(64),
      allowNull: true,
      comment: '微信昵称',
    },
    avatarUrl: {
      type: DataTypes.STRING(512),
      allowNull: true,
      comment: '头像URL',
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: '手机号',
    },
    source: {
      type: DataTypes.STRING(32),
      allowNull: true,
      comment: '来源渠道（xiaohongshu/douyin/weixin）',
    },
  }, {
    tableName: 'users',
    comment: '用户表',
  });
};
