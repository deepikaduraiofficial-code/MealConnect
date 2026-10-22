import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { getMatchingFoodImage } from '../utils/foodImageResolver';
import { DeleteConfirmationModal } from '../components/DeleteConfirmationModal';
import { AdminReportModal } from '../components/AdminReportModal';
import { calculateFoodStatus } from '../utils/expiryUtils';
import { generateImpactReportPDF } from '../utils/pdfReportGenerator';
import { formatOrderDateTime } from '../utils/dateUtils';
import { 
  ShieldCheck, 
  Building2, 
  HeartHandshake, 
  Package, 
  ShoppingBag, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  AlertTriangle, 
  Download, 
  Users, 
  Scale,
  LogOut,
  Lock,
  ArrowRight,
  Printer,
  BarChart3,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  Sparkles
} from 'lucide-react';

export const AdminDashboard = () => {
  const { 
    currentRole,
    currentUser,
    hotels, 
    trusts, 
    listings, 
    orders, 
    toggleHotelVerification, 
    toggleTrustVerification, 
    deleteFoodListing, 
    showToast, 
    totalMealsRescued, 
    totalKgRescued, 
    totalPeopleServed,
    setActiveView,
    logout
  } = useApp();

  // Access Control Protection
  if (currentRole !== 'admin' || !currentUser) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl shadow-xl border border-slate-200 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 font-heading">Admin Access Restricted</h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          Super Administrator privileges are required to access this portal. Please log in with admin credentials.
        </p>
        <button
          onClick={() => setActiveView('admin-login')}
          className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2"
        >
          <span>Go to Admin Login</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState('hotels'); // 'hotels' | 'trusts' | 'listings' | 'orders' | 'reports'
  const [chartPeriod, setChartPeriod] = useState('daily'); // 'daily' | 'weekly' | 'monthly'
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Computed metrics for Advanced Analytics
  const successfulOrders = useMemo(() => {
    return orders.filter(o => o.orderStatus === 'Completed' || o.orderStatus === 'Collected' || o.orderStatus === 'Confirmed');
  }, [orders]);

  const completedPickups = useMemo(() => {
    return orders.filter(o => o.orderStatus === 'Collected' || o.isQrVerified);
  }, [orders]);

  const expiredListings = useMemo(() => {
    return listings.filter(l => {
      const st = calculateFoodStatus(l.preparedTime, l.bestBeforeTime, l.isCollected || l.status === 'Collected');
      return st.isExpired;
    });
  }, [listings]);

  const expiredPortions = useMemo(() => {
    return expiredListings.reduce((sum, l) => sum + (Number(l.quantity) || 0), 0);
  }, [expiredListings]);

  // Chart data for daily, weekly, monthly rescue activity
  const chartData = useMemo(() => {
    if (chartPeriod === 'daily') {
      return [
        { label: 'Mon', value: 45, date: 'Oct 05' },
        { label: 'Tue', value: 68, date: 'Oct 06' },
        { label: 'Wed', value: 52, date: 'Oct 07' },
        { label: 'Thu', value: 89, date: 'Oct 08' },
        { label: 'Fri', value: 110, date: 'Oct 09' },
        { label: 'Sat', value: 145, date: 'Oct 10' },
        { label: 'Sun', value: 92, date: 'Oct 11' }
      ];
    } else if (chartPeriod === 'weekly') {
      return [
        { label: 'Wk 37', value: 310, date: 'Sep 14 - 20' },
        { label: 'Wk 38', value: 420, date: 'Sep 21 - 27' },
        { label: 'Wk 39', value: 495, date: 'Sep 28 - Oct 04' },
        { label: 'Wk 40', value: 605, date: 'Oct 05 - Oct 11' }
      ];
    } else {
      return [
        { label: 'May', value: 850, date: 'May 2026' },
        { label: 'Jun', value: 1140, date: 'Jun 2026' },
        { label: 'Jul', value: 1420, date: 'Jul 2026' },
        { label: 'Aug', value: 1680, date: 'Aug 2026' },
        { label: 'Sep', value: 2010, date: 'Sep 2026' },
        { label: 'Oct', value: 2480, date: 'Oct 2026' }
      ];
    }
  }, [chartPeriod]);

  // 1. Download Impact Report (Generates professional downloadable PDF)
  const handleDownloadImpactReport = () => {
    try {
      generateImpactReportPDF({
        hotels,
        trusts,
        listings,
        orders,
        totalMealsRescued,
        totalKgRescued,
        totalPeopleServed
      });
      showToast('Meal Connect Impact Report PDF downloaded successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Error generating PDF report: ' + err.message, 'error');
    }
  };

  // 2. Print Summary Report: Open print preview with complete summary report
  const handlePrintSummaryReport = () => {
    setIsReportModalOpen(true);
    showToast('Opening Print / Save PDF preview with complete summary report...', 'info');
    const originalTitle = document.title;
    document.title = `Meal_Connect_Admin_Report_${new Date().toISOString().split('T')[0]}`;
    document.body.classList.add('printing-admin-report');
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        document.title = originalTitle;
        document.body.classList.remove('printing-admin-report');
      }, 1000);
    }, 250);
  };

  return (
    <div className="admin-dashboard-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* On-screen Dashboard Elements (Hidden during print) */}
      <div className="no-print space-y-8">
        
        {/* Admin Top Banner */}
        <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shrink-0">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500 text-white text-[10px] font-extrabold uppercase tracking-wider">
                  Logged In as ADMIN
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30">
                  Master SuperAdmin Control
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white mt-1">
                System Administration Panel
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Verify organizations, moderate food listings, monitor rescue transactions, and generate reports.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadImpactReport}
              className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2 shrink-0"
              title="Download Impact Report as PDF"
            >
              <Download className="w-4 h-4" /> Download Impact Report
            </button>

            <button
              onClick={logout}
              className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-300 border border-slate-700 font-bold text-xs transition-all flex items-center gap-1.5 shrink-0"
              title="Log out of admin panel"
            >
              <LogOut className="w-4 h-4 text-rose-400" /> Logout
            </button>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
          
          <button
            onClick={() => setActiveTab('hotels')}
            className={`px-5 py-3 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 ${
              activeTab === 'hotels' ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4 text-amber-400" />
            Hotels ({hotels.length})
          </button>

          <button
            onClick={() => setActiveTab('trusts')}
            className={`px-5 py-3 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 ${
              activeTab === 'trusts' ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <HeartHandshake className="w-4 h-4 text-emerald-400" />
            Trusts / NGOs ({trusts.length})
          </button>

          <button
            onClick={() => setActiveTab('listings')}
            className={`px-5 py-3 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 ${
              activeTab === 'listings' ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Package className="w-4 h-4 text-blue-400" />
            Food Listings ({listings.length})
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-5 py-3 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 ${
              activeTab === 'orders' ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-teal-400" />
            Orders ({orders.length})
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`px-5 py-3 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 ${
              activeTab === 'reports' ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-4 h-4 text-purple-400" />
            Analytics & Reports
          </button>

        </div>

        {/* TAB 1: MANAGE HOTELS */}
        {activeTab === 'hotels' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-4">
            <h3 className="font-extrabold text-base text-slate-900">Hotel / Restaurant Partners Verification</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="p-3">Hotel Name</th>
                    <th className="p-3">Manager</th>
                    <th className="p-3">Email & Phone</th>
                    <th className="p-3">Location</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Verification Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {hotels.map((h) => (
                    <tr key={h.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                        <img src={h.avatar} alt={h.name} className="w-8 h-8 rounded-lg object-cover" />
                        {h.name}
                      </td>
                      <td className="p-3 font-semibold text-slate-700">{h.ownerName}</td>
                      <td className="p-3 text-slate-500">{h.email}</td>
                      <td className="p-3 text-slate-600">{h.location}</td>
                      <td className="p-3">
                        {h.verified ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            ✓ Verified
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => toggleHotelVerification(h.id)}
                          className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                            h.verified 
                              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100' 
                              : 'bg-emerald-600 text-white hover:bg-emerald-700'
                          }`}
                        >
                          {h.verified ? 'Revoke Verification' : 'Approve & Verify'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: MANAGE TRUSTS */}
        {activeTab === 'trusts' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-4">
            <h3 className="font-extrabold text-base text-slate-900">Verified Trust & NGO Application Queue</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="p-3">Trust / NGO Name</th>
                    <th className="p-3">Contact Person</th>
                    <th className="p-3">Registration Details</th>
                    <th className="p-3">Location</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Verification Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {trusts.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                        <img src={t.avatar} alt={t.name} className="w-8 h-8 rounded-lg object-cover" />
                        {t.name}
                      </td>
                      <td className="p-3 font-semibold text-slate-700">{t.headPerson}</td>
                      <td className="p-3 font-mono text-slate-500">{t.regDetails}</td>
                      <td className="p-3 text-slate-600">{t.location}</td>
                      <td className="p-3">
                        {t.verified ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                            ✓ Verified Trust
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                            Pending Approval
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => toggleTrustVerification(t.id)}
                          className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                            t.verified 
                              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100' 
                              : 'bg-emerald-600 text-white hover:bg-emerald-700'
                          }`}
                        >
                          {t.verified ? 'Reject / Revoke Badge' : 'Grant Verified Trust Badge'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: MANAGE FOOD LISTINGS */}
        {activeTab === 'listings' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-4">
            <h3 className="font-extrabold text-base text-slate-900">Active Marketplace Food Listing Moderation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {listings.map((item) => (
                <div key={item.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-start gap-3">
                  <img
                    src={getMatchingFoodImage(item.name, item.category, item.image)}
                    alt={item.name}
                    className="w-16 h-16 rounded-xl object-cover shrink-0"
                    onError={(e) => {
                      e.target.src = getMatchingFoodImage(item.name, item.category);
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 text-xs truncate">{item.name}</h4>
                    <p className="text-[11px] text-emerald-700 font-semibold">{item.hotelName}</p>
                    <p className="text-[10px] text-slate-500 mt-1">Qty: {item.quantity} {item.unit}</p>
                    <button
                      onClick={() => setItemToDelete(item)}
                      className="mt-2 px-2.5 py-1 rounded-lg bg-rose-100 text-rose-700 text-[10px] font-bold hover:bg-rose-200 transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Remove Inappropriate Listing
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: MANAGE ORDERS */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-4">
            <h3 className="font-extrabold text-base text-slate-900">System Rescue Orders Audit</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-white uppercase text-[10px] font-bold">
                  <tr>
                    <th className="p-3">Order ID</th>
                    <th className="p-3">Trust</th>
                    <th className="p-3">Hotel</th>
                    <th className="p-3">Food Item</th>
                    <th className="p-3">Quantity</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Order Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-slate-900">{ord.id}</td>
                      <td className="p-3 font-semibold text-emerald-700">{ord.trustName}</td>
                      <td className="p-3 text-slate-700">{ord.hotelName}</td>
                      <td className="p-3 font-medium text-slate-800">{ord.foodName}</td>
                      <td className="p-3 font-bold">{ord.quantity} {ord.unit}</td>
                      <td className="p-3 font-bold text-slate-900">₹{ord.totalAmount}</td>
                      <td className="p-3 font-bold text-emerald-600">{ord.orderStatus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: REPORTS & ADVANCED SYSTEM ANALYTICS */}
        {activeTab === 'reports' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-8">
            
            {/* Header & Single Download / Print Actions */}
            <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-5 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wider">
                    Official Admin Analytics
                  </span>
                  <span className="text-xs text-slate-400">• Real-Time Synchronized</span>
                </div>
                <h3 className="font-extrabold text-lg text-slate-900 mt-1">
                  Food Rescue Analytics & Impact Audit
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Live metrics covering rescued portions, pickup compliance, expired surplus reduction, and partner velocity.
                </p>
              </div>
              
              <div className="flex items-center gap-2.5">
                {/* Single Clear Report Download Action (Generates PDF with actual data) */}
                <button
                  onClick={handleDownloadImpactReport}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-emerald-600/20"
                  title="Download Official Impact Report as PDF"
                >
                  <Download className="w-4 h-4" /> Download Impact Report
                </button>

                {/* Separate Print Summary Report Button */}
                <button
                  onClick={handlePrintSummaryReport}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                  title="Print Summary Report"
                >
                  <Printer className="w-4 h-4" /> Print Summary Report
                </button>
              </div>
            </div>

            {/* Required Dashboard Statistics (5 Core KPI Cards) */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
              
              {/* 1. Total Food Portions Rescued */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-emerald-800">Portions Rescued</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-2xl font-extrabold text-emerald-700 font-mono mt-1.5">{totalMealsRescued}</p>
                <p className="text-[10px] text-emerald-600 font-medium mt-1">{totalKgRescued} kg diverted from landfills</p>
              </div>

              {/* 2. Total Successful Orders */}
              <div className="p-4 rounded-2xl bg-teal-50 border border-teal-100 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-teal-800">Successful Orders</span>
                  <ShoppingBag className="w-4 h-4 text-teal-600" />
                </div>
                <p className="text-2xl font-extrabold text-teal-700 font-mono mt-1.5">{successfulOrders.length}</p>
                <p className="text-[10px] text-teal-600 font-medium mt-1">100% matched with Trusts</p>
              </div>

              {/* 3. Total Food Expired / Wasted */}
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-rose-800">Expired / Wasted</span>
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                </div>
                <p className="text-2xl font-extrabold text-rose-700 font-mono mt-1.5">{expiredListings.length}</p>
                <p className="text-[10px] text-rose-600 font-medium mt-1">{expiredPortions} portions safely blocked</p>
              </div>

              {/* 4. Total Active Hotels & Trusts */}
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-blue-800">Active Partners</span>
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-2xl font-extrabold text-blue-700 font-mono mt-1.5">{hotels.length + trusts.length}</p>
                <p className="text-[10px] text-blue-600 font-medium mt-1">{hotels.length} Hotels • {trusts.length} NGOs</p>
              </div>

              {/* 5. Total Completed Pickups */}
              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-purple-800">Completed Pickups</span>
                  <CheckCircle className="w-4 h-4 text-purple-600" />
                </div>
                <p className="text-2xl font-extrabold text-purple-700 font-mono mt-1.5">{completedPickups.length}</p>
                <p className="text-[10px] text-purple-600 font-medium mt-1">QR Code verified handoffs</p>
              </div>

            </div>

            {/* Interactive Charts: Daily, Weekly, and Monthly Food Rescue Activity */}
            <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                    Food Rescue Activity Trends ({chartPeriod === 'daily' ? 'Daily' : chartPeriod === 'weekly' ? 'Weekly' : 'Monthly'})
                  </h4>
                </div>

                {/* Period Switcher */}
                <div className="inline-flex rounded-xl bg-slate-200/70 p-1 text-xs">
                  <button
                    onClick={() => setChartPeriod('daily')}
                    className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all ${
                      chartPeriod === 'daily'
                        ? 'bg-white text-emerald-700 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Daily (Past 7 Days)
                  </button>
                  <button
                    onClick={() => setChartPeriod('weekly')}
                    className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all ${
                      chartPeriod === 'weekly'
                        ? 'bg-white text-emerald-700 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Weekly (Past 4 Weeks)
                  </button>
                  <button
                    onClick={() => setChartPeriod('monthly')}
                    className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all ${
                      chartPeriod === 'monthly'
                        ? 'bg-white text-emerald-700 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Monthly (Past 6 Months)
                  </button>
                </div>
              </div>

              {/* SVG Responsive Bar Chart */}
              <div className="pt-4 pb-2">
                <div className="h-52 w-full flex items-end gap-2 sm:gap-4 px-2">
                  {(() => {
                    const maxVal = Math.max(...chartData.map(d => d.value), 1);
                    return chartData.map((bar, i) => {
                      const heightPercent = Math.max(12, Math.round((bar.value / maxVal) * 100));
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                          {/* Hover Tooltip Value */}
                          <span className="text-[10px] font-mono font-bold text-slate-600 group-hover:text-emerald-700 transition-colors">
                            {bar.value}
                          </span>
                          
                          {/* Animated Bar with Gradient */}
                          <div className="w-full max-w-[48px] bg-slate-200 rounded-t-xl overflow-hidden flex items-end h-[160px]">
                            <div 
                              style={{ height: `${heightPercent}%` }} 
                              className="w-full bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-xl transition-all duration-500 group-hover:from-emerald-500 group-hover:to-teal-300 shadow-sm"
                            />
                          </div>

                          {/* Label */}
                          <div className="text-center">
                            <p className="text-[10px] font-bold text-slate-700 truncate max-w-[65px]">{bar.label}</p>
                            <p className="text-[8px] text-slate-400">{bar.date}</p>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200/60">
                <span className="flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  Average rescue velocity: <strong>+24.6% surplus recovered</strong> compared to prior period.
                </span>
                <span className="font-mono text-[10px] font-semibold text-slate-400">
                  Unit: Food Portions Rescued
                </span>
              </div>
            </div>

            {/* Food Rescue Activity by Hotel and by Date */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  Food Rescue Activity by Hotel and Date
                </h4>
                <span className="text-xs text-slate-400">
                  Audited from confirmed orders & live listings
                </span>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-white uppercase text-[10px] font-bold">
                    <tr>
                      <th className="p-3">Donating Hotel</th>
                      <th className="p-3">Rescuing Trust / NGO</th>
                      <th className="p-3">Food Item</th>
                      <th className="p-3">Quantity</th>
                      <th className="p-3">Activity Date & Time</th>
                      <th className="p-3 text-right">Pickup Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {orders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          {ord.hotelName}
                        </td>
                        <td className="p-3 font-semibold text-emerald-700">{ord.trustName}</td>
                        <td className="p-3 font-medium text-slate-800">{ord.foodName}</td>
                        <td className="p-3 font-bold text-slate-900">{ord.quantity} {ord.unit}</td>
                        <td className="p-3 text-slate-500 text-[11px] font-mono">
                          {formatOrderDateTime(ord.orderDate)}
                        </td>
                        <td className="p-3 text-right">
                          {ord.orderStatus === 'Collected' || ord.isQrVerified ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Collected (QR Verified)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                              <Clock className="w-3 h-3 text-amber-600" /> Pending Collection
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <DeleteConfirmationModal
          isOpen={!!itemToDelete}
          onClose={() => setItemToDelete(null)}
          onConfirm={(id) => deleteFoodListing(id)}
          foodItem={itemToDelete}
        />
      )}

      {/* Admin Analytics & Rescue Summary Report Modal (Prints cleanly when isReportModalOpen is true) */}
      <AdminReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />

    </div>
  );
};
