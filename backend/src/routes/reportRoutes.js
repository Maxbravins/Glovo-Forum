const express = require('express');
const { createReport, getPendingReports, updateReportStatus } = require('../controllers/reportController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticateToken, createReport);
router.get('/', authenticateToken, requireAdmin, getPendingReports);
router.patch('/:id/status', authenticateToken, requireAdmin, updateReportStatus);

module.exports = router;
