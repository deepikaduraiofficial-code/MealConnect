import express from 'express';
import {
  createPaymentOrder,
  verifyPayment,
  getPaymentHistory
} from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/create-order', createPaymentOrder);
router.post('/verify', verifyPayment);
router.get('/', getPaymentHistory);

export default router;
