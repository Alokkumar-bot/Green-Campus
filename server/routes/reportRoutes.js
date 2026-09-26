import express from 'express';
import {
  createReport,
  getReports,
  getReportByCode,
  getMyReports,
  getLocations
} from '../controllers/reportController.js';
import { upload } from '../middleware/upload.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getReports);
router.get('/locations', getLocations);
router.get('/track/:code', getReportByCode);

// Authenticated user routes
router.get('/my/list', requireAuth, getMyReports);

// Create report (allows both authenticated or optional guest)
router.post('/', optionalAuth, (req, res, next) => {
  upload.single('photo')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message || 'File upload failed.' });
    }
    next();
  });
}, createReport);

export default router;
