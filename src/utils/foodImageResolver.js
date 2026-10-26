/**
 * Food Image Resolver for Meal Connect
 * Displays authentic food images ONLY when a valid image has been assigned or uploaded.
 * Never uses automatic placeholder banners, generic food stock fallbacks, or illustrations.
 * If an image is deleted or missing, returns an empty string ("") so the UI renders
 * a clean, empty image area.
 */

// Confirmed list of deleted / unwanted images
export const DELETED_IMAGES = new Set([
  'chicken_fried_rice.jpg',
  'vadai.jpg',
  'vegetable_pakoda.jpg',
  'kulfi.jpg',
  'pongal.jpg',
  'coconut_rice.jpg',
  'dosa.jpg',
  'parotta.jpg',
  'upma.jpg',
  'vediappam.jpg',
  'fish_curry.jpg',
  'badam_milk.jpg',
  'chicken_curry.jpg',
  'egg_biryani.jpg',
  'pani_puri.jpg',
  'jalebi.jpg',
  'egg_noodles.jpg',
  'chapati.jpg',
  'onion_samosa.jpg',
  'banana_bajji.jpg',
  'cutlet.jpg',
  'chicken_noodles.jpg',
  'steamed_idli_hot_sambar.jpg',
  'sundal.jpg',
  'vegetable_rice.jpg',
  'tomato_rice.jpg',
  'paneer_pakoda.jpg',
  'murukku.jpg',
  'watermelon_juice.jpg',
  'vegetable_samosa.jpg',
  'egg_fried_rice.jpg',
  'masala_puri.jpg',
  'veg_biryani.jpg',
  'veg_burger.jpg',
  'rasgulla.jpg',
  'tender_coconut.jpg',
  'chicken_rice.jpg',
  'poha.jpg',
  'spring_roll.jpg',
  'onion_bajji.jpg',
  'potato_wedges.jpg',
  'chicken_biryani.jpg',
  'mysore_bonda.jpg',
  'fruit_salad.jpg',
  'ghee_dosa.jpg',
  'mixture.jpg',
  'buttermilk.jpg'
]);

/**
 * Checks whether a given image URL or file path points to a deleted/unwanted image or placeholder.
 */
export function isDeletedImage(url = '') {
  if (!url || typeof url !== 'string') return true;
  const trimmed = url.trim().toLowerCase();
  if (trimmed === '' || trimmed.includes('placeholder') || trimmed.includes('fresh food listing')) {
    return true;
  }
  const fileName = trimmed.split('/').pop().split('?')[0].trim();
  return DELETED_IMAGES.has(fileName);
}

/**
 * Resolves a food item's image.
 * Returns the item's own valid assigned/uploaded image URL, or empty string ("") if missing or deleted.
 * Does not substitute unrelated food images, stock photos, or placeholder banners.
 */
export function getMatchingFoodImage(foodName = '', category = '', currentImage = '') {
  if (!currentImage || typeof currentImage !== 'string') {
    return "";
  }

  const trimmed = currentImage.trim();
  if (trimmed === '' || isDeletedImage(trimmed)) {
    return "";
  }

  return trimmed;
}

/**
 * Checks if a food item has a valid, authentic image (not empty and not deleted/placeholder).
 */
export function isValidFoodImage(url = '') {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed === '' || isDeletedImage(trimmed)) return false;
  return true;
}

