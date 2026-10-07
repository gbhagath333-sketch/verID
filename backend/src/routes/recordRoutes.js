const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const {
  healthCheck,
  registerRecord,
  verifyRecord,
  getRecord
} = require('../controllers/recordController');

// Health endpoint
router.get('/health', healthCheck);

// Register API
router.post('/register', upload.single('file'), registerRecord);

// Verify API
router.post('/verify', upload.single('file'), verifyRecord);

// Get Record API
router.get('/record/:recordId', getRecord);

module.exports = router;
