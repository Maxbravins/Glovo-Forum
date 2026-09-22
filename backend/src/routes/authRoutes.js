const express = require('express');
const { register, login, getMe, updateAvatar } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateToken, getMe);
router.post('/avatar', authenticateToken, upload.single('photo'), updateAvatar);

module.exports = router;
