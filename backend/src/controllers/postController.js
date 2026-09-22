const { prisma } = require('../config/db');

const getPosts = async (req, res) => {
  try {
    const { category, search, sort } = req.query;

    const where = {};

    if (category) {
      where.category = { slug: String(category) };
    }

    if (search) {
      where.OR = [
        { title: { contains: String(search) } },
        { content: { contains: String(search) } },
      ];
    }

    let orderBy = [{ pinned: 'desc' }, { createdAt: 'desc' }];
    if (sort === 'popular') {
      orderBy = [{ views: 'desc' }, { createdAt: 'desc' }];
    }

    const posts = await prisma.post.findMany({
      where,
      orderBy,
      include: {
        category: true,
        user: {
          select: { id: true, username: true, role: true, avatar: true },
        },
        _count: {
          select: { comments: true, likes: true },
        },
      },
    });

    const currentUserId = req.user?.id;

    const formattedPosts = await Promise.all(
      posts.map(async (post) => {
        let isLiked = false;
        if (currentUserId) {
          const likeCount = await prisma.like.count({
            where: { postId: post.id, userId: currentUserId },
          });
          isLiked = likeCount > 0;
        }

        return {
          id: post.id,
          title: post.title,
          content: post.content,
          image: post.image,
          views: post.views,
          pinned: post.pinned,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
          category: post.category,
          author: post.user,
          commentCount: post._count.comments,
          likeCount: post._count.likes,
          isLiked,
        };
      })
    );

    return res.json(formattedPosts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return res.status(500).json({ message: 'Error fetching posts', error: error.message });
  }
};

const getPostById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid post ID' });

    const post = await prisma.post.update({
      where: { id },
      data: { views: { increment: 1 } },
      include: {
        category: true,
        user: {
          select: { id: true, username: true, role: true, avatar: true },
        },
        _count: {
          select: { comments: true, likes: true },
        },
      },
    });

    const currentUserId = req.user?.id;
    let isLiked = false;
    if (currentUserId) {
      const likeCount = await prisma.like.count({
        where: { postId: post.id, userId: currentUserId },
      });
      isLiked = likeCount > 0;
    }

    return res.json({
      ...post,
      author: post.user,
      commentCount: post._count.comments,
      likeCount: post._count.likes,
      isLiked,
    });
  } catch (error) {
    return res.status(404).json({ message: 'Post not found', error: error.message });
  }
};

const createPost = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const { title, content, categoryId } = req.body;
    if (!title || !content || !categoryId) {
      return res.status(400).json({ message: 'Title, content, and categoryId are required' });
    }

    let imagePath = null;
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    const post = await prisma.post.create({
      data: {
        title,
        content,
        image: imagePath,
        categoryId: parseInt(categoryId),
        userId: req.user.id,
      },
      include: {
        category: true,
        user: {
          select: { id: true, username: true, role: true, avatar: true },
        },
      },
    });

    return res.status(201).json({
      ...post,
      author: post.user,
    });
  } catch (error) {
    console.error('Error creating post:', error);
    return res.status(500).json({ message: 'Error creating post', error: error.message });
  }
};

const deletePost = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const id = parseInt(req.params.id);
    const post = await prisma.post.findUnique({ where: { id } });

    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden: You cannot delete this post' });
    }

    await prisma.post.delete({ where: { id } });
    return res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting post', error: error.message });
  }
};

const togglePinPost = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const id = parseInt(req.params.id);
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const updated = await prisma.post.update({
      where: { id },
      data: { pinned: !post.pinned },
    });

    return res.json({ message: `Post ${updated.pinned ? 'pinned' : 'unpinned'}`, post: updated });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating pin status', error: error.message });
  }
};

module.exports = {
  getPosts,
  getPostById,
  createPost,
  deletePost,
  togglePinPost,
};
