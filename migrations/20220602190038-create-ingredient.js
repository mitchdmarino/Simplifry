'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ingredients', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      measure: {
        type: Sequelize.STRING
      },
      quantity: {
        type: Sequelize.FLOAT
      },
      energy: {
        type: Sequelize.FLOAT
      },
      fat: {
        type: Sequelize.FLOAT
      },
      satFat: {
        type: Sequelize.FLOAT
      },
      transFat: {
        type: Sequelize.FLOAT
      },
      carbs: {
        type: Sequelize.FLOAT
      },
      fiber: {
        type: Sequelize.FLOAT
      },
      sugar: {
        type: Sequelize.FLOAT
      },
      protein: {
        type: Sequelize.FLOAT
      },
      cholesterol: {
        type: Sequelize.FLOAT
      },
      NA: {
        type: Sequelize.FLOAT
      },
      CA: {
        type: Sequelize.FLOAT
      },
      MG: {
        type: Sequelize.FLOAT
      },
      K: {
        type: Sequelize.FLOAT
      },
      FE: {
        type: Sequelize.FLOAT
      },
      ZN: {
        type: Sequelize.FLOAT
      },
      P: {
        type: Sequelize.FLOAT
      },
      vitA: {
        type: Sequelize.FLOAT
      },
      vitC: {
        type: Sequelize.FLOAT
      },
      vitD: {
        type: Sequelize.FLOAT
      },
      vitB6: {
        type: Sequelize.FLOAT
      },
      vitB12: {
        type: Sequelize.FLOAT
      },
      recipeId: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ingredients');
  }
};