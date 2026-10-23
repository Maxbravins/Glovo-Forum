const { prisma } = require('../config/db');

const getNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { recipientId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 30,
      include: { sender: { select: { id: true, username: true, avatar: true } } },
    });
    return res.json(notifications);
  } catch (error) {
    console.error('Error loading notifications:', error);
    return res.status(500).json({ message: 'Unable to load notifications' });
  }
};

const markNotificationRead = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ message: 'Invalid notification ID' });
  try {
    const result = await prisma.notification.updateMany({
      where: { id, recipientId: req.user.id },
      data: { read: true },
    });
    if (!result.count) return res.status(404).json({ message: 'Notification not found' });
    return res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error updating notification:', error);
    return res.status(500).json({ message: 'Unable to update notification' });
  }
};

module.exports = { getNotifications, markNotificationRead };
