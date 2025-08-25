const request = require("supertest");
const {
  test,
  expect,
  describe,
  beforeAll,
  afterAll,
} = require("@jest/globals");
const app = require("../app");
const { hashPassword } = require("../helpers/bcrypt");
const { signToken } = require("../helpers/jwt");
const { sequelize, User, Post, Vote } = require("../models");

// Database setup utilities
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

// Protected endpoint testing
let access_token_user1;
let access_token_user2;
let testUserId1;
let testUserId2;
let testPostId;

// Setup database and test data
beforeAll(async () => {
  console.log("BeforeAll -> Setting up test database and seeding data");

  // Setup test database tables
  await setupTestDB();

  // Create test users
  const user1 = await User.create({
    username: "testuser1",
    email: "testuser1@wartek.com",
    password: "password123", // Will be hashed by the model hook
  });

  const user2 = await User.create({
    username: "testuser2",
    email: "testuser2@wartek.com",
    password: "password123", // Will be hashed by the model hook
  });

  testUserId1 = user1.id;
  testUserId2 = user2.id;
  access_token_user1 = signToken({ id: user1.id });
  access_token_user2 = signToken({ id: user2.id });

  // Create test posts
  const post1 = await Post.create({
    title: "AI Revolution in 2025",
    description: "How artificial intelligence is changing the world in 2025",
    summary: "AI is transforming industries",
    votes: 5,
    categories: ["AI", "Technology"],
    userId: testUserId1,
  });

  await Post.create({
    title: "Web Development Trends",
    description: "Latest trends in web development and frameworks",
    summary: "Modern web development practices",
    votes: 3,
    categories: ["Web", "Development"],
    userId: testUserId2,
  });

  testPostId = post1.id;
}, 30000);

afterAll(async () => {
  console.log("AfterAll -> Cleaning up test database");

  // Clean up database
  await teardownTestDB();

  // Close database connection
  await sequelize.close();
}, 30000);

// Basic health check test
test("GET / should return API running message", async () => {
  const response = await request(app).get("/");

  expect(response.status).toBe(200);
  expect(response.text).toBe("WarTek API Running 🚀");
});

// ===== USER ROUTES TESTS =====
describe("User Routes", () => {
  describe("POST /users/register", () => {
    test("Successfully register a new user", async () => {
      const newUser = {
        username: "newuser",
        email: "newuser@test.com",
        password: "password123",
      };

      const response = await request(app).post("/users/register").send(newUser);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id", expect.any(Number));
      expect(response.body).toHaveProperty(
        "message",
        "User registered successfully"
      );
      expect(response.body).toHaveProperty("email", newUser.email);
      expect(response.body).not.toHaveProperty("password");
    });

    test("Fail to register - missing username", async () => {
      const newUser = {
        email: "test@test.com",
        password: "password123",
      };

      const response = await request(app).post("/users/register").send(newUser);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message", "username is required");
    });

    test("Fail to register - missing email", async () => {
      const newUser = {
        username: "testuser",
        password: "password123",
      };

      const response = await request(app).post("/users/register").send(newUser);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message", "email is required");
    });

    test("Fail to register - missing password", async () => {
      const newUser = {
        username: "testuser",
        email: "test@test.com",
      };

      const response = await request(app).post("/users/register").send(newUser);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message", "password is required");
    });

    test("Fail to register - invalid email format", async () => {
      const newUser = {
        username: "testuser",
        email: "invalid-email",
        password: "password123",
      };

      const response = await request(app).post("/users/register").send(newUser);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message", "Email format is wrong");
    });

    test("Fail to register - password too short", async () => {
      const newUser = {
        username: "testuser",
        email: "test@test.com",
        password: "123",
      };

      const response = await request(app).post("/users/register").send(newUser);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "message",
        "Password must be at least 8 characters"
      );
    });

    test("Fail to register - duplicate email", async () => {
      const duplicateUser = {
        username: "testuser",
        email: "testuser1@wartek.com", // Already exists in test data
        password: "password123",
      };

      const response = await request(app)
        .post("/users/register")
        .send(duplicateUser);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message", "Email already exists");
    });
  });

  describe("POST /users/login", () => {
    test("Successfully login with valid credentials", async () => {
      const loginData = {
        emailOrUsername: "testuser1@wartek.com",
        password: "password123",
      };

      const response = await request(app).post("/users/login").send(loginData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("access_token", expect.any(String));
      expect(response.body).toHaveProperty("user");
      expect(response.body.user).toHaveProperty("username", "testuser1");
      expect(response.body.user).toHaveProperty(
        "email",
        "testuser1@wartek.com"
      );
    });

    test("Fail to login - invalid email", async () => {
      const loginData = {
        emailOrUsername: "nonexistent@test.com",
        password: "password123",
      };

      const response = await request(app).post("/users/login").send(loginData);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty(
        "message",
        "Invalid email/username or password"
      );
    });

    test("Fail to login - invalid password", async () => {
      const loginData = {
        emailOrUsername: "testuser1@wartek.com",
        password: "wrongpassword",
      };

      const response = await request(app).post("/users/login").send(loginData);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty(
        "message",
        "Invalid email/username or password"
      );
    });

    test("Fail to login - missing emailOrUsername", async () => {
      const loginData = {
        password: "password123",
      };

      const response = await request(app).post("/users/login").send(loginData);

      expect(response.status).toBe(500); // Will be handled by error handler
    });

    test("Fail to login - missing password", async () => {
      const loginData = {
        emailOrUsername: "testuser1@wartek.com",
      };

      const response = await request(app).post("/users/login").send(loginData);

      expect(response.status).toBe(500); // Will be handled by error handler
    });
  });
});

// ===== POST ROUTES TESTS =====
describe("Post Routes", () => {
  describe("GET /posts", () => {
    test("Successfully get all posts", async () => {
      const response = await request(app).get("/posts");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();

      if (response.body.length > 0) {
        const post = response.body[0];
        expect(post).toHaveProperty("id", expect.any(Number));
        expect(post).toHaveProperty("title", expect.any(String));
        expect(post).toHaveProperty("description", expect.any(String));
        expect(post).toHaveProperty("votes", expect.any(Number));
        expect(post).toHaveProperty("User");
      }
    });
  });

  describe("GET /posts/categories", () => {
    test("Successfully get available categories", async () => {
      const response = await request(app).get("/posts/categories");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("categories");
      expect(Array.isArray(response.body.categories)).toBeTruthy();
    });
  });

  describe("GET /posts/:id", () => {
    test("Successfully get post by ID", async () => {
      const response = await request(app).get(`/posts/${testPostId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("id", testPostId);
      expect(response.body).toHaveProperty("title", expect.any(String));
      expect(response.body).toHaveProperty("description", expect.any(String));
      expect(response.body).toHaveProperty("User");
    });

    test("Fail to get post - post not found", async () => {
      const response = await request(app).get("/posts/99999");

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty(
        "message",
        "Post id 99999 not found"
      );
    });
  });

  describe("POST /posts", () => {
    test("Successfully create a new post", async () => {
      const newPost = {
        title: "New Tech Innovation",
        description: "A detailed description of new tech innovation",
      };

      const response = await request(app)
        .post("/posts")
        .send(newPost)
        .set("Authorization", `Bearer ${access_token_user1}`);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id", expect.any(Number));
      expect(response.body).toHaveProperty("title", newPost.title);
      expect(response.body).toHaveProperty("description", newPost.description);
      expect(response.body).toHaveProperty("userId", testUserId1);
    });

    test("Fail to create post - not authenticated", async () => {
      const newPost = {
        title: "Test Post",
        description: "Test description",
      };

      const response = await request(app).post("/posts").send(newPost);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message", "Invalid token");
    });

    test("Fail to create post - invalid token", async () => {
      const newPost = {
        title: "Test Post",
        description: "Test description",
      };

      const response = await request(app)
        .post("/posts")
        .send(newPost)
        .set("Authorization", "Bearer invalid_token");

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message", "Invalid token");
    });

    test("Fail to create post - missing title", async () => {
      const newPost = {
        description: "Test description",
      };

      const response = await request(app)
        .post("/posts")
        .send(newPost)
        .set("Authorization", `Bearer ${access_token_user1}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message", "title is required");
    });

    test("Fail to create post - missing description", async () => {
      const newPost = {
        title: "Test Title",
      };

      const response = await request(app)
        .post("/posts")
        .send(newPost)
        .set("Authorization", `Bearer ${access_token_user1}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "message",
        "description is required"
      );
    });
  });

  describe("PUT /posts/:id", () => {
    test("Successfully update own post", async () => {
      const updateData = {
        title: "Updated AI Revolution",
        description: "Updated description for AI revolution",
      };

      const response = await request(app)
        .put(`/posts/${testPostId}`)
        .send(updateData)
        .set("Authorization", `Bearer ${access_token_user1}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("title", updateData.title);
      expect(response.body).toHaveProperty(
        "description",
        updateData.description
      );
    });

    test("Fail to update post - not authorized (different user)", async () => {
      const updateData = {
        title: "Unauthorized Update",
        description: "This should fail",
      };

      const response = await request(app)
        .put(`/posts/${testPostId}`)
        .send(updateData)
        .set("Authorization", `Bearer ${access_token_user2}`);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty("message", "Not your post!");
    });

    test("Fail to update post - not authenticated", async () => {
      const updateData = {
        title: "Test Update",
        description: "Test description",
      };

      const response = await request(app)
        .put(`/posts/${testPostId}`)
        .send(updateData);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message", "Invalid token");
    });

    test("Fail to update post - post not found", async () => {
      const updateData = {
        title: "Test Update",
        description: "Test description",
      };

      const response = await request(app)
        .put("/posts/99999")
        .send(updateData)
        .set("Authorization", `Bearer ${access_token_user1}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty(
        "message",
        "Post id 99999 not found"
      );
    });
  });

  describe("DELETE /posts/:id", () => {
    test("Fail to delete post - not authorized (different user)", async () => {
      const response = await request(app)
        .delete(`/posts/${testPostId}`)
        .set("Authorization", `Bearer ${access_token_user2}`);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty("message", "Not your post!");
    });

    test("Fail to delete post - not authenticated", async () => {
      const response = await request(app).delete(`/posts/${testPostId}`);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message", "Invalid token");
    });

    test("Fail to delete post - post not found", async () => {
      const response = await request(app)
        .delete("/posts/99999")
        .set("Authorization", `Bearer ${access_token_user1}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty(
        "message",
        "Post id 99999 not found"
      );
    });

    test("Successfully delete own post", async () => {
      const response = await request(app)
        .delete(`/posts/${testPostId}`)
        .set("Authorization", `Bearer ${access_token_user1}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        "message",
        "Post deleted successfully"
      );
    });
  });

  describe("POST /posts/:id/vote", () => {
    test("Successfully vote on a post", async () => {
      // First, get a post to vote on
      const postsResponse = await request(app).get("/posts");
      const availablePost = postsResponse.body.find(
        (post) => post.id !== testPostId
      );

      if (availablePost) {
        const voteData = { voteType: "up" };

        const response = await request(app)
          .post(`/posts/${availablePost.id}/vote`)
          .send(voteData)
          .set("Authorization", `Bearer ${access_token_user1}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("id", availablePost.id);
        expect(response.body).toHaveProperty("votes", expect.any(Number));
        expect(response.body).toHaveProperty("upvotes", expect.any(Number));
        expect(response.body).toHaveProperty("downvotes", expect.any(Number));
      }
    });

    test("Fail to vote - not authenticated", async () => {
      const voteData = { voteType: "upvote" };

      const response = await request(app).post("/posts/1/vote").send(voteData);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message", "Invalid token");
    });
  });
});

// ===== NEWS ROUTES TESTS =====
describe("News Routes", () => {
  describe("GET /news/headlines", () => {
    test("Successfully get news headlines", async () => {
      const response = await request(app).get("/news/headlines");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("articles");
      expect(Array.isArray(response.body.articles)).toBeTruthy();
    }, 15000);

    test("Successfully get headlines with category filter", async () => {
      const response = await request(app).get(
        "/news/headlines?category=technology&count=5"
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("articles");
      expect(Array.isArray(response.body.articles)).toBeTruthy();
    }, 15000);
  });

  describe("GET /news/category/:categoryName", () => {
    test("Successfully get articles by category", async () => {
      const response = await request(app).get("/news/category/technology");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("articles");
      expect(Array.isArray(response.body.articles)).toBeTruthy();
    }, 15000);

    test("Successfully get articles with query parameters", async () => {
      const response = await request(app).get(
        "/news/category/technology?count=10&page=1"
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("articles");
      expect(Array.isArray(response.body.articles)).toBeTruthy();
    }, 15000);
  });

  describe("GET /news/search", () => {
    test("Successfully search articles", async () => {
      const response = await request(app).get(
        "/news/search?q=artificial intelligence"
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("articles");
      expect(Array.isArray(response.body.articles)).toBeTruthy();
    }, 15000);

    test("Fail to search - missing query parameter", async () => {
      const response = await request(app).get("/news/search");

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "error",
        "Search query (q) parameter is required"
      );
    });

    test("Successfully search with multiple keywords", async () => {
      const response = await request(app).get(
        "/news/search?q=AI,machine learning&count=5"
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("articles");
      expect(Array.isArray(response.body.articles)).toBeTruthy();
    }, 15000);
  });

  describe("GET /news/categories", () => {
    test("Successfully get available categories", async () => {
      const response = await request(app).get("/news/categories");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("categories");
      expect(Array.isArray(response.body.categories)).toBeTruthy();
    });
  });
});
