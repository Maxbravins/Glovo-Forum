const { prisma } = require('../config/db');

const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });

    const formatted = categories.map((cat) => ({
      ...cat,
      postCount: cat._count.posts,
    }));

    return res.json(formatted);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
};

module.exports = { getCategories };
