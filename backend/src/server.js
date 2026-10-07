require('dotenv').config();
const express = require('express');
const cors = require('cors');
const recordRoutes = require('./routes/recordRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for React frontend
app.use(cors());

// Body parser middlewares for JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount API routes under /api
app.use('/api', recordRoutes);

// 404 Handler for unknown API endpoints
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Central error handler
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`Health endpoint: http://localhost:${PORT}/api/health`);
});

module.exports = app;
