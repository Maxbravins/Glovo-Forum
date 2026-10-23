const { prisma } = require('../config/db');

const notifyMentionedUsers = async ({ senderId, text, postId, commentId = null }) => {
  const usernames = [...new Set(
    [...String(text || '').matchAll(/(^|[^\w])@([\w.-]+)/g)].map((match) => match[2])
  )];
  if (!usernames.length) return;

  const recipients = await prisma.user.findMany({
    where: { username: { in: usernames }, status: 'ACTIVE', id: { not: senderId } },
    select: { id: true, username: true },
  });
  if (!recipients.length) return;

  await prisma.$transaction(recipients.flatMap((recipient) => [
    prisma.mention.create({ data: { senderId, recipientId: recipient.id, postId, commentId } }),
    prisma.notification.create({
      data: {
        type: 'MENTION',
        title: 'You were mentioned',
        message: `A community member mentioned you in ${commentId ? 'a comment' : 'a post'}.`,
        recipientId: recipient.id,
        senderId,
        postId,
        commentId,
      },
    }),
  ]));
};

module.exports = { notifyMentionedUsers };
