import { User } from '../models/User.js';
import { Food } from '../models/Food.js';
import { Order } from '../models/Order.js';
import { Notification } from '../models/Notification.js';

export const seedDatabase = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log(`[Seed] Database already contains ${userCount} users. Seeding not required.`);
      return;
    }

    console.log('[Seed] Initializing seed data for Meal Connect...');

    // 1. Hotels
    const hotel1 = await User.create({
      name: 'Green Leaf Hotel',
      ownerName: 'Rajesh Sharma',
      email: 'contact@greenleafhotel.com',
      password: 'hotel123',
      phone: '+91 98765 43210',
      address: '45 MG Road, Near Metro Station',
      location: 'Indiranagar, Bengaluru',
      role: 'hotel',
      verified: true,
      rating: 4.8,
      totalRescuedKg: 340,
      avatar: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=150&auto=format&fit=crop&q=80',
      coordinates: { lat: 12.9784, lng: 77.6408 }
    });

    const hotel2 = await User.create({
      name: 'Sri Annapoorna Restaurant',
      ownerName: 'Venkatesh Prasad',
      email: 'annapoorna@foodrescue.org',
      password: 'hotel123',
      phone: '+91 94432 112233',
      address: '128 10th Main, 4th Block',
      location: 'Jayanagar, Bengaluru',
      role: 'hotel',
      verified: true,
      rating: 4.9,
      totalRescuedKg: 520,
      avatar: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=150&auto=format&fit=crop&q=80',
      coordinates: { lat: 12.9250, lng: 77.5938 }
    });

    const hotel3 = await User.create({
      name: 'City Grand Hotel',
      ownerName: 'Ananya Deshmukh',
      email: 'food@citygrand.com',
      password: 'hotel123',
      phone: '+91 98200 99887',
      address: '88 Ring Road Bypass',
      location: 'Koramangala, Bengaluru',
      role: 'hotel',
      verified: true,
      rating: 4.7,
      totalRescuedKg: 280,
      avatar: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150&auto=format&fit=crop&q=80',
      coordinates: { lat: 12.9352, lng: 77.6245 }
    });

    // 2. Trusts
    const trust1 = await User.create({
      name: 'Hope Foundation Trust',
      headPerson: 'Sister Maria Joseph',
      email: 'hope.trust@ngonetwork.org',
      password: 'trust123',
      phone: '+91 98450 12345',
      regDetails: 'REG/2018/NGO/9941 - 12A Certified',
      address: '14 Charity Lane, Richmond Town',
      location: 'Richmond Town, Bengaluru',
      role: 'trust',
      verified: true,
      peopleServed: 1450,
      avatar: 'https://images.unsplash.com/photo-1532629345422-7515fe9d1632?w=150&auto=format&fit=crop&q=80',
      coordinates: { lat: 12.9650, lng: 77.6000 }
    });

    const trust2 = await User.create({
      name: 'Akshaya Community Care',
      headPerson: 'Dr. Arvind Kumar',
      email: 'contact@akshayacare.org',
      password: 'trust123',
      phone: '+91 94480 67890',
      regDetails: 'NGO-KA-2020-00431 - 80G Tax Exempt',
      address: '89 Seva Marg, Ulsoor',
      location: 'Ulsoor, Bengaluru',
      role: 'trust',
      verified: true,
      peopleServed: 980,
      avatar: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=150&auto=format&fit=crop&q=80',
      coordinates: { lat: 12.9817, lng: 77.6284 }
    });

    // 3. Admin (No public registration)
    await User.create({
      name: 'Master System Administrator',
      email: 'admin@foodrescue.org',
      password: 'admin123',
      phone: '+91 80 2345 6789',
      address: 'Meal Connect Central Command',
      location: 'Bengaluru HQ',
      role: 'admin',
      accessLevel: 'SuperAdmin',
      verified: true
    });

    // 4. Food Listings
    const now = Date.now();
    const subHours = (h) => new Date(now - h * 3600 * 1000);
    const addHours = (h) => new Date(now + h * 3600 * 1000);

    const items = [
      {
        hotel: hotel2._id,
        hotelName: hotel2.name,
        hotelLocation: hotel2.location,
        name: 'Steamed Idli & Hot Sambar',
        category: 'Breakfast',
        image: '/food-images/steamed_idli_hot_sambar.jpg',
        description: 'Fluffy white rice idlis served with hot drumstick sambar and coconut chutney. Sealed in food-grade trays.',
        quantity: 50,
        unit: 'portions',
        price: 10,
        preparedTime: subHours(1),
        bestBeforeTime: addHours(4.5),
        pickupLocation: 'Sri Annapoorna Service Desk',
        availablePickupTime: 'Available now',
        status: 'Available',
        dietary: 'Veg',
        distanceKm: 3.8
      },
      {
        hotel: hotel1._id,
        hotelName: hotel1.name,
        hotelLocation: hotel1.location,
        name: 'Vegetable Biryani & Salan',
        category: 'Lunch & Main Course',
        image: '/food-images/vegetable_biryani_salan.jpg',
        description: 'Fragrant basmati rice layered with fresh garden vegetables, mint, and spices.',
        quantity: 40,
        unit: 'portions',
        price: 0,
        preparedTime: subHours(1.5),
        bestBeforeTime: addHours(0.8), // Expiring soon for demo
        pickupLocation: 'Green Leaf Hotel Service Gate',
        availablePickupTime: 'Immediate Pickup',
        status: 'Available',
        dietary: 'Veg',
        distanceKm: 2.4
      },
      {
        hotel: hotel3._id,
        hotelName: hotel3.name,
        hotelLocation: hotel3.location,
        name: 'Paneer Butter Masala & Naan',
        category: 'Cooked Meals',
        image: '/food-images/paneer_butter_masala_naan.jpg',
        description: 'Rich tomato-butter gravy with soft paneer cubes and warm tandoori butter naan.',
        quantity: 25,
        unit: 'portions',
        price: 20,
        preparedTime: subHours(2),
        bestBeforeTime: addHours(3.5),
        pickupLocation: 'City Grand Hotel Banquet Entrance',
        availablePickupTime: 'Available Now',
        status: 'Available',
        dietary: 'Veg',
        distanceKm: 3.1
      }
    ];

    await Food.insertMany(items);

    console.log('[Seed] Database initialization complete.');
  } catch (error) {
    console.error('[Seed Error] Failed to seed database:', error);
  }
};
