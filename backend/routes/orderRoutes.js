import express from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  verifyPickup,
  cancelOrder
} from '../controllers/orderController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', createOrder);
router.get('/', getOrders);
router.post('/verify-pickup', authorizeRoles('hotel', 'admin'), verifyPickup);
router.get('/:id', getOrderById);
router.put('/:id/status', authorizeRoles('hotel', 'admin'), updateOrderStatus);
router.put('/:id/cancel', cancelOrder);

export default router;
