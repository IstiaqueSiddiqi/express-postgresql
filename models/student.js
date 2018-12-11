'use strict';
module.exports = (sequelize, DataTypes) => {
  const Student = sequelize.define('Student', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      }
    },
    roll_no: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      unique: true
    },
    admissionDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        notEmpty: true,
      }
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
      timestamps: false,
      freezeTableName: true
    });
  Student.associate = function (models) {
    // associations can be defined here
    models.SemesterClass.belongsToMany(Student, { through: 'StudentClass', foreignKey: 'classId' });
    Student.belongsToMany(models.SemesterClass, { through: 'StudentClass', foreignKey: 'roll_no' });
  };
  return Student;
};