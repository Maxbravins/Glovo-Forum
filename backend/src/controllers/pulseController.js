const { prisma } = require('../config/db');

const pulseTypes = new Set(['DELAY', 'ROAD_CLOSURE', 'BUSY_AREA', 'APP_ISSUE', 'LOCAL_TIP', 'SAFETY_NOTICE']);
const allowedDurations = new Set([1, 4, 12]);
const normalizeAreaKey = (area) => area.trim().replace(/\s+/g, ' ').toLocaleLowerCase();

const getPulseUpdates = async (req, res) => {
  try {
    const now = new Date();
    const updates = await prisma.pulseUpdate.findMany({
      where: { expiresAt: { gt: now } },
      orderBy: [{ createdAt: 'desc' }],
      take: 100,
      include: {
        user: { select: { id: true, username: true, role: true, avatar: true } },
        _count: { select: { confirmations: true } },
        ...(req.user ? { confirmations: { where: { userId: req.user.id }, select: { id: true } } } : {}),
      },
    });
    return res.json(updates.map((update) => ({
      id: update.id,
      type: update.type,
      area: update.area,
      content: update.content,
      areaKey: update.areaKey,
      expiresAt: update.expiresAt,
      createdAt: update.createdAt,
      author: update.user,
      confirmationCount: update._count.confirmations,
      isConfirmed: Boolean(update.confirmations?.length),
    })));
  } catch (error) {
    console.error('Error loading Community Pulse:', error);
    return res.status(500).json({ message: 'Unable to load Community Pulse' });
  }
};

const createPulseUpdate = async (req, res) => {
  const { type, area, content } = req.body;
  const durationHours = Number(req.body.durationHours);
  const cleanArea = typeof area === 'string' ? area.trim() : '';
  const cleanContent = typeof content === 'string' ? content.trim() : '';

  if (!pulseTypes.has(type)) return res.status(400).json({ message: 'Choose a valid update type' });
  if (cleanArea.length < 2 || cleanArea.length > 80) return res.status(400).json({ message: 'Area must be between 2 and 80 characters' });
  if (cleanContent.length < 8 || cleanContent.length > 500) return res.status(400).json({ message: 'Update must be between 8 and 500 characters' });
  if (!allowedDurations.has(durationHours)) return res.status(400).json({ message: 'Choose an expiry of 1, 4, or 12 hours' });

  try {
    const update = await prisma.pulseUpdate.create({
      data: {
        type,
        area: cleanArea,
        areaKey: normalizeAreaKey(cleanArea),
        content: cleanContent,
        userId: req.user.id,
        expiresAt: new Date(Date.now() + durationHours * 60 * 60 * 1000),
      },
      include: { user: { select: { id: true, username: true, role: true, avatar: true } } },
    });
    if (type === 'SAFETY_NOTICE') {
      try {
        const subscribers = await prisma.savedPulseArea.findMany({
          where: { areaKey: update.areaKey, userId: { not: req.user.id }, user: { is: { status: 'ACTIVE' } } },
          select: { userId: true },
        });
        if (subscribers.length) {
          await prisma.notification.createMany({
            data: subscribers.map(({ userId }) => ({
              type: 'SAFETY_NOTICE',
              title: `Safety notice in ${cleanArea}`,
              message: cleanContent.slice(0, 180),
              recipientId: userId,
              senderId: req.user.id,
              pulseUpdateId: update.id,
            })),
          });
        }
      } catch (notificationError) {
        console.error('Unable to notify saved-area members:', notificationError);
      }
    }
    return res.status(201).json({
      id: update.id,
      type: update.type,
      area: update.area,
      content: update.content,
      areaKey: update.areaKey,
      expiresAt: update.expiresAt,
      createdAt: update.createdAt,
      author: update.user,
      confirmationCount: 0,
      isConfirmed: false,
    });
  } catch (error) {
    console.error('Error creating Community Pulse update:', error);
    return res.status(500).json({ message: 'Unable to publish this update' });
  }
};

const confirmPulseUpdate = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ message: 'Invalid update ID' });

  try {
    const update = await prisma.pulseUpdate.findFirst({ where: { id, expiresAt: { gt: new Date() } }, select: { id: true } });
    if (!update) return res.status(404).json({ message: 'This update has expired or no longer exists' });

    await prisma.pulseConfirmation.upsert({
      where: { userId_pulseUpdateId: { userId: req.user.id, pulseUpdateId: id } },
      create: { userId: req.user.id, pulseUpdateId: id },
      update: {},
    });
    const confirmationCount = await prisma.pulseConfirmation.count({ where: { pulseUpdateId: id } });
    return res.json({ confirmed: true, confirmationCount });
  } catch (error) {
    console.error('Error confirming Community Pulse update:', error);
    return res.status(500).json({ message: 'Unable to confirm this update' });
  }
};

const getSavedPulseAreas = async (req, res) => {
  try {
    const areas = await prisma.savedPulseArea.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: 'asc' } });
    return res.json(areas);
  } catch (error) {
    console.error('Error loading saved Pulse areas:', error);
    return res.status(500).json({ message: 'Unable to load saved areas' });
  }
};

const savePulseArea = async (req, res) => {
  const area = typeof req.body.area === 'string' ? req.body.area.trim().replace(/\s+/g, ' ') : '';
  if (area.length < 2 || area.length > 80) return res.status(400).json({ message: 'Area must be between 2 and 80 characters' });
  const areaKey = normalizeAreaKey(area);

  try {
    const existing = await prisma.savedPulseArea.findUnique({ where: { userId_areaKey: { userId: req.user.id, areaKey } } });
    if (existing) return res.json(existing);
    const count = await prisma.savedPulseArea.count({ where: { userId: req.user.id } });
    if (count >= 5) return res.status(400).json({ message: 'You can save up to 5 areas' });
    const savedArea = await prisma.savedPulseArea.create({ data: { userId: req.user.id, area, areaKey } });
    return res.status(201).json(savedArea);
  } catch (error) {
    console.error('Error saving Pulse area:', error);
    return res.status(500).json({ message: 'Unable to save this area' });
  }
};

const removeSavedPulseArea = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ message: 'Invalid saved area ID' });
  try {
    const result = await prisma.savedPulseArea.deleteMany({ where: { id, userId: req.user.id } });
    if (!result.count) return res.status(404).json({ message: 'Saved area not found' });
    return res.json({ message: 'Saved area removed' });
  } catch (error) {
    console.error('Error removing saved Pulse area:', error);
    return res.status(500).json({ message: 'Unable to remove this area' });
  }
};

module.exports = {
  getPulseUpdates,
  createPulseUpdate,
  confirmPulseUpdate,
  getSavedPulseAreas,
  savePulseArea,
  removeSavedPulseArea,
};
