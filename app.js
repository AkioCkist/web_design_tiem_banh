require('dotenv').config();

const express = require('express');
const session = require('express-session');
const fs = require('fs');
const path = require('path');
const routes = require('./routes');
const { mysqlPool, ensureCartTable } = require('./models/productModel');

const app = express();
const port = Number(process.env.PORT) || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
const slidesDirectory = path.join(__dirname, 'public', 'images', 'slide');
app.locals.slideImages = fs.readdirSync(slidesDirectory)
  .filter((file) => /\.(jpe?g|png|webp|gif)$/i.test(file))
  .sort((first, second) => first.localeCompare(second, undefined, { numeric: true }))
  .map((file) => `/images/slide/${encodeURIComponent(file)}`);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'ban-hang-development-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', routes);

async function connectDatabase() {
  try {
    await mysqlPool.query('SELECT 1');
    await ensureCartTable();
    console.log('MySQL connected');
  } catch (error) {
    console.warn(`MySQL unavailable: ${error.message}`);
  }
}

if (require.main === module) {
  connectDatabase().finally(() => {
    app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
  });
}

module.exports = app;
