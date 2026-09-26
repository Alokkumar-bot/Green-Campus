import express from 'express';
import {
  getAdminReports,
  getAdminReportDetails,
  updateReportStatus,
  deleteReport
} from '../controllers/adminController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require auth and admin role
router.use(requireAuth, requireAdmin);

router.get('/reports', getAdminReports);
router.get('/reports/:id', getAdminReportDetails);
router.patch('/reports/:id/status', updateReportStatus);
router.delete('/reports/:id', deleteReport);

export default router;
