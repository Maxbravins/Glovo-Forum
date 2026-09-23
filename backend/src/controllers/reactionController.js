const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function togglePostReaction(req, res) {
  try {
    const userId = req.user.id;
    const postId = Number(req.params.postId);
    const type = req.body.type || "LIKE";

    const existing = await prisma.reaction.findUnique({
      where: {
        userId_postId_type: {
          userId,
          postId,
          type,
        },
      },
    });

    if (existing) {
      await prisma.reaction.delete({
        where: { id: existing.id },
      });

      return res.json({
        reacted: false,
        type,
      });
    }

    await prisma.reaction.create({
      data: {
        userId,
        postId,
        type,
      },
    });

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true, title: true },
    });

    if (post && post.userId !== userId) {
      await prisma.notification.create({
        data: {
          type: "REACTION",
          title: "New reaction",
          message: `Someone reacted to your post "${post.title}"`,
          recipientId: post.userId,
          senderId: userId,
          postId,
        },
      });
    }

    return res.json({
      reacted: true,
      type,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Unable to update reaction",
    });
  }
}

async function toggleCommentReaction(req, res) {
  try {
    const userId = req.user.id;
    const commentId = Number(req.params.commentId);
    const type = req.body.type || "LIKE";

    const existing = await prisma.reaction.findUnique({
      where: {
        userId_commentId_type: {
          userId,
          commentId,
          type,
        },
      },
    });

    if (existing) {
      await prisma.reaction.delete({
        where: { id: existing.id },
      });

      return res.json({
        reacted: false,
        type,
      });
    }

    await prisma.reaction.create({
      data: {
        userId,
        commentId,
        type,
      },
    });

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: {
        userId: true,
        postId: true,
      },
    });

    if (comment && comment.userId !== userId) {
      await prisma.notification.create({
        data: {
          type: "REACTION",
          title: "Someone reacted to your comment",
          message: "Your comment received a reaction.",
          recipientId: comment.userId,
          senderId: userId,
          postId: comment.postId,
          commentId,
        },
      });
    }

    return res.json({
      reacted: true,
      type,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Unable to update reaction",
    });
  }
}

module.exports = {
  togglePostReaction,
  toggleCommentReaction,
};
