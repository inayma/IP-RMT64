'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    static associate(models) {
      Post.belongsTo(models.User, { foreignKey: 'userId' });
    }
  }
  Post.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: 'title is required' },
        notEmpty: { msg: 'title is required' }
      }
    },
    summary: {
      type: DataTypes.TEXT // will be AI-generated later
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notNull: { msg: 'description is required' },
        notEmpty: { msg: 'description is required' }
      }
    },
    votes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        isInt: { msg: 'votes must be a number' }
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: { msg: 'userId is required' },
        isInt: { msg: 'userId must be a number' }
      }
    }
  }, {
    sequelize,
    modelName: 'Post',
  });
  return Post;
};
