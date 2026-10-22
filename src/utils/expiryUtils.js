/**
 * Expiry and Shelf Life Utilities for Meal Connect
 * Implements food safety standards with dynamic live countdown and category-based shelf lives.
 */

/**
 * Safely parses any date representation into a valid JavaScript Date object.
 * Correctly handles ISO strings, timestamps, and local datetime inputs (YYYY-MM-DDTHH:mm).
 */
export const safeParseDate = (val) => {
  if (!val) return null;
  if (val instanceof Date) {
    return isNaN(val.getTime()) ? null : val;
  }
  if (typeof val === 'number') {
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed) return null;

    // Matches datetime-local input string: YYYY-MM-DDTHH:mm or YYYY-MM-DDTHH:mm:ss (no timezone)
    const localMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/);
    if (localMatch) {
      const [, y, m, d, hr, min, sec] = localMatch;
      const localDate = new Date(Number(y), Number(m) - 1, Number(d), Number(hr), Number(min), Number(sec || 0));
      return isNaN(localDate.getTime()) ? null : localDate;
    }

    const parsed = new Date(trimmed);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
};

/**
 * Returns default shelf life in hours based on food category:
 * - Cooked rice and meals: 4 hours
 * - Idiyappam and other cooked breakfast items: 4 hours
 * - Snacks: 4 hours
 * - Sweets and desserts: 4 hours
 * - Tea and coffee: 2 hours
 */
export const getDefaultShelfLifeHours = (category = '') => {
  const cat = String(category).toLowerCase();
  if (cat.includes('tea') || cat.includes('coffee') || cat.includes('drink') || cat.includes('beverage')) {
    return 2;
  }
  // Cooked meals, rice, breakfast, snacks, sweets, bakery: 4 hours
  return 4;
};

/**
 * Calculates default preparation and best-before times based on food category.
 * If no preparation time is provided, defaults to current system time.
 */
export const getDefaultExpiryTimes = (category = '', prepInput = null) => {
  const prep = safeParseDate(prepInput) || new Date();
  const hours = getDefaultShelfLifeHours(category);
  const expiry = new Date(prep.getTime() + hours * 3600 * 1000);
  return {
    preparedTime: prep.toISOString(),
    bestBeforeTime: expiry.toISOString(),
    preparedTimeLocal: toDateTimeLocal(prep),
    bestBeforeTimeLocal: toDateTimeLocal(expiry),
    shelfLifeHours: hours
  };
};

/**
 * Calculates dynamic food expiry status, remaining time, and shelf-life metrics.
 * 
 * Rules:
 * - Collected: Food has already been collected.
 * - Expired: Current time has reached or passed the best-before time.
 * - Expiring Soon: 1 hour or less remaining (0 < remaining <= 3600 seconds).
 * - Fresh: More than 1 hour remaining (> 3600 seconds).
 * 
 * @param {string|Date|number} preparedTime - Preparation time
 * @param {string|Date|number} bestBeforeTime - Expiry timestamp
 * @param {boolean} isCollected - Whether the food item has already been collected
 * @param {string} [category] - Optional food category for fallback calculation
 * @returns {object} Status metadata
 */
export const calculateFoodStatus = (preparedTime, bestBeforeTime, isCollected = false, category = '') => {
  if (isCollected) {
    return {
      status: 'Collected',
      label: 'Collected',
      statusClass: 'bg-blue-100 text-blue-800 border-blue-200',
      badgeClass: 'bg-blue-600 text-white',
      hoursLeft: 0,
      minutesLeft: 0,
      secondsLeft: 0,
      totalSecondsLeft: 0,
      isExpired: false,
      isExpiringSoon: false,
      isCollected: true,
      formattedCountdown: 'Collected',
      shelfLifePercentage: 100
    };
  }

  const nowMs = Date.now();
  
  // Safely parse timestamps
  let expiryDate = safeParseDate(bestBeforeTime);
  let prepDate = safeParseDate(preparedTime);

  // Fallback defaults if timestamps are missing or invalid
  if (!prepDate && !expiryDate) {
    prepDate = new Date(nowMs);
    const defaultHours = getDefaultShelfLifeHours(category);
    expiryDate = new Date(prepDate.getTime() + defaultHours * 3600 * 1000);
  } else if (!expiryDate && prepDate) {
    const defaultHours = getDefaultShelfLifeHours(category);
    expiryDate = new Date(prepDate.getTime() + defaultHours * 3600 * 1000);
  } else if (expiryDate && !prepDate) {
    const defaultHours = getDefaultShelfLifeHours(category);
    prepDate = new Date(expiryDate.getTime() - defaultHours * 3600 * 1000);
  }

  const expiryMs = expiryDate.getTime();
  const prepMs = prepDate.getTime();
  const diffMs = expiryMs - nowMs;
  const totalSecondsLeft = Math.floor(diffMs / 1000);

  // If current time has reached or passed best-before time: EXPIRED
  if (totalSecondsLeft <= 0) {
    return {
      status: 'Expired',
      label: 'Expired',
      statusClass: 'bg-rose-100 text-rose-800 border-rose-200',
      badgeClass: 'bg-rose-600 text-white',
      hoursLeft: 0,
      minutesLeft: 0,
      secondsLeft: 0,
      totalSecondsLeft: 0,
      isExpired: true,
      isExpiringSoon: false,
      isCollected: false,
      formattedCountdown: 'Expired',
      shelfLifePercentage: 0
    };
  }

  const hoursLeft = Math.floor(totalSecondsLeft / 3600);
  const minutesLeft = Math.floor((totalSecondsLeft % 3600) / 60);
  const secondsLeft = totalSecondsLeft % 60;

  // Total shelf life duration in ms
  const totalShelfDurationMs = Math.max(1, expiryMs - prepMs);
  const shelfLifePercentage = Math.min(100, Math.max(0, Math.round((diffMs / totalShelfDurationMs) * 100)));

  // Formatted live countdown string
  let formattedCountdown = '';
  if (hoursLeft > 0) {
    formattedCountdown = `${hoursLeft}h ${minutesLeft}m left`;
  } else if (minutesLeft > 0) {
    formattedCountdown = `${minutesLeft}m ${secondsLeft}s left`;
  } else {
    formattedCountdown = `${secondsLeft}s left`;
  }

  // Expiring Soon: 1 hour or less remaining (<= 3600 seconds)
  const isExpiringSoon = totalSecondsLeft <= 3600;

  if (isExpiringSoon) {
    return {
      status: 'Expiring Soon',
      label: 'Expiring Soon',
      statusClass: 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse',
      badgeClass: 'bg-amber-500 text-slate-950 font-extrabold',
      hoursLeft,
      minutesLeft,
      secondsLeft,
      totalSecondsLeft,
      isExpired: false,
      isExpiringSoon: true,
      isCollected: false,
      formattedCountdown,
      shelfLifePercentage
    };
  }

  // Fresh: More than 1 hour remaining
  return {
    status: 'Fresh',
    label: 'Fresh',
    statusClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    badgeClass: 'bg-emerald-600 text-white',
    hoursLeft,
    minutesLeft,
    secondsLeft,
    totalSecondsLeft,
    isExpired: false,
    isExpiringSoon: false,
    isCollected: false,
    formattedCountdown,
    shelfLifePercentage
  };
};

/**
 * Format a Date to local ISO string suitable for <input type="datetime-local"> (YYYY-MM-DDTHH:mm)
 */
export const toDateTimeLocal = (dateInput) => {
  const date = safeParseDate(dateInput) || new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/**
 * Formats a timestamp into human-readable AM/PM time (e.g. 11:30 AM)
 */
export const formatFoodTimeDisplay = (dateInput) => {
  const d = safeParseDate(dateInput);
  if (!d) return 'Recently prepared';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
};
