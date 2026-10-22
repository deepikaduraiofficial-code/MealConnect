import QRCode from 'qrcode';

/**
 * Generates a high-resolution QR code Data URL for an order.
 * 
 * @param {object} orderData - The order details
 * @returns {Promise<string>} Base64 Data URL of the generated QR code
 */
export const generateOrderQRCode = async (orderData) => {
  try {
    const payload = JSON.stringify({
      orderId: orderData.id,
      pickupCode: orderData.pickupCode || `MC-${orderData.id.slice(-4)}`,
      hotelId: orderData.hotelId,
      hotelName: orderData.hotelName,
      trustName: orderData.trustName,
      foodName: orderData.foodName,
      quantity: `${orderData.quantity} ${orderData.unit || 'portions'}`,
      verified: false,
      timestamp: new Date().toISOString()
    });

    const qrDataUrl = await QRCode.toDataURL(payload, {
      width: 320,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'H'
    });

    return qrDataUrl;
  } catch (err) {
    console.error('Error generating QR code:', err);
    // Fallback simple SVG or canvas if error
    return '';
  }
};

/**
 * Generate a clean 6-digit alphanumeric pickup PIN
 */
export const generatePickupPin = (orderId = '') => {
  const digits = (orderId.replace(/[^0-9]/g, '') + '8921').slice(-4);
  const chars = 'MC';
  return `${chars}-${digits}`;
};
