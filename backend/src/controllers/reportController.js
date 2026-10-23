const { prisma } = require('../config/db');

const allowedReasons = new Set([
  'SPAM',
  'HARASSMENT',
  'ABUSE',
  'MISINFORMATION',
  'FRAUD',
  'INAPPROPRIATE',
  'OTHER',
]);

const createReport = async (req, res) => {
  try {
    const { postId, commentId, pulseUpdateId, reason, description } = req.body;
    const hasPost = postId !== undefined && postId !== null && postId !== '';
    const hasComment = commentId !== undefined && commentId !== null && commentId !== '';
    const hasPulseUpdate = pulseUpdateId !== undefined && pulseUpdateId !== null && pulseUpdateId !== '';

    if ([hasPost, hasComment, hasPulseUpdate].filter(Boolean).length !== 1) {
      return res.status(400).json({ message: 'Report exactly one item of content' });
    }
    const targetId = Number(hasPost ? postId : hasComment ? commentId : pulseUpdateId);
    if (!Number.isInteger(targetId) || targetId < 1) {
      return res.status(400).json({ message: 'Invalid content ID' });
    }
    if (!allowedReasons.has(reason)) {
      return res.status(400).json({ message: 'Choose a valid report reason' });
    }
    if (description !== undefined && (typeof description !== 'string' || description.trim().length > 1000)) {
      return res.status(400).json({ message: 'Description must be 1,000 characters or fewer' });
    }

    const target = hasPost
      ? await prisma.post.findFirst({ where: { id: targetId, status: 'ACTIVE' }, select: { id: true, userId: true } })
      : hasComment
        ? await prisma.comment.findFirst({ where: { id: targetId, status: 'ACTIVE' }, select: { id: true, userId: true } })
        : await prisma.pulseUpdate.findFirst({ where: { id: targetId, expiresAt: { gt: new Date() } }, select: { id: true, userId: true } });
    if (!target) return res.status(404).json({ message: 'Content not found' });
    if (target.userId === req.user.id) return res.status(400).json({ message: 'You cannot report your own content' });

    const targetFields = hasPost ? { postId: target.id } : hasComment ? { commentId: target.id } : { pulseUpdateId: target.id };
    const existing = await prisma.report.findFirst({
      where: { userId: req.user.id, status: 'PENDING', ...targetFields },
      select: { id: true },
    });
    if (existing) return res.status(409).json({ message: 'You have already reported this content' });

    const report = await prisma.report.create({
      data: {
        userId: req.user.id,
        reason,
        description: description?.trim() || null,
        ...targetFields,
      },
    });
    return res.status(201).json({ message: 'Report sent to the moderation team', reportId: report.id });
  } catch (error) {
    console.error('Error creating report:', error);
    return res.status(500).json({ message: 'Unable to submit report' });
  }
};

const getPendingReports = async (_req, res) => {
  try {
    const reports = await prisma.report.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'asc' },
      include: {
        user: { select: { id: true, username: true } },
        post: { select: { id: true, title: true, content: true, user: { select: { username: true } } } },
        comment: { select: { id: true, content: true, post: { select: { id: true, title: true } }, user: { select: { username: true } } } },
        pulseUpdate: { select: { id: true, type: true, area: true, content: true, user: { select: { username: true } } } },
      },
    });
    return res.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    return res.status(500).json({ message: 'Unable to load reports' });
  }
};

const updateReportStatus = async (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body;
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ message: 'Invalid report ID' });
  if (!['REVIEWED', 'RESOLVED', 'DISMISSED'].includes(status)) {
    return res.status(400).json({ message: 'Choose a valid moderation outcome' });
  }

  try {
    const report = await prisma.report.update({
      where: { id },
      data: { status, reviewedBy: req.user.id, reviewedAt: new Date() },
    });
    return res.json({ message: 'Report updated', report });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'Report not found' });
    console.error('Error updating report:', error);
    return res.status(500).json({ message: 'Unable to update report' });
  }
};

module.exports = { createReport, getPendingReports, updateReportStatus };
