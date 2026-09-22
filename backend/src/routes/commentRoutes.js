const express = require('express');
const { getCommentsByPostId, createComment, deleteComment } = require('../controllers/commentController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const router = express.Router();

router.get('/post/:postId', optionalAuth, getCommentsByPostId);
router.post('/', authenticateToken, upload.single('photo'), createComment);
router.delete('/:id', authenticateToken, deleteComment);

module.exports = router;
