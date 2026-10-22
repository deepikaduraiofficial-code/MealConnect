/**
 * Calculate dynamic shelf-life and countdown status for food items
 */
export const calculateFoodStatus = (preparedTime, bestBeforeTime, isCollected = false) => {
  if (isCollected) {
    return {
      status: 'Collected',
      badgeColor: 'emerald',
      isExpired: false,
      isExpiringSoon: false,
      timeLeftFormatted: 'Handed Over'
    };
  }

  const now = new Date();
  const exp = new Date(bestBeforeTime);
  const diffMs = exp.getTime() - now.getTime();

  if (diffMs <= 0) {
    const expiredMinutesAgo = Math.floor(Math.abs(diffMs) / (1000 * 60));
    return {
      status: 'Expired',
      badgeColor: 'rose',
      isExpired: true,
      isExpiringSoon: false,
      timeLeftFormatted: expiredMinutesAgo > 60
        ? `Expired ${Math.floor(expiredMinutesAgo / 60)}h ago`
        : `Expired ${expiredMinutesAgo}m ago`
    };
  }

  const hoursLeft = Math.floor(diffMs / (1000 * 60 * 60));
  const minutesLeft = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  const isExpiringSoon = diffMs <= 60 * 60 * 1000; // <= 1 hour

  return {
    status: isExpiringSoon ? 'Expiring Soon' : 'Available',
    badgeColor: isExpiringSoon ? 'amber' : 'emerald',
    isExpired: false,
    isExpiringSoon,
    timeLeftFormatted: hoursLeft > 0 ? `${hoursLeft}h ${minutesLeft}m left` : `${minutesLeft}m left`
  };
};

export const getDefaultExpiryHours = (category) => {
  switch (category) {
    case 'Breakfast':
      return 3;
    case 'Lunch & Main Course':
    case 'Cooked Meals':
    case 'Non-Vegetarian':
    case 'Combo Meals':
    case 'Rice & Breads':
      return 4;
    case 'Snacks':
      return 6;
    case 'Bakery':
      return 24;
    case 'Sweets & Desserts':
      return 12;
    case 'Drinks':
    case 'Beverages & Desserts':
      return 8;
    default:
      return 4;
  }
};
