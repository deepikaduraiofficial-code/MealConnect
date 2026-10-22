import express from 'express';
import {
  getFoodListings,
  getFoodItemById,
  getMyHotelFoodListings,
  createFoodItem,
  updateFoodItem,
  deleteFoodItem
} from '../controllers/foodController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public marketplace browsing
router.get('/', getFoodListings);

// Hotel food listings management
router.get('/my-listings', protect, authorizeRoles('hotel'), getMyHotelFoodListings);

// Single food item details
router.get('/:id', getFoodItemById);

// Add new listing (Hotels only)
router.post('/', protect, authorizeRoles('hotel'), createFoodItem);

// Update listing (Owning Hotel or Admin)
router.put('/:id', protect, authorizeRoles('hotel', 'admin'), updateFoodItem);

// Delete listing (Owning Hotel or Admin)
router.delete('/:id', protect, authorizeRoles('hotel', 'admin'), deleteFoodItem);

export default router;
