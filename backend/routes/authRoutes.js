import express from 'express';
import {
  registerHotel,
  loginHotel,
  registerTrust,
  loginTrust,
  loginAdmin,
  getMe,
  getAllHotels,
  getAllTrusts
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register-hotel', registerHotel);
router.post('/login-hotel', loginHotel);
router.post('/register-trust', registerTrust);
router.post('/login-trust', loginTrust);
router.post('/login-admin', loginAdmin); // No public registration endpoint for admin
router.get('/me', protect, getMe);
router.get('/hotels', getAllHotels);
router.get('/trusts', getAllTrusts);

export default router;
