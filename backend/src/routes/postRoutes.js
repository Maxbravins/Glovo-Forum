const express = require('express');
const { getPosts, getPostById, createPost, deletePost, togglePinPost } = require('../controllers/postController');
const { authenticateToken, optionalAuth, requireAdmin } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const router = express.Router();

router.get('/', optionalAuth, getPosts);
router.get('/:id', optionalAuth, getPostById);
router.post('/', authenticateToken, upload.single('photo'), createPost);
router.delete('/:id', authenticateToken, deletePost);
router.patch('/:id/pin', authenticateToken, requireAdmin, togglePinPost);

module.exports = router;
