const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function toggleUserFollow(req, res) {
  try {
    const followerId = req.user.id;
    const followingId = Number(req.params.userId);

    if (followerId === followingId) {
      return res.status(400).json({
        message: "You cannot follow yourself",
      });
    }

    const target = await prisma.user.findUnique({
      where: { id: followingId },
      select: { id: true, username: true },
    });

    if (!target) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const existing = await prisma.userFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (existing) {
      await prisma.userFollow.delete({
        where: { id: existing.id },
      });

      return res.json({
        following: false,
      });
    }

    await prisma.userFollow.create({
      data: {
        followerId,
        followingId,
      },
    });

    await prisma.notification.create({
      data: {
        type: "FOLLOW",
        title: "New follower",
        message: "Someone started following you.",
        recipientId: followingId,
        senderId: followerId,
      },
    });

    return res.json({
      following: true,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Unable to update follow status",
    });
  }
}

module.exports = {
  toggleUserFollow,
};
