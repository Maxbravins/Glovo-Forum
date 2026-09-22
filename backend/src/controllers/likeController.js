const { prisma } = require('../config/db');

const toggleLike = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const { postId, commentId } = req.body;
    const userId = req.user.id;

    if (!postId && !commentId) {
      return res.status(400).json({ message: 'postId or commentId is required' });
    }

    const parsedPostId = postId ? parseInt(postId) : null;
    const parsedCommentId = commentId ? parseInt(commentId) : null;

    if (parsedPostId) {
      const existing = await prisma.like.findFirst({
        where: { userId, postId: parsedPostId },
      });

      if (existing) {
        await prisma.like.delete({ where: { id: existing.id } });
        const count = await prisma.like.count({ where: { postId: parsedPostId } });
        return res.json({ liked: false, likeCount: count });
      } else {
        await prisma.like.create({
          data: { userId, postId: parsedPostId },
        });
        const count = await prisma.like.count({ where: { postId: parsedPostId } });
        return res.json({ liked: true, likeCount: count });
      }
    }

    if (parsedCommentId) {
      const existing = await prisma.like.findFirst({
        where: { userId, commentId: parsedCommentId },
      });

      if (existing) {
        await prisma.like.delete({ where: { id: existing.id } });
        const count = await prisma.like.count({ where: { commentId: parsedCommentId } });
        return res.json({ liked: false, likeCount: count });
      } else {
        await prisma.like.create({
          data: { userId, commentId: parsedCommentId },
        });
        const count = await prisma.like.count({ where: { commentId: parsedCommentId } });
        return res.json({ liked: true, likeCount: count });
      }
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error toggling like', error: error.message });
  }
};

module.exports = { toggleLike };
