"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Vote extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Vote.belongsTo(models.User, { foreignKey: "userId" });
      Vote.belongsTo(models.Post, { foreignKey: "postId" });
    }
  }
  Vote.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: "userId is required" },
          isInt: { msg: "userId must be a number" },
        },
      },
      postId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: "postId is required" },
          isInt: { msg: "postId must be a number" },
        },
      },
      value: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: "vote value is required" },
          isIn: { args: [[-1, 1]], msg: "vote value must be -1 or 1" },
        },
      },
    },
    {
      sequelize,
      modelName: "Vote",
    }
  );
  return Vote;
};
