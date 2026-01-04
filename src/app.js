const express = require('express');
const cors = require('cors');

const app = express();

// ===== MIDDLEWARES =====
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  req.io = app.get('io');
  next();
});
app.use((req, res, next) => {
  console.log('➡️', req.method, req.originalUrl);
  next();
});

// ===== HEALTH CHECK =====
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});



// ===== ROUTES =====
const routes = require('./routes');
app.use('/api', routes);
app.use('/uploads', express.static('uploads'));
// ===== ERROR HANDLER =====
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

module.exports = app;
