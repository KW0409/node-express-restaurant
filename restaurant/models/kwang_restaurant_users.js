/* eslint-disable */
'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class KWang_restaurant_users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  KWang_restaurant_users.init({
    nickname: DataTypes.STRING,
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    user_auth: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'KWang_restaurant_users',
  });
  return KWang_restaurant_users;
};