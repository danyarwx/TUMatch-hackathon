import React from 'react';
import { X, MapPin, Calendar, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

export default function MomentModal({ moment, isOpen, onClose }) {
  if (!moment) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white w-full max-w-lg rounded-3xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Photo */}
            <div className="relative aspect-square">
              <img
                src={moment.photo_url}
                alt={moment.event_title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Details */}
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{moment.event_title}</h2>

              <div className="space-y-3 mb-6">
                {moment.location && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <MapPin className="w-5 h-5 text-accent" />
                    <span>{moment.location}</span>
                  </div>
                )}
                {moment.event_date && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <Calendar className="w-5 h-5 text-accent" />
                    <span>{format(new Date(moment.event_date), 'MMM d, yyyy')}</span>
                  </div>
                )}
              </div>

              {/* Attendees */}
              {moment.attendees && moment.attendees.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-5 h-5 text-accent" />
                    <span className="text-sm font-medium text-gray-900">Who was there</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {moment.attendees.slice(0, 6).map((a, i) => (
                      <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-full pl-1 pr-3 py-1">
                        <img
                          src={a.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${a.name}`}
                          alt={a.name}
                          className="w-6 h-6 rounded-full"
                        />
                        <span className="text-sm text-gray-700">{a.name}</span>
                      </div>
                    ))}
                    {moment.attendees.length > 6 && (
                      <span className="text-sm text-gray-500">+{moment.attendees.length - 6} more</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
