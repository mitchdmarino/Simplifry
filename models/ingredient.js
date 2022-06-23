'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ingredient extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ingredient.init({
    name: DataTypes.STRING,
    measure: DataTypes.STRING,
    quantity: DataTypes.FLOAT,
    energy: DataTypes.FLOAT,
    fat: DataTypes.FLOAT,
    satFat: DataTypes.FLOAT,
    transFat: DataTypes.FLOAT,
    carbs: DataTypes.FLOAT,
    fiber: DataTypes.FLOAT,
    sugar: DataTypes.FLOAT,
    protein: DataTypes.FLOAT,
    cholesterol: DataTypes.FLOAT,
    NA: DataTypes.FLOAT,
    CA: DataTypes.FLOAT,
    MG: DataTypes.FLOAT,
    K: DataTypes.FLOAT,
    FE: DataTypes.FLOAT,
    ZN: DataTypes.FLOAT,
    P: DataTypes.FLOAT,
    vitA: DataTypes.FLOAT,
    vitC: DataTypes.FLOAT,
    vitD: DataTypes.FLOAT,
    vitB6: DataTypes.FLOAT,
    vitB12: DataTypes.FLOAT,
    recipeId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'ingredient',
  });
  return ingredient;
};