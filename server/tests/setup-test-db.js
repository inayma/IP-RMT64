const { sequelize } = require("../models");

const setupTestDB = async () => {
  try {
    console.log("Setting up test database...");

    // Sync all models with force: true to recreate tables
    await sequelize.sync({ force: true });

    console.log("Test database setup completed!");
    return true;
  } catch (error) {
    console.error("Error setting up test database:", error);
    throw error;
  }
};

const teardownTestDB = async () => {
  try {
    console.log("Tearing down test database...");

    // Drop all tables
    await sequelize.drop();

    console.log("Test database teardown completed!");
    return true;
  } catch (error) {
    console.error("Error tearing down test database:", error);
    throw error;
  }
};

module.exports = {
  setupTestDB,
  teardownTestDB,
};
