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

    const post = await prisma.post.create({
        data: {
          title,
          content,
          categoryId: Number(categoryId),
          userId: req.user.id,
          type: type || "DISCUSSION",
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
              role: true,
            },
          },
          category: true,
        },
      });

    const currentUserId = req.user?.id;

    const formattedPosts = await Promise.all(
      posts.map(async (post) => {
        let isLiked = false;

        if (currentUserId) {
          const existingLike = await prisma.like.findFirst({
            where: {
              postId: post.id,
              userId: currentUserId,
            },
          });

          isLiked = !!existingLike;
        }

        return {
          id: post.id,
          title: post.title,
          content: post.content,
          image: post.image,
          status: post.status,
          views: post.views,
          pinned: post.pinned,
          locked: post.locked,
          solved: post.solved,
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
    return res.status(500).json({
      message: 'Error fetching posts',
      error: error.message,
    });
  }
};

const getPostById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }

    const post = await prisma.post.update({
      where: { id },
      data: { views: { increment: 1 } },
      include: {
        category: true,
        user: {
          select: {
            id: true,
            username: true,
            role: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    const currentUserId = req.user?.id;
    let isLiked = false;

    if (currentUserId) {
      const existingLike = await prisma.like.findFirst({
        where: {
          postId: post.id,
          userId: currentUserId,
        },
      });

      isLiked = !!existingLike;
    }

    return res.json({
      ...post,
      author: post.user,
      commentCount: post._count.comments,
      likeCount: post._count.likes,
      isLiked,
    });
  } catch (error) {
    console.error('Error fetching post:', error);

    return res.status(404).json({
      message: 'Post not found',
      error: error.message,
    });
  }
};

const createPost = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { title, content, categoryId } = req.body;

    if (!title || !content || !categoryId) {
      return res.status(400).json({
        message: 'Title, content, and categoryId are required',
      });
    }

    const parsedCategoryId = parseInt(categoryId);

    if (isNaN(parsedCategoryId)) {
      return res.status(400).json({
        message: 'Invalid categoryId',
      });
    }

    const category = await prisma.category.findUnique({
      where: { id: parsedCategoryId },
    });

    if (!category) {
      return res.status(404).json({
        message: 'Category not found',
      });
    }

    let imagePath = null;

    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    const post = await prisma.post.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        image: imagePath,
        categoryId: parsedCategoryId,
        userId: req.user.id,
      },
      include: {
        category: true,
        user: {
          select: {
            id: true,
            username: true,
            role: true,
            avatar: true,
          },
        },
      },
    });

    return res.status(201).json({
      ...post,
      author: post.user,
      commentCount: 0,
      likeCount: 0,
      isLiked: false,
    });
  } catch (error) {
    console.error('Error creating post:', error);

    return res.status(500).json({
      message: 'Error creating post',
      error: error.message,
    });
  }
};

const updatePost = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }

    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      return res.status(404).json({
        message: 'Post not found',
      });
    }

    if (post.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        message: 'Forbidden: You cannot edit this post',
      });
    }

    const { title, content, categoryId } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: 'Title is required',
      });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({
        message: 'Content is required',
      });
    }

    const data = {
      title: title.trim(),
      content: content.trim(),
    };

    if (categoryId !== undefined && categoryId !== '') {
      const parsedCategoryId = parseInt(categoryId);

      if (isNaN(parsedCategoryId)) {
        return res.status(400).json({
          message: 'Invalid category ID',
        });
      }

      const category = await prisma.category.findUnique({
        where: { id: parsedCategoryId },
      });

      if (!category) {
        return res.status(404).json({
          message: 'Category not found',
        });
      }

      data.categoryId = parsedCategoryId;
    }

    if (req.file) {
      data.image = `/uploads/${req.file.filename}`;
    }

    const updatedPost = await prisma.post.update({
      where: { id },
      data,
      include: {
        category: true,
        user: {
          select: {
            id: true,
            username: true,
            role: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    return res.json({
      message: 'Post updated successfully',
      post: {
        ...updatedPost,
        author: updatedPost.user,
        commentCount: updatedPost._count.comments,
        likeCount: updatedPost._count.likes,
      },
    });
  } catch (error) {
    console.error('Error updating post:', error);

    return res.status(500).json({
      message: 'Error updating post',
      error: error.message,
    });
  }
};

const deletePost = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }

    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        message: 'Forbidden: You cannot delete this post',
      });
    }

    await prisma.post.delete({
      where: { id },
    });

    return res.json({
      message: 'Post deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting post:', error);

    return res.status(500).json({
      message: 'Error deleting post',
      error: error.message,
    });
  }
};

const togglePinPost = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({
        message: 'Admin access required',
      });
    }

    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        message: 'Invalid post ID',
      });
    }

    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      return res.status(404).json({
        message: 'Post not found',
      });
    }

    const updated = await prisma.post.update({
      where: { id },
      data: {
        pinned: !post.pinned,
      },
    });

    return res.json({
      message: `Post ${updated.pinned ? 'pinned' : 'unpinned'}`,
      post: updated,
    });
  } catch (error) {
    console.error('Error updating pin status:', error);

    return res.status(500).json({
      message: 'Error updating pin status',
      error: error.message,
    });
  }
};

module.exports = {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  togglePinPost,
};
