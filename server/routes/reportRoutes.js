import express from 'express';
import {
  getAdminDashboardStats,
  generateReportData
} from '../controllers/reportController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Only authenticated Admins can access reports and system-wide analytics
router.use(protect);
router.use(authorizeRoles('admin'));

router.get('/dashboard', getAdminDashboardStats);
router.get('/generate', generateReportData);

export default router;
