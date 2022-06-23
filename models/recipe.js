'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class recipe extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.recipe.belongsTo(models.user)
      models.recipe.belongsToMany(models.category, {through: "recipesCategories"})
      models.recipe.hasMany(models.ingredient)
    }
  }
  recipe.init({
    name: DataTypes.STRING,
    directions: DataTypes.TEXT,
    story: DataTypes.TEXT,
    notes: DataTypes.TEXT,
    img: DataTypes.STRING,
    public: DataTypes.BOOLEAN,
    userId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'recipe',
  });
  return recipe;
};