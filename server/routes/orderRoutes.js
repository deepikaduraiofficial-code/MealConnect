import express from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  verifyPickup
} from '../controllers/orderController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All order actions require authentication

// Create order
router.post('/', createOrder);

// Get user orders (filtered by role)
router.get('/', getOrders);

// Pickup verification via QR Code or PIN (Hotels or Admin)
router.post('/verify-pickup', authorizeRoles('hotel', 'admin'), verifyPickup);

// Get single order
router.get('/:id', getOrderById);

// Advance order status (Hotels or Admin)
router.put('/:id/status', authorizeRoles('hotel', 'admin'), updateOrderStatus);

export default router;
