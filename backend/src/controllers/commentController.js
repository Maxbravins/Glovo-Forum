const { prisma } = require('../config/db');

const getCommentsByPostId = async (req, res) => {
  try {
    const postId = parseInt(req.params.postId);
    if (isNaN(postId)) return res.status(400).json({ message: 'Invalid post ID' });

    const comments = await prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: 'asc' },
      include: {
        user: {
          select: { id: true, username: true, role: true, avatar: true },
        },
        _count: {
          select: { likes: true },
        },
      },
    });

    const currentUserId = req.user?.id;

    const commentMap = new Map();

    comments.forEach((c) => {
      commentMap.set(c.id, {
        id: c.id,
        content: c.content,
        image: c.image,
        postId: c.postId,
        userId: c.userId,
        parentId: c.parentId,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        user: c.user,
        likeCount: c._count.likes,
        isLiked: false,
        replies: [],
      });
    });

    if (currentUserId) {
      const userLikes = await prisma.like.findMany({
        where: {
          userId: currentUserId,
          commentId: { in: comments.map((c) => c.id) },
        },
      });
      const likedCommentIds = new Set(userLikes.map((l) => l.commentId));

      commentMap.forEach((c) => {
        if (likedCommentIds.has(c.id)) {
          c.isLiked = true;
        }
      });
    }

    const rootComments = [];

    commentMap.forEach((comment) => {
      if (comment.parentId === null) {
        rootComments.push(comment);
      } else {
        const parent = commentMap.get(comment.parentId);
        if (parent) {
          parent.replies.push(comment);
        } else {
          rootComments.push(comment);
        }
      }
    });

    return res.json(rootComments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return res.status(500).json({ message: 'Error fetching comments', error: error.message });
  }
};

const createComment = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const { postId, content, parentId } = req.body;

    if (!postId || !content || !content.trim()) {
      return res.status(400).json({ message: 'Post ID and content are required' });
    }

    let imagePath = null;
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    const parsedPostId = parseInt(postId);
    const parsedParentId = parentId ? parseInt(parentId) : null;

    const post = await prisma.post.findUnique({ where: { id: parsedPostId } });
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (parsedParentId) {
      const parentComment = await prisma.comment.findUnique({ where: { id: parsedParentId } });
      if (!parentComment) return res.status(404).json({ message: 'Parent comment not found' });
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        image: imagePath,
        postId: parsedPostId,
        userId: req.user.id,
        parentId: parsedParentId,
      },
      include: {
        user: {
          select: { id: true, username: true, role: true, avatar: true },
        },
      },
    });

    return res.status(201).json({
      ...comment,
      likeCount: 0,
      isLiked: false,
      replies: [],
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    return res.status(500).json({ message: 'Error creating comment', error: error.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const id = parseInt(req.params.id);
    const comment = await prisma.comment.findUnique({ where: { id } });

    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (comment.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden: You cannot delete this comment' });
    }

    await prisma.comment.delete({ where: { id } });
    return res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting comment', error: error.message });
  }
};

module.exports = {
  getCommentsByPostId,
  createComment,
  deleteComment,
};
