import { useState, useEffect } from 'react';
import { apiClient } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, MapPin, Clock, Users, Calendar, HeartCrack, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import BottomNav from '@/components/navigation/BottomNav';

export default function EventDetail() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get('id');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      if (!eventId) throw new Error('Event ID is required');
      return await apiClient.getEvent(eventId);
    },
    enabled: !!eventId,
  });

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => apiClient.getCurrentUser(),
  });

  // Check if user has joined by querying the event_participants table
  const { data: dbParticipants = [] } = useQuery({
    queryKey: ['eventParticipants', eventId],
    queryFn: async () => {
      if (!eventId) return [];
      try {
        return await apiClient.getEventParticipants(eventId);
      } catch (error) {
        console.error('Error fetching participants:', error);
        return [];
      }
    },
    enabled: !!eventId,
  });

  const isJoined = currentUser && dbParticipants.some((p: any) => String(p.user_id) === String(currentUser.id));

  console.log('EventDetails - isJoined:', isJoined, 'currentUser:', currentUser?.id, 'dbParticipants:', dbParticipants.map((p: any) => p.user_id));

  const joinMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser || !eventId) return;
      return await apiClient.joinEvent({
        event_id: eventId,
        user_id: currentUser.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventParticipants', eventId] });
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (error: any) => {
      console.error('Error joining event:', error);
      alert(error.message || 'Failed to join event');
    }
  });

  const unjoinMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser || !eventId) return;
      return await apiClient.leaveEvent({
        event_id: eventId,
        user_id: currentUser.id,
      });
    },
    onSuccess: () => {
      setShowConfirmModal(false);
      queryClient.invalidateQueries({ queryKey: ['eventParticipants', eventId] });
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (error: any) => {
      console.error('Error leaving event:', error);
      alert(error.message || 'Failed to leave event');
    }
  });

  const handleJoinClick = () => {
    console.log('handleJoinClick called - isJoined:', isJoined);
    if (isJoined) {
      console.log('Opening confirmation modal');
      setShowConfirmModal(true);
    } else {
      console.log('Joining event');
      joinMutation.mutate();
    }
  };

  const handleConfirmLeave = () => {
    unjoinMutation.mutate();
  };

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!eventId) return;
      return await apiClient.deleteEvent(eventId);
    },
    onSuccess: () => {
      // Invalidate lists and navigate back to MyEvents
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      navigate(createPageUrl('MyEvents'));
    },
    onError: (error: any) => {
      console.error('Error deleting event:', error);
      alert(error.message || 'Failed to delete event');
    }
  });

  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    if (!event?.start_time) return;

    const updateCountdown = () => {
      const now = new Date();
      const start = new Date(event.start_time);
      const diff = start.getTime() - now.getTime();

      if (diff <= 0) {
        setCountdown('Happening now!');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setCountdown(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setCountdown(`${hours}h ${minutes}m`);
      } else {
        setCountdown(`${minutes}m`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [event?.start_time]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500">Event not found</p>
      </div>
    );
  }

  const participants = event.participants || [];
  const participantCount = dbParticipants.length;

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="relative h-64 bg-gray-100">
        <img
          src={event.image_url || 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800'}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-12 left-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg"
        >
          <ArrowLeft className="w-5 h-5 text-gray-800" />
        </button>
      </div>

      {/* Organizer Photo - Overlapping */}
      <div className="relative -mt-16 flex justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={() => {
            // Navigate to organizer's profile if organizer_id exists
            if (event.organizer_id) {
              navigate(createPageUrl('UserProfile') + `?id=${event.organizer_id}`);
            }
          }}
          className={`w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white ${
            event.organizer_id ? 'cursor-pointer hover:scale-105 transition-transform' : ''
          }`}
        >
          <img
            src={event.organizer_photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${event.organizer_name}`}
            alt={event.organizer_name}
            className="w-full h-full object-cover"
          />
        </motion.div>
      </div>

      {/* Content */}
      <div className="px-6 pt-4">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-6"
        >
          <p className="text-accent font-medium text-sm mb-1">Organized by</p>
          <button
            onClick={() => {
              if (event.organizer_id) {
                navigate(createPageUrl('UserProfile') + `?id=${event.organizer_id}`);
              }
            }}
            className={`text-gray-900 font-semibold ${
              event.organizer_id ? 'hover:text-accent transition-colors' : ''
            }`}
          >
            {event.organizer_name}
          </button>
          {event.organizer_department && (
            <p className="text-gray-500 text-sm">{event.organizer_department}</p>
          )}
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="text-2xl font-bold text-gray-900 text-center mb-4"
        >
          {event.title}
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-gray-600 text-center mb-8 leading-relaxed"
        >
          {event.description}
        </motion.p>

        {/* Info Cards */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="grid grid-cols-2 gap-4 mb-8"
        >
          <div className="bg-gray-50 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-5 h-5 text-accent" />
              <span className="text-xs text-gray-500 uppercase tracking-wider">Location</span>
            </div>
            <p className="font-semibold text-gray-900">{event.location}</p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-accent" />
              <span className="text-xs text-gray-500 uppercase tracking-wider">Date</span>
            </div>
            <p className="font-semibold text-gray-900">
              {format(new Date(event.start_time), 'MMM d, yyyy')}
            </p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-accent" />
              <span className="text-xs text-gray-500 uppercase tracking-wider">Time</span>
            </div>
            <p className="font-semibold text-gray-900">
              {format(new Date(event.start_time), 'h:mm a')}
            </p>
          </div>
          <div className="bg-[#ffcc00]/20 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-accent" />
              <span className="text-xs text-gray-500 uppercase tracking-wider">Starts in</span>
            </div>
            <p className="font-bold text-gray-900">{countdown}</p>
          </div>
        </motion.div>

        {/* Participants */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-accent" />
            <h2 className="font-semibold text-gray-900">Who's going</h2>
            <span className="text-gray-500">({participantCount})</span>
          </div>

          {participantCount > 0 ? (
            <>
              {/* Display localStorage participants for UI (will be replaced with backend user data) */}
              {participants.length > 0 && (
                <div className="flex items-center mb-2">
                  {participants.slice(0, 8).map((p: any, i: number) => (
                    <div
                      key={i}
                      onClick={() => navigate(createPageUrl('UserProfile') + `?id=${p.user_id}`)}
                      className="w-12 h-12 rounded-full border-2 border-white overflow-hidden shadow-md cursor-pointer transition-all duration-200 ease-out hover:-translate-y-1 hover:scale-[1.03] hover:shadow-lg hover:z-10"
                      style={{
                        marginLeft: i > 0 ? '-8px' : '0',
                        transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)'
                      }}
                    >
                      <img
                        src={p.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.name}`}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                  {participants.length > 8 && (
                    <div
                      className="w-12 h-12 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center shadow-md"
                      style={{ marginLeft: '-8px' }}
                    >
                      <span className="text-sm font-medium text-gray-600">+{participants.length - 8}</span>
                    </div>
                  )}
                </div>
              )}
              {participants.length === 0 && (
                <p className="text-gray-500 text-sm">{participantCount} {participantCount === 1 ? 'person' : 'people'} joined</p>
              )}
            </>
          ) : (
            <p className="text-gray-500 text-sm">Be the first to join!</p>
          )}
        </motion.div>

        {/* Join Button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35 }}
          onClick={() => console.log('Motion div clicked')}
        >
          <Button
            onClick={(e) => {
              console.log('Button onClick triggered', e);
              handleJoinClick();
            }}
            disabled={joinMutation.isPending || unjoinMutation.isPending}
            className={`w-full h-14 rounded-2xl text-lg font-semibold shadow-lg transition-all duration-200 ${
              isJoined
                ? 'bg-accent/10 text-black border-2 border-accent/20 hover:bg-accent/20'
                : 'bg-accent text-black hover:bg-accent-dark active:scale-[0.98]'
            }`}
            style={{
              transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)'
            }}
          >
            {joinMutation.isPending || unjoinMutation.isPending ? (
              <div className="w-6 h-6 border-2 border-current/30 border-t-current rounded-full animate-spin" />
            ) : isJoined ? (
              <span className="flex items-center gap-2">
                ✓ You Joined
              </span>
            ) : (
              <span className="flex items-center gap-2">
                + Join Event
              </span>
            )}
          </Button>
        </motion.div>

        {/* Organizer actions: Delete event */}
        {currentUser && String(currentUser.id) === String(event.creator_id) && (
          <div className="px-6 mt-4">
            <Button
              onClick={() => setShowDeleteModal(true)}
              disabled={deleteMutation.isPending}
              className="w-full h-12 rounded-2xl text-sm font-semibold shadow-md bg-red-500 hover:bg-red-600 text-white"
            >
              {deleteMutation.isPending ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
              ) : (
                <span className="flex items-center justify-center gap-2"><Trash className="w-4 h-4" /> Delete Event</span>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
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
                    Are you sure you want to leave "{event?.title}"? You can always join again later.
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
                      <span className="flex items-center justify-center gap-2">
                        💔 Leave Event
                      </span>
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

      <AnimatePresence>
        {showDeleteModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
            />

            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-[70] bg-white rounded-t-3xl shadow-2xl"
            >
              <div className="p-6 pb-8">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6" />

                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trash className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Delete this event?</h3>
                  <p className="text-gray-600">This will permanently remove the event "{event?.title}" and all related data. This action cannot be undone.</p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => deleteMutation.mutate()}
                    disabled={deleteMutation.isPending}
                    className="w-full h-14 bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-semibold rounded-2xl transition-all duration-200 shadow-lg disabled:opacity-50"
                  >
                    {deleteMutation.isPending ? (
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                    ) : (
                      <span className="flex items-center justify-center gap-2">Delete event</span>
                    )}
                  </button>

                  <button
                    onClick={() => setShowDeleteModal(false)}
                    disabled={deleteMutation.isPending}
                    className="w-full h-14 bg-gray-100 hover:bg-gray-200 active:scale-[0.98] text-gray-700 font-semibold rounded-2xl transition-all duration-200 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <BottomNav currentPage="" />
    </div>
  );
}
