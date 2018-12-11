'use strict';
module.exports = (sequelize, DataTypes) => {
  const SemesterClass = sequelize.define('SemesterClass', {
    classId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      unique: true
    },
    title: {
      type: DataTypes.STRING
    }
  }, {
      timestamps: false,
      freezeTableName: true
    });
  SemesterClass.associate = function (models) {
    // associations can be defined here
    // Will add a university_staff_no attribute to SemesterClass
    SemesterClass.belongsTo(models.Professor, { foreignKey: 'university_staff_no' });
  };
  return SemesterClass;
};