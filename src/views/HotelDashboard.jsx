import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { getMatchingFoodImage } from '../utils/foodImageResolver';
import { DeleteConfirmationModal } from '../components/DeleteConfirmationModal';
import { QrVerificationModal } from '../components/QrVerificationModal';
import { calculateFoodStatus, toDateTimeLocal, getDefaultExpiryTimes } from '../utils/expiryUtils';
import { 
  Building2, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  Clock, 
  Package, 
  TrendingUp, 
  ShoppingBag, 
  AlertCircle, 
  X, 
  Sparkles, 
  ChevronRight, 
  ShieldCheck, 
  LogOut, 
  Lock, 
  ArrowRight, 
  Upload, 
  Image as ImageIcon,
  QrCode,
  CheckCircle2
} from 'lucide-react';

export const HotelDashboard = () => {
  const { 
    currentRole,
    currentUser, 
    listings, 
    orders, 
    addFoodListing, 
    updateFoodListing, 
    deleteFoodListing,
    deleteFoodImage,
    advanceOrderStatus,
    setActiveView,
    setActiveTrackingOrderId,
    logout
  } = useApp();

  // Access Control Protection
  if (currentRole !== 'hotel' || !currentUser) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl shadow-xl border border-slate-200 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 font-heading">Hotel Access Required</h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          You must be logged in with a registered Hotel account to view and manage hotel food listings.
        </p>
        <button
          onClick={() => setActiveView('hotel-login')}
          className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2"
        >
          <span>Go to Hotel Login</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const hotel = currentUser || { id: 'hotel-1', name: 'Green Leaf Hotel', location: 'Indiranagar, Bengaluru' };

  // Filter listings & orders for this hotel
  const hotelListings = listings.filter(l => l.hotelId === hotel.id || l.hotelName === hotel.name);
  const hotelOrders = orders.filter(o => o.hotelId === hotel.id || o.hotelName === hotel.name);

  // Stats calculation
  const totalListings = hotelListings.length;
  const activeListings = hotelListings.filter(l => l.status === 'Available' && l.quantity > 0).length;
  const totalOrdersReceived = hotelOrders.length;
  const completedOrders = hotelOrders.filter(o => o.orderStatus === 'Completed').length;
  const foodRescuedKg = hotelOrders.reduce((sum, o) => sum + (parseInt(o.quantity) || 0), 0) * 2;

  // Add / Edit Modal State & QR Verification Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [imageToDelete, setImageToDelete] = useState(null);
  const [imageError, setImageError] = useState('');
  const fileInputRef = useRef(null);

  const getInitialTimes = (category = 'Cooked Meals', prepDate = new Date()) => {
    const times = getDefaultExpiryTimes(category, prepDate);
    return {
      prep: times.preparedTimeLocal,
      exp: times.bestBeforeTimeLocal
    };
  };

  const [formData, setFormData] = useState(() => {
    const times = getInitialTimes('Cooked Meals');
    return {
      name: '',
      category: 'Cooked Meals',
      image: '',
      description: '',
      quantity: 25,
      unit: 'portions',
      price: 0,
      preparedTime: times.prep,
      bestBeforeTime: times.exp,
      pickupLocation: hotel.address || hotel.location || 'Hotel Main Gate',
      availablePickupTime: 'Immediate Pickup Available',
      dietary: 'Veg'
    };
  });

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setImageError('');
    const times = getInitialTimes('Cooked Meals');
    setFormData({
      name: '',
      category: 'Cooked Meals',
      image: '',
      description: '',
      quantity: 30,
      unit: 'portions',
      price: 0,
      preparedTime: times.prep,
      bestBeforeTime: times.exp,
      pickupLocation: hotel.address || hotel.location || 'Hotel Main Gate',
      availablePickupTime: 'Immediate Pickup Available',
      dietary: 'Veg'
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setIsModalOpen(true);
  };

  const handleCategoryChange = (newCat) => {
    const curPrep = formData.preparedTime || new Date();
    const times = getInitialTimes(newCat, curPrep);
    setFormData(prev => ({
      ...prev,
      category: newCat,
      bestBeforeTime: times.exp
    }));
  };

  const handlePreparedTimeChange = (newPrep) => {
    const times = getInitialTimes(formData.category, newPrep);
    setFormData(prev => ({
      ...prev,
      preparedTime: newPrep,
      bestBeforeTime: times.exp
    }));
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setImageError('');
    const normalizedDietary = (item.dietary === 'Non-Veg' || item.dietary === 'Non-Vegetarian') ? 'Non-Veg' : 'Veg';
    const defaults = getInitialTimes(item.category || 'Cooked Meals', item.preparedTime || new Date());
    setFormData({
      name: item.name,
      category: item.category,
      image: item.image || '',
      description: item.description,
      quantity: item.quantity,
      unit: item.unit || 'portions',
      price: item.price,
      preparedTime: item.preparedTime ? toDateTimeLocal(item.preparedTime) : defaults.prep,
      bestBeforeTime: item.bestBeforeTime ? toDateTimeLocal(item.bestBeforeTime) : defaults.exp,
      pickupLocation: item.pickupLocation,
      availablePickupTime: item.availablePickupTime,
      dietary: normalizedDietary
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setIsModalOpen(true);
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image format
    const validFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validFormats.includes(file.type.toLowerCase())) {
      setImageError('Unsupported file format. Please upload JPG, JPEG, PNG, or WEBP.');
      return;
    }

    // Convert to base64 Data URL for authentic, permanent local storage
    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData(prev => ({ ...prev, image: event.target.result }));
      setImageError('');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, image: '' }));
    setImageError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();

    setImageError('');

    const prepIso = new Date(formData.preparedTime).toISOString();
    const expiryIso = new Date(formData.bestBeforeTime).toISOString();

    const payload = {
      name: formData.name.trim(),
      category: formData.category,
      image: formData.image ? formData.image.trim() : '', // EXACT uploaded image data or empty
      description: formData.description || `Fresh surplus ${formData.name} prepared safely.`,
      quantity: Number(formData.quantity),
      unit: formData.unit,
      price: Number(formData.price),
      preparedTime: prepIso,
      bestBeforeTime: expiryIso,
      pickupLocation: formData.pickupLocation,
      availablePickupTime: formData.availablePickupTime,
      dietary: formData.dietary === 'Non-Veg' ? 'Non-Veg' : 'Veg',
      status: 'Available'
    };

    if (editingItem) {
      updateFoodListing({ ...editingItem, ...payload });
    } else {
      addFoodListing(payload);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Welcome Bar */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg shrink-0">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-extrabold uppercase tracking-wider">
                Logged In as HOTEL
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Verified Partner
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white mt-1">
              {hotel.name}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Location: {hotel.location} • Contact: {hotel.ownerName || 'Manager'} • Email: {hotel.email}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsVerifyModalOpen(true)}
            className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 border border-slate-700"
            title="Scan QR Code or enter PIN to verify Trust pickup"
          >
            <QrCode className="w-4 h-4 text-emerald-400" />
            <span>Verify Food Pickup (QR / PIN)</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xl shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Food Listing
          </button>
          
          <button
            onClick={logout}
            className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-300 border border-slate-700 font-bold text-xs transition-all flex items-center gap-1.5"
            title="Log out of hotel portal"
          >
            <LogOut className="w-4 h-4 text-rose-400" /> Logout
          </button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Listings</span>
          <p className="text-2xl font-extrabold text-slate-900 font-mono">{totalListings}</p>
          <span className="text-[11px] text-slate-500 font-medium">All posted items</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Active Marketplace</span>
          <p className="text-2xl font-extrabold text-emerald-600 font-mono">{activeListings}</p>
          <span className="text-[11px] text-emerald-700 font-medium">Currently claimable</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Orders Received</span>
          <p className="text-2xl font-extrabold text-blue-600 font-mono">{totalOrdersReceived}</p>
          <span className="text-[11px] text-slate-500 font-medium">From verified trusts</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Completed Orders</span>
          <p className="text-2xl font-extrabold text-amber-600 font-mono">{completedOrders}</p>
          <span className="text-[11px] text-slate-500 font-medium">Successfully handed over</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs col-span-2 md:col-span-1 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Food Rescued</span>
          <p className="text-2xl font-extrabold text-teal-600 font-mono">{foodRescuedKg} kg</p>
          <span className="text-[11px] text-slate-500 font-medium">Saved from landfills</span>
        </div>

      </div>

      {/* SECTION 1: INCOMING TRUST ORDERS */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-extrabold text-slate-900 font-heading">
              Incoming Orders from Verified Trusts
            </h2>
          </div>
          <span className="text-xs font-bold text-slate-500">
            {hotelOrders.length} Recent Order(s)
          </span>
        </div>

        {hotelOrders.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            No orders received yet for your food listings.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Trust / NGO</th>
                  <th className="p-3">Food Item</th>
                  <th className="p-3">Quantity</th>
                  <th className="p-3">Total Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Advance Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {hotelOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-900">{ord.id}</td>
                    <td className="p-3 font-semibold text-emerald-700">{ord.trustName}</td>
                    <td className="p-3 font-medium text-slate-800">{ord.foodName}</td>
                    <td className="p-3 font-bold">{ord.quantity} {ord.unit || 'portions'}</td>
                    <td className="p-3 font-bold text-slate-900">{ord.totalAmount === 0 ? 'FREE' : `₹${ord.totalAmount}`}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                        ord.orderStatus === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                        ord.orderStatus === 'Picked Up' ? 'bg-blue-100 text-blue-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {ord.orderStatus}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => {
                          setActiveTrackingOrderId(ord.id);
                          setActiveView('order-tracking');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold"
                      >
                        Track Status
                      </button>

                      {ord.orderStatus === 'Order Placed' && (
                        <button
                          onClick={() => advanceOrderStatus(ord.id, 'Hotel Confirmed')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-xs"
                        >
                          Confirm Order
                        </button>
                      )}

                      {ord.orderStatus === 'Hotel Confirmed' && (
                        <button
                          onClick={() => advanceOrderStatus(ord.id, 'Food Ready')}
                          className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold shadow-xs"
                        >
                          Mark Food Ready
                        </button>
                      )}

                      {ord.orderStatus === 'Food Ready' && (
                        <button
                          onClick={() => advanceOrderStatus(ord.id, 'Picked Up')}
                          className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold shadow-xs"
                        >
                          Confirm Pickup
                        </button>
                      )}

                      {ord.orderStatus === 'Picked Up' && (
                        <button
                          onClick={() => advanceOrderStatus(ord.id, 'Completed')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-xs"
                        >
                          Complete Order
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECTION 2: MY FOOD LISTINGS MANAGEMENT */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-extrabold text-slate-900 font-heading">
              Manage Hotel Leftover Food Listings
            </h2>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"
          >
            + Create New Listing
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hotelListings
            .filter(item => getMatchingFoodImage(item.name, item.category, item.image))
            .map((item) => (
            <div key={item.id} className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50 flex flex-col justify-between space-y-3">
              <div className="flex gap-3">
                {(() => {
                  const resolvedImg = getMatchingFoodImage(item.name, item.category, item.image);
                  return (
                    <img 
                      src={resolvedImg} 
                      alt={item.name} 
                      className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200 bg-slate-100" 
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  );
                })()}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between">
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm truncate">{item.name}</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {item.status}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-600 mt-0.5">
                    Qty: {item.quantity} {item.unit} • Price: {item.price === 0 ? 'Free' : `₹${item.price}`}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Pickup: {item.pickupLocation}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/60">
                <button
                  onClick={() => handleOpenEditModal(item)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5 text-slate-500" /> Edit
                </button>
                {getMatchingFoodImage(item.name, item.category, item.image) && (
                  <button
                    onClick={() => setImageToDelete(item)}
                    className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-1"
                    title="Delete Food Image"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" /> Delete Image
                  </button>
                )}
                <button
                  onClick={() => setItemToDelete(item)}
                  className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-500" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ADD / EDIT FOOD LISTING MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-slate-100 relative animate-in zoom-in-95 duration-200">
            
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-extrabold text-base font-heading">
                {editingItem ? 'Edit Food Listing' : 'Create Leftover Surplus Food Listing'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Food Name</label>
                <input
                  type="text"
                  placeholder="e.g. Idiyappam / Payasam / Vegetable Biryani"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Food Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch & Main Course">Lunch & Main Course</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Sweets & Desserts">Sweets & Desserts</option>
                    <option value="Drinks">Drinks</option>
                    <option value="Non-Vegetarian">Non-Vegetarian</option>
                    <option value="Combo Meals">Combo Meals</option>
                    <option value="Rice & Breads">Rice & Breads</option>
                    <option value="Cooked Meals">Cooked Meals</option>
                    <option value="Bakery">Bakery</option>
                    <option value="Beverages & Desserts">Beverages & Desserts</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Dietary Category</label>
                  <select
                    value={formData.dietary}
                    onChange={(e) => setFormData({ ...formData, dietary: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Veg">Veg</option>
                    <option value="Non-Veg">Non-Veg</option>
                  </select>
                </div>
              </div>

              {/* UPLOAD FOOD IMAGE SECTION */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    Upload Food Image <span className="text-rose-500 font-extrabold">*</span>
                  </label>
                  {formData.image && (
                    <span className="text-[10px] text-emerald-700 font-extrabold bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Image Uploaded
                    </span>
                  )}
                </div>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                  onChange={handleImageFileChange}
                  className="hidden"
                  id="hotel-food-image-input"
                />

                {formData.image ? (
                  /* Uploaded Image Preview & Change/Remove Controls */
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-3">
                    <div className="relative h-48 w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                      <img
                        src={formData.image}
                        alt="Uploaded Food Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-2.5 px-3 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                      >
                        <Upload className="w-3.5 h-3.5 text-slate-500" />
                        Change Image
                      </button>

                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="w-full py-2.5 px-3 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                        Remove Image
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Initial Upload Box */
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50/70 hover:bg-emerald-50/30 rounded-2xl p-6 text-center cursor-pointer transition-all space-y-2 group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs group-hover:scale-105 transition-transform">
                      <Upload className="w-6 h-6" />
                    </div>

                    <div>
                      <button
                        type="button"
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 pointer-events-none"
                      >
                        Upload Image
                      </button>
                    </div>

                    <p className="text-xs font-semibold text-slate-700 pt-1">
                      Upload a real photo of the leftover food
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium">
                      Supported formats: JPG, JPEG, PNG, WEBP
                    </p>
                  </div>
                )}

                {/* Validation Error Message */}
                {imageError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{imageError}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Quantity Available</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Unit (portions / kg)</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="portions">Portions</option>
                    <option value="kg">Kilograms (kg)</option>
                    <option value="boxes">Boxes</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-500" /> Prepared Date & Time <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.preparedTime}
                    onChange={(e) => handlePreparedTimeChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-500" /> Best Before Date & Time <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.bestBeforeTime}
                    onChange={(e) => setFormData({ ...formData, bestBeforeTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Live Expiry Status Calculation Preview */}
              {(() => {
                const preview = calculateFoodStatus(formData.preparedTime, formData.bestBeforeTime);
                return (
                  <div className={`p-3 rounded-2xl border text-xs flex items-center justify-between ${
                    preview.isExpired 
                      ? 'bg-rose-50 border-rose-200 text-rose-800' 
                      : preview.isExpiringSoon
                        ? 'bg-amber-50 border-amber-200 text-amber-900'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  }`}>
                    <span className="font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      Calculated Shelf Life: <strong className="font-mono">{preview.formattedCountdown}</strong>
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${preview.badgeClass}`}>
                      {preview.status}
                    </span>
                  </div>
                );
              })()}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Pickup Location & Gate</label>
                <input
                  type="text"
                  placeholder="e.g. Hotel Gate 2 Rear Entrance"
                  value={formData.pickupLocation}
                  onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Description</label>
                <textarea
                  rows="2"
                  placeholder="Describe food quality, ingredients, packaging..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/20 transition-all mt-4"
              >
                {editingItem ? 'Save Listing Changes' : 'Publish Food Listing to Marketplace'}
              </button>

            </form>

          </div>
        </div>
      )}

      {/* Delete Food Image Confirmation Modal */}
      {imageToDelete && (
        <DeleteConfirmationModal
          isOpen={!!imageToDelete}
          onClose={() => setImageToDelete(null)}
          onConfirm={(id) => {
            deleteFoodImage(id);
            setImageToDelete(null);
          }}
          foodItem={imageToDelete}
          mode="image"
        />
      )}

      {/* Delete Food Listing Confirmation Modal */}
      {itemToDelete && (
        <DeleteConfirmationModal
          isOpen={!!itemToDelete}
          onClose={() => setItemToDelete(null)}
          onConfirm={(id) => {
            deleteFoodListing(id);
            setItemToDelete(null);
          }}
          foodItem={itemToDelete}
          mode="listing"
        />
      )}

      {/* QR Code Pickup Verification Modal */}
      <QrVerificationModal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
      />

    </div>
  );
};
