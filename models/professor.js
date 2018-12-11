'use strict';
module.exports = (sequelize, DataTypes) => {
  const Professor = sequelize.define('Professor', {
    name: {
      type: DataTypes.STRING
    },
    university_staff_no: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      unique: true
    },
    designation: {
      type: DataTypes.STRING
    }
  }, {
      timestamps: false,
      freezeTableName: true
    });
  Professor.associate = function (models) {
    // associations can be defined here
  };
  return Professor;
};