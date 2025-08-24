require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const port = 3000;

const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const aiRoutes = require("./routes/ai");
const errorHandler = require("./middlewares/errorHandler");

app.set("view engine", "ejs");
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "http://localhost:3000",
    ], // Vite dev server and other origins
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Routes
app.use("/users", userRoutes);
app.use("/posts", postRoutes);
app.use("/ai", aiRoutes);

app.get("/", (req, res) => {
  res.send("WarTek API Running 🚀");
});

// Global error handler
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Running on port ${port}`);
});

module.exports = app;
