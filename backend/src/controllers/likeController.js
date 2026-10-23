const { prisma } = require('../config/db');
const { notifyUser } = require('../utils/activityNotifications');

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
        const post = await prisma.post.findUnique({ where: { id: parsedPostId }, select: { userId: true, title: true } });
        await prisma.like.create({
          data: { userId, postId: parsedPostId },
        });
        await notifyUser({
          recipientId: post?.userId,
          senderId: userId,
          type: 'LIKE',
          title: 'Someone liked your post',
          message: `A community member liked your post${post?.title ? `: ${post.title}` : ''}.`,
          postId: parsedPostId,
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
        const comment = await prisma.comment.findUnique({ where: { id: parsedCommentId }, select: { userId: true, postId: true } });
        await prisma.like.create({
          data: { userId, commentId: parsedCommentId },
        });
        await notifyUser({
          recipientId: comment?.userId,
          senderId: userId,
          type: 'LIKE',
          title: 'Someone liked your comment',
          message: 'A community member liked your comment.',
          postId: comment?.postId,
          commentId: parsedCommentId,
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
