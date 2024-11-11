require('dotenv').config();

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const userRouter = require('./routes/user');
const blogRouter = require('./routes/blog');
const cookieParser = require('cookie-parser');
const { checkForAuthentication } = require('./middleware/auth');
const path = require('path');
const Blog = require('./models/blog');

mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(checkForAuthentication('token'));
app.use(express.static(path.resolve('./public')));

const PORT = process.env.PORT || 8000;

app.set('view engine', 'ejs');
app.set('views', path.resolve('./views'));

app.get('/', async (req, res) => {
  try {
    const allBlogs = await Blog.find().exec();
    res.render('home', { user: req.user, blogs: allBlogs });
  } catch (err) {
    console.error('Error fetching blogs:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/logout', (req, res) => {
  res.clearCookie('token').redirect('/');
});

app.use('/user', userRouter);
app.use('/', blogRouter);

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
