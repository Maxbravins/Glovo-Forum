const express = require('express');
const {
  getPulseUpdates,
  createPulseUpdate,
  confirmPulseUpdate,
  getSavedPulseAreas,
  savePulseArea,
  removeSavedPulseArea,
} = require('../controllers/pulseController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();
router.get('/areas', authenticateToken, getSavedPulseAreas);
router.post('/areas', authenticateToken, savePulseArea);
router.delete('/areas/:id', authenticateToken, removeSavedPulseArea);
router.get('/', optionalAuth, getPulseUpdates);
router.post('/', authenticateToken, createPulseUpdate);
router.post('/:id/confirm', authenticateToken, confirmPulseUpdate);

module.exports = router;
