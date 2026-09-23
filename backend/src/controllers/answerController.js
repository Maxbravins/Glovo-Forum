const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function acceptAnswer(req, res) {
  try {
    const userId = req.user.id;
    const postId = Number(req.params.postId);
    const commentId = Number(req.params.commentId);

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        userId: true,
        type: true,
      },
    });

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    if (post.userId !== userId) {
      return res.status(403).json({
        message: "Only the post author can accept an answer",
      });
    }

    if (post.type !== "QUESTION") {
      return res.status(400).json({
        message: "Only question posts can have accepted answers",
      });
    }

    const comment = await prisma.comment.findFirst({
      where: {
        id: commentId,
        postId,
        status: "ACTIVE",
      },
    });

    if (!comment) {
      return res.status(404).json({
        message: "Answer not found",
      });
    }

    const updated = await prisma.post.update({
      where: { id: postId },
      data: {
        solved: true,
        acceptedAnswerId: commentId,
      },
      include: {
        acceptedAnswer: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (comment.userId !== userId) {
      await prisma.notification.create({
        data: {
          type: "ACCEPTED_ANSWER",
          title: "Your answer was accepted",
          message: "Your answer was marked as the accepted answer.",
          recipientId: comment.userId,
          senderId: userId,
          postId,
          commentId,
        },
      });

      await prisma.user.update({
        where: { id: comment.userId },
        data: {
          reputation: {
            increment: 10,
          },
        },
      });
    }

    return res.json(updated);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Unable to accept answer",
    });
  }
}

module.exports = {
  acceptAnswer,
};
