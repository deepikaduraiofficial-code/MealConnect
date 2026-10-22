import express from 'express';
import {
  getAdminStats,
  toggleHotelVerification,
  toggleTrustVerification,
  getExpiredListings,
  generateSummaryReport
} from '../controllers/adminController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorizeRoles('admin'));

router.get('/dashboard', getAdminStats);
router.get('/stats', getAdminStats);
router.get('/expired-listings', getExpiredListings);
router.get('/report', generateSummaryReport);
router.put('/hotels/:id/verify', toggleHotelVerification);
router.put('/trusts/:id/verify', toggleTrustVerification);

export default router;
