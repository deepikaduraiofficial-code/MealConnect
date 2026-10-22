import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Bell, CheckCheck, Clock, AlertTriangle, PackageCheck } from 'lucide-react';

export const NotificationDropdown = () => {
  const { notifications, currentRole, currentUser, markNotificationAsRead, markAllNotificationsAsRead, setActiveView } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  // Filter notifications for current role/user
  const relevantNotifs = notifications.filter(n => {
    if (currentRole === 'admin') return true;
    if (currentRole === 'hotel') return n.roleTarget === 'Hotel' && (!n.hotelId || n.hotelId === currentUser?.id);
    if (currentRole === 'trust') return n.roleTarget === 'Trust' && (!n.trustId || n.trustId === currentUser?.id);
    return true;
  });

  const unreadCount = relevantNotifs.filter(n => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-400" />
                <h3 className="font-semibold text-sm">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-xs bg-emerald-500 text-white rounded-full font-medium">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllNotificationsAsRead}
                  className="text-xs text-slate-300 hover:text-white flex items-center gap-1 transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
              {relevantNotifs.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-xs font-medium">No notifications yet</p>
                </div>
              ) : (
                relevantNotifs.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      markNotificationAsRead(n.id);
                      if (n.type === 'order' || n.type === 'status') {
                        if (currentRole === 'trust') setActiveView('order-history');
                        if (currentRole === 'hotel') setActiveView('hotel-dashboard');
                      } else if (n.type === 'urgent' || n.type === 'new_food') {
                        setActiveView('marketplace');
                      }
                      setIsOpen(false);
                    }}
                    className={`p-4 hover:bg-slate-50 cursor-pointer transition-colors flex items-start gap-3 ${
                      !n.read ? 'bg-emerald-50/40 font-medium' : ''
                    }`}
                  >
                    <div className="mt-0.5 p-2 rounded-lg bg-white border border-slate-100 shadow-sm shrink-0">
                      {n.type === 'urgent' ? (
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                      ) : n.type === 'order' ? (
                        <PackageCheck className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-blue-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-slate-900 truncate">{n.title}</p>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">{n.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">{n.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 bg-slate-50 text-center border-t border-slate-100">
              <span className="text-[11px] text-slate-500 font-medium">
                Role Context: <strong className="text-emerald-700 capitalize">{currentRole}</strong>
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
