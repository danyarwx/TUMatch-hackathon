import React from 'react';
import { apiClient } from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Calendar, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import BottomNav from '@/components/navigation/BottomNav';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function MyEvents() {
  const navigate = useNavigate();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => apiClient.getCurrentUser(),
  });

  const { data: allEvents = [], isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => apiClient.getEvents(),
  });

  // Filter events created by current user
  const myEvents = allEvents.filter((event: any) => event.creator_id === currentUser?.id);

  const handleEventTap = (eventId: string) => {
    navigate(createPageUrl('EventDetail') + `?id=${eventId}`);
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 border-b border-gray-100">
        <div className="flex items-center justify-between px-4 h-16">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-800" />
          </button>
          <h1 className="font-semibold text-gray-900">My Events</h1>
          <button
            onClick={() => navigate(createPageUrl('CreateEvent'))}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Plus className="w-5 h-5 text-gray-800" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pt-6">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="aspect-square bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : myEvents.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {myEvents.map((event: any, idx: number) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => handleEventTap(event.id)}
                className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group"
              >
                <img
                  src={event.image_url || 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=400'}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h4 className="text-white font-semibold text-sm line-clamp-2">
                    {event.title}
                  </h4>
                  <p className="text-white/80 text-xs mt-1">
                    {event.participant_count || 0} joined
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-50 rounded-2xl p-8 text-center mt-20"
          >
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-accent" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">No events created yet</h4>
            <p className="text-gray-500 text-sm mb-4">
              Start by creating your first event
            </p>
            <Button
              onClick={() => navigate(createPageUrl('CreateEvent'))}
              className="bg-accent hover:bg-accent-dark text-black rounded-full px-6 h-10"
            >
              Create Event
            </Button>
          </motion.div>
        )}
      </div>

      <BottomNav currentPage="" />
    </div>
  );
}
