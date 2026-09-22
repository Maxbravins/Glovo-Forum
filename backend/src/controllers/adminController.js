const { prisma } = require('../config/db');

const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalPosts = await prisma.post.count();
    const totalComments = await prisma.comment.count();
    const totalRiders = await prisma.user.count({ where: { role: 'RIDER' } });

    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, username: true, email: true, role: true, createdAt: true },
    });

    return res.json({
      totalUsers,
      totalPosts,
      totalComments,
      totalRiders,
      recentUsers,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, username: true, email: true, role: true, avatar: true, createdAt: true },
    });
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (id === req.user?.id) {
      return res.status(400).json({ message: 'You cannot delete your own admin account' });
    }

    await prisma.user.delete({ where: { id } });
    return res.json({ message: 'User deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { role } = req.body;

    if (!['USER', 'RIDER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, username: true, role: true },
    });

    return res.json({ message: 'User role updated', user: updated });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating user role', error: error.message });
  }
};

module.exports = {
  getAdminStats,
  getUsers,
  deleteUser,
  updateUserRole,
};
