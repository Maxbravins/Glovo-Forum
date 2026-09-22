const express = require('express');
const { toggleLike } = require('../controllers/likeController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/toggle', authenticateToken, toggleLike);

module.exports = router;
