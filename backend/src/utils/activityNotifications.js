const { prisma } = require('../config/db');

const notifyUser = async ({ recipientId, senderId, type, title, message, postId, commentId }) => {
  if (!recipientId || recipientId === senderId) return;
  try {
    await prisma.notification.create({
      data: { recipientId, senderId, type, title, message, postId, commentId },
    });
  } catch (error) {
    // Activity should still succeed if the notification cannot be recorded.
    console.error('Unable to create activity notification:', error);
  }
};

const notifyCommentActivity = async ({ senderId, postId, commentId, postAuthorId, parentCommentAuthorId }) => {
  if (parentCommentAuthorId) {
    await notifyUser({
      recipientId: parentCommentAuthorId,
      senderId,
      type: 'REPLY',
      title: 'New reply to your comment',
      message: 'A community member replied to your comment.',
      postId,
      commentId,
    });
  }

  if (postAuthorId !== parentCommentAuthorId) {
    await notifyUser({
      recipientId: postAuthorId,
      senderId,
      type: 'COMMENT',
      title: 'New comment on your post',
      message: 'A community member commented on your post.',
      postId,
      commentId,
    });
  }
};

module.exports = { notifyUser, notifyCommentActivity };
