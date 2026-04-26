// server/routes/executeRoutes.js
const express = require('express');
const router = express.Router();
const { executeCode } = require('../controllers/executeController');

// Ensure executeCode is imported as a function
router.post('/', executeCode);

module.exports = router;