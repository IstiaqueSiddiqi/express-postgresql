'use strict';
module.exports = (sequelize, DataTypes) => {
  const StudentClass = sequelize.define('StudentClass', {
    roll_no: DataTypes.INTEGER,
    classId: DataTypes.INTEGER
  }, {
    timestamps: false,
    freezeTableName: true
  });
  StudentClass.associate = function(models) {
    // associations can be defined here
  };
  return StudentClass;
};