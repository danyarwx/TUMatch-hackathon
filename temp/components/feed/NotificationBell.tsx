import React, { useState, useEffect, useRef } from 'react';
import { Bell, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

const sampleNotifications = [
  {
    id: 1,
    type: 'join',
    title: 'Alex joined your event',
    message: 'Machine Learning Workshop now has 15 participants',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    time: new Date(Date.now() - 5 * 60 * 1000),
    read: false,
    eventId: '1'
  },
  {
    id: 2,
    type: 'reminder',
    title: 'Event starting soon',
    message: 'Coffee & Code Meetup starts in 10 minutes',
    avatar: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=400',
    time: new Date(Date.now() - 10 * 60 * 1000),
    read: false,
    eventId: '2'
  },
  {
    id: 3,
    type: 'new',
    title: 'New event near you',
    message: 'AI Workshop added at TUM Campus',
    avatar: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400',
    time: new Date(Date.now() - 30 * 60 * 1000),
    read: false,
    eventId: '3'
  }
];

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(sampleNotifications);
  const panelRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  const handleNotificationClick = (notification) => {
    setNotifications(prev =>
      prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
    );
    setIsOpen(false);
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const formatTime = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return format(date, 'MMM d');
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/40 transition-colors"
      >
        <Bell className="w-6 h-6 text-white" />

        {/* Notification Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF3B30] rounded-full flex items-center justify-center border-2 border-white">
            <span className="text-white text-[10px] font-bold">{unreadCount}</span>
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-12 right-0 w-[85vw] max-w-sm bg-white rounded-xl shadow-xl overflow-hidden z-50"
            style={{
              boxShadow: '0px 4px 12px rgba(0,0,0,0.15)',
              maxHeight: '60vh'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-accent font-medium hover:underline"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(60vh - 52px)' }}>
              {notifications.length > 0 ? (
                notifications.map((notification, index) => (
                  <div key={notification.id}>
                    <button
                      onClick={() => handleNotificationClick(notification)}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                        !notification.read ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <div className="flex gap-3">
                        <img
                          src={notification.avatar}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {notification.title}
                          </p>
                          <p className="text-[13px] text-gray-600 truncate">
                            {notification.message}
                          </p>
                          <p className="text-[11px] text-gray-400 mt-1">
                            {formatTime(notification.time)}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-2" />
                        )}
                      </div>
                    </button>
                    {index < notifications.length - 1 && (
                      <div className="h-px bg-[#EDEDED] mx-4" />
                    )}
                  </div>
                ))
              ) : (
                <div className="px-4 py-8 text-center">
                  <Bell className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No notifications yet</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
