import React, { useState, useRef, useEffect } from 'react';
import { apiClient } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import EventCard from '@/components/feed/EventCard';
import BottomNav from '@/components/navigation/BottomNav';
import NotificationBell from '@/components/feed/NotificationBell';
import SearchBar from '@/components/feed/SearchBar';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, HeartCrack } from 'lucide-react';

export default function Feed() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [joinedEvents, setJoinedEvents] = useState(new Set());
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => apiClient.getCurrentUser(),
  });

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events', currentUser?.id],
    queryFn: () => apiClient.getEvents({ current_user_id: currentUser?.id }),
    enabled: !!currentUser,
  });

  useEffect(() => {
    if (events.length > 0 && currentUser) {
      // Use the current_user_joined field from the backend
      const joined = new Set<string>();
      events.forEach((event: any) => {
        if (event.current_user_joined === true) {
          joined.add(event.id);
        }
      });
      console.log('Initializing joined events:', {
        totalEvents: events.length,
        joinedCount: joined.size,
        joinedEventIds: Array.from(joined),
        currentUserId: currentUser.id
      });
      setJoinedEvents(joined);
    }
  }, [events, currentUser]);

  const joinMutation = useMutation({
    mutationFn: async (event: any) => {
      if (!currentUser) throw new Error('Not authenticated');
      // Don't check joinedEvents here - trust the backend
      return apiClient.joinEvent({ event_id: event.id, user_id: currentUser.id });
    },
    onMutate: async (event: any) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['events', currentUser?.id] });

      // Optimistically update the UI
      setJoinedEvents(prev => new Set([...prev, event.id]));

      // Return context for rollback
      return { previousJoinedEvents: new Set(joinedEvents) };
    },
    onSuccess: (_, event: any) => {
      // Refetch to get updated data from backend
      queryClient.invalidateQueries({ queryKey: ['events', currentUser?.id] });
      queryClient.invalidateQueries({ queryKey: ['event', event.id] });
    },
    onError: (error: any, event: any, context: any) => {
      // Rollback on error
      if (context?.previousJoinedEvents) {
        setJoinedEvents(context.previousJoinedEvents);
      }
      console.error('Failed to join event:', error);
      // Only show alert for real errors (not "already joined")
      if (!error.message?.includes('Already joined')) {
        alert('Failed to join event. Please try again.');
      }
    }
  });

  const unjoinMutation = useMutation({
    mutationFn: async (event: any) => {
      if (!currentUser) throw new Error('Not authenticated');
      return apiClient.leaveEvent({ event_id: event.id, user_id: currentUser.id });
    },
    onMutate: async (event: any) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['events', currentUser?.id] });

      // Optimistically update the UI
      setJoinedEvents(prev => {
        const newSet = new Set(prev);
        newSet.delete(event.id);
        return newSet;
      });
      setShowConfirmModal(false);
      setSelectedEvent(null);

      // Return context for rollback
      return { previousJoinedEvents: new Set(joinedEvents) };
    },
    onSuccess: (_, event: any) => {
      queryClient.invalidateQueries({ queryKey: ['events', currentUser?.id] });
      queryClient.invalidateQueries({ queryKey: ['event', event.id] });
    },
    onError: (error: any, event: any, context: any) => {
      // Rollback on error
      if (context?.previousJoinedEvents) {
        setJoinedEvents(context.previousJoinedEvents);
      }
      console.error('Failed to leave event:', error);
      alert('Failed to leave event. Please try again.');
    }
  });

  const handleJoin = (event: any) => {
    console.log('Handle join called:', {
      eventId: event.id,
      eventTitle: event.title,
      isCurrentlyJoined: joinedEvents.has(event.id),
      participants: event.participants?.map((p: any) => p.user_id)
    });

    if (joinedEvents.has(event.id)) {
      // Show confirmation modal for unjoin
      setSelectedEvent(event);
      setShowConfirmModal(true);
    } else {
      // Join the event
      joinMutation.mutate(event);
    }
  };

  const handleConfirmLeave = () => {
    if (selectedEvent) {
      unjoinMutation.mutate(selectedEvent);
    }
  };

  const handleTap = (event: any) => {
    navigate(createPageUrl('EventDetail') + `?id=${event.id}`);
  };

  const handleScroll = (e: any) => {
    const container = e.target;
    const scrollTop = container.scrollTop;
    const cardHeight = container.clientHeight;
    const newIndex = Math.round(scrollTop / cardHeight);
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
    }
  };

  const scrollToIndex = (index) => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: index * containerRef.current.clientHeight,
        behavior: 'smooth'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/70">Loading events...</p>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="h-screen w-full bg-gray-50 flex flex-col">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="w-24 h-24 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <ChevronUp className="w-10 h-10 text-accent" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Events Yet</h2>
            <p className="text-gray-500 mb-6">Be the first to create an event!</p>
          </div>
        </div>
        <BottomNav currentPage="Feed" />
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-black relative overflow-hidden">
      {/* TUM Logo/Header */}
      <div className="absolute top-0 left-0 right-0 z-30 pt-4 pb-8 px-4 bg-gradient-to-b from-black/70 to-transparent">
        <div className="flex items-center gap-3">
          <h1 className="text-white font-bold text-lg tracking-tight whitespace-nowrap">TUMatch</h1>
          <SearchBar />
          <NotificationBell />
        </div>
      </div>

      {/* Vertical Scroll Feed */}
      <div
        ref={containerRef}
        className="h-full w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        onScroll={handleScroll}
        style={{ scrollSnapType: 'y mandatory' }}
      >
        {events.map((event: any) => (
          <div
            key={event.id}
            className="h-screen w-full snap-start snap-always"
            style={{ scrollSnapAlign: 'start' }}
          >
            <EventCard
              event={event}
              onJoin={handleJoin}
              onTap={() => handleTap(event)}
              isJoined={joinedEvents.has(event.id)}
            />
          </div>
        ))}
      </div>

      <BottomNav currentPage="Feed" />

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && selectedEvent && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              transition={{
                type: 'spring',
                damping: 25,
                stiffness: 300
              }}
              className="fixed bottom-0 left-0 right-0 z-[70] bg-white rounded-t-3xl shadow-2xl"
            >
              <div className="p-6 pb-8">
                {/* Handle bar */}
                <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6" />

                {/* Content */}
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <HeartCrack className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Leave this event?
                  </h3>
                  <p className="text-gray-600">
                    Are you sure you want to leave "{selectedEvent.title}"? You can always join again later.
                  </p>
                </div>

                {/* Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handleConfirmLeave}
                    disabled={unjoinMutation.isPending}
                    className="w-full h-14 bg-red-500 hover:bg-red-600 active:scale-[0.98] text-white font-semibold rounded-2xl transition-all duration-200 shadow-lg disabled:opacity-50"
                    style={{
                      transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)'
                    }}
                  >
                    {unjoinMutation.isPending ? (
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                    ) : (
                      'Yes, Leave Event'
                    )}
                  </button>

                  <button
                    onClick={() => setShowConfirmModal(false)}
                    disabled={unjoinMutation.isPending}
                    className="w-full h-14 bg-gray-100 hover:bg-gray-200 active:scale-[0.98] text-gray-700 font-semibold rounded-2xl transition-all duration-200 disabled:opacity-50"
                    style={{
                      transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
