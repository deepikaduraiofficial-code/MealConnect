import express from 'express';
import {
  getCart,
  addToCart,
  updateCartQuantity,
  removeFromCart,
  clearCart
} from '../controllers/cartController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All cart actions require authentication

router.get('/', getCart);
router.post('/add', addToCart);
router.put('/item/:foodId', updateCartQuantity);
router.delete('/item/:foodId', removeFromCart);
router.delete('/', clearCart);

export default router;
