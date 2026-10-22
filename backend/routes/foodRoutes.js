import express from 'express';
import {
  getFoodListings,
  getFoodItemById,
  getMyHotelFoodListings,
  createFoodItem,
  updateFoodItem,
  deleteFoodItem
} from '../controllers/foodController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getFoodListings);
router.get('/my-listings', protect, authorizeRoles('hotel'), getMyHotelFoodListings);
router.get('/:id', getFoodItemById);
router.post('/', protect, authorizeRoles('hotel'), createFoodItem);
router.put('/:id', protect, authorizeRoles('hotel', 'admin'), updateFoodItem);
router.delete('/:id', protect, authorizeRoles('hotel', 'admin'), deleteFoodItem);

export default router;
