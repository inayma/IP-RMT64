const express = require('express');
const app = express();
const port = 3000;

const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const errorHandler = require('./middlewares/errorHandler');

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Routes
app.use('/users', userRoutes);
app.use('/posts', postRoutes);

app.get('/', (req, res) => {
  res.send('WarTek API Running 🚀');
});

// Global error handler
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Running on port ${port}`);
});

module.exports = app;
