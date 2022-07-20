/* eslint-disable */
'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class KWang_restaurant_prize_list extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  KWang_restaurant_prize_list.init({
    sequence: DataTypes.INTEGER,
    rank: DataTypes.STRING,
    prize: DataTypes.STRING,
    description: DataTypes.TEXT,
    image: DataTypes.TEXT,
    amount: DataTypes.INTEGER,
    percentage: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'KWang_restaurant_prize_list',
  });
  return KWang_restaurant_prize_list;
};