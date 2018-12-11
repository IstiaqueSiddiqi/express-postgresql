'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Student', {
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        }
      },
      roll_no: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true
      },
      admissionDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        validate: {
          notEmpty: true,
        }
      },
      active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Student');
  }
};