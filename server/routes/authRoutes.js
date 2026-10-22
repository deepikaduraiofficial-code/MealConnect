import express from 'express';
import {
  registerHotel,
  loginHotel,
  registerTrust,
  loginTrust,
  loginAdmin,
  getMe,
  getAllHotels,
  getAllTrusts,
  toggleHotelVerification,
  toggleTrustVerification
} from '../controllers/authController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Hotel Auth
router.post('/register-hotel', registerHotel);
router.post('/login-hotel', loginHotel);

// Trust Auth
router.post('/register-trust', registerTrust);
router.post('/login-trust', loginTrust);

// Admin Auth (Login only - no public registration endpoint!)
router.post('/login-admin', loginAdmin);

// Current user profile
router.get('/me', protect, getMe);

// Public listings of partners
router.get('/hotels', getAllHotels);
router.get('/trusts', getAllTrusts);

// Admin verification controls
router.put('/hotels/:id/verify', protect, authorizeRoles('admin'), toggleHotelVerification);
router.put('/trusts/:id/verify', protect, authorizeRoles('admin'), toggleTrustVerification);

export default router;
