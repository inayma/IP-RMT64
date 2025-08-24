const { Pool } = require("pg");

async function createTestDatabase() {
  const pool = new Pool({
    user: "postgres",
    host: "localhost",
    password: "postgres",
    port: 5432,
  });

  try {
    await pool.query("CREATE DATABASE wartek_test");
    console.log('Test database "wartek_test" created successfully!');
  } catch (error) {
    if (error.code === "42P04") {
      console.log('Test database "wartek_test" already exists.');
    } else {
      console.error("Error creating test database:", error.message);
    }
  } finally {
    await pool.end();
  }
}

createTestDatabase();
