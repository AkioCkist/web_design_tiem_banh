require('dotenv').config();

const express = require('express');
const path = require('path');
const routes = require('./routes');
const { mysqlPool } = require('./models/productModel');

const app = express();
const port = Number(process.env.PORT) || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', routes);

async function connectDatabase() {
  try {
    await mysqlPool.query('SELECT 1');
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
