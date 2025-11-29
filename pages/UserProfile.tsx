import React, { useState } from 'react';
import { apiClient } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, UserPlus, UserCheck, Camera, Grid3X3, MapPin, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import BottomNav from '@/components/navigation/BottomNav';
import MomentCard from '@/components/profile/MomentCard';
import MomentModal from '@/components/profile/MomentModal';

export default function UserProfile() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('id');
  const [selectedMoment, setSelectedMoment] = useState<any | null>(null);

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => apiClient.getCurrentUser(),
  });

  // Fetch the viewed user's data from backend
  const { data: user, isLoading: userLoading, error: userError } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => apiClient.getUser(userId as string),
    enabled: !!userId,
  });

  // Fallback: fetch all users and try to match by id if direct fetch failed
  const { data: allUsers = [] } = useQuery({
    queryKey: ['users', 'fallback', userId],
    queryFn: () => apiClient.getUsers(),
    enabled: !!userId && !!userError,
  });

  const { data: moments = [] } = useQuery({
    queryKey: ['moments', userId],
    queryFn: () => apiClient.getMoments(userId as string),
    enabled: !!userId,
  });

  const { data: friendships = [] } = useQuery({
    queryKey: ['friendships', userId],
    queryFn: () => apiClient.getFriendships(userId as string),
    enabled: !!userId,
  });

  const { data: events = [] } = useQuery({
    queryKey: ['userEvents', userId],
    queryFn: async () => {
      const all: any[] = await apiClient.getEvents();
      return all.filter(e => e.participants?.some((p: any) => String(p.user_id) === String(userId)));
    },
    enabled: !!userId,
  });

  const matchedFallback = allUsers.find((u: any) => String(u.id) === String(userId));

  const displayUser = user || matchedFallback || {
    id: userId,
    full_name: 'TUM Student',
    email: 'student@tum.de',
    profile_photo: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
    department: 'TUM Student',
    bio: '',
  };

  const isOwnProfile = currentUser?.id === userId;

  // Determine if current user and viewed user are already friends (either direction)
  const isFriend = friendships.some((f: any) => {
    const a = String(f.user_id);
    const b = String(f.friend_id);
    const me = String(currentUser?.id);
    const them = String(displayUser?.id || userId);
    return ((a === me && b === them) || (a === them && b === me)) && f.status === 'accepted';
  });

  const queryClient = useQueryClient();
  // Find existing friendship object (any direction)
  const existingFriendship = friendships.find((f: any) => {
    const a = String(f.user_id);
    const b = String(f.friend_id);
    const me = String(currentUser?.id);
    const them = String(displayUser?.id || userId);
    return (a === me && b === them) || (a === them && b === me);
  });

  const createFriendMutation = useMutation({
    mutationFn: (data: { user_id: string; friend_id: string }) => apiClient.createFriendship(data),
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: ['friendships', userId] });
      await queryClient.cancelQueries({ queryKey: ['friendships', currentUser?.id] });

      const prevForUser = queryClient.getQueryData(['friendships', userId]) as any[] | undefined;
      const prevForMe = queryClient.getQueryData(['friendships', currentUser?.id]) as any[] | undefined;

      const tempId = `temp-${Date.now()}`;
      const optimistic = {
        id: tempId,
        user_id: data.user_id,
        friend_id: data.friend_id,
        status: 'pending',
        created_at: new Date().toISOString(),
      };

      queryClient.setQueryData(['friendships', userId], (old: any[] | undefined) => {
        return old ? [...old, optimistic] : [optimistic];
      });
      queryClient.setQueryData(['friendships', currentUser?.id], (old: any[] | undefined) => {
        return old ? [...old, optimistic] : [optimistic];
      });

      return { prevForUser, prevForMe, tempId };
    },
    onError: (err, variables, context: any) => {
      if (context?.prevForUser) queryClient.setQueryData(['friendships', userId], context.prevForUser);
      if (context?.prevForMe) queryClient.setQueryData(['friendships', currentUser?.id], context.prevForMe);
    },
    onSettled: () => {
      queryClient.invalidateQueries(['friendships', userId]);
      queryClient.invalidateQueries(['friendships', currentUser?.id]);
    }
  });

  const deleteFriendMutation = useMutation({
    mutationFn: (friendship_id: string) => apiClient.deleteFriendship(friendship_id),
    onMutate: async (friendship_id: string) => {
      await queryClient.cancelQueries({ queryKey: ['friendships', userId] });
      await queryClient.cancelQueries({ queryKey: ['friendships', currentUser?.id] });

      const prevForUser = queryClient.getQueryData(['friendships', userId]) as any[] | undefined;
      const prevForMe = queryClient.getQueryData(['friendships', currentUser?.id]) as any[] | undefined;

      queryClient.setQueryData(['friendships', userId], (old: any[] | undefined) => (old || []).filter(f => String(f.id) !== String(friendship_id)));
      queryClient.setQueryData(['friendships', currentUser?.id], (old: any[] | undefined) => (old || []).filter(f => String(f.id) !== String(friendship_id)));

      return { prevForUser, prevForMe };
    },
    onError: (err, variables, context: any) => {
      if (context?.prevForUser) queryClient.setQueryData(['friendships', userId], context.prevForUser);
      if (context?.prevForMe) queryClient.setQueryData(['friendships', currentUser?.id], context.prevForMe);
    },
    onSettled: () => {
      queryClient.invalidateQueries(['friendships', userId]);
      queryClient.invalidateQueries(['friendships', currentUser?.id]);
    }
  });

  if (!userId) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">User not found</p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (userLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header with Back Button */}
      <div className="relative">
        <div className="h-32 bg-gradient-to-b from-accent/10 to-transparent" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-12 left-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg z-10"
        >
          <ArrowLeft className="w-5 h-5 text-gray-800" />
        </button>
      </div>

      {/* Profile Section */}
      <div className="px-6 -mt-16">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col items-center"
        >
          {/* Avatar */}
          <div className="relative mb-4">
            <div className="w-28 h-28 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gray-100">
              <img
                src={displayUser.profile_photo}
                alt={displayUser.full_name}
                className="w-full h-full object-cover"
              />
            </div>
            <button className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-accent flex items-center justify-center shadow-lg border-2 border-white">
              <Camera className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Name & Info */}
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            {displayUser.full_name}
          </h2>
          <p className="text-gray-500 text-sm mb-2">
            {displayUser.department}
          </p>

          {/* Bio */}
          {displayUser.bio && (
            <p className="text-gray-600 text-center text-sm mb-4 max-w-sm">
              {displayUser.bio}
            </p>
          )}

          {/* Stats */}
          <div className="flex items-center gap-8 mb-6">
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900">{events.length}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Events</p>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900">{moments.length}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Moments</p>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900">{friendships.length}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Friends</p>
            </div>
          </div>

          {/* Action Button */}
          {!isOwnProfile && (
            <Button
              onClick={() => {
                if (!currentUser?.id || !displayUser?.id) return;
                // If we have an existing friendship, treat click as cancel (if pending) or unfriend (if accepted)
                if (existingFriendship) {
                  deleteFriendMutation.mutate(existingFriendship.id);
                  return;
                }

                // Otherwise send a friend request (becomes 'Requested')
                createFriendMutation.mutate({ user_id: currentUser.id, friend_id: displayUser.id });
              }}
              disabled={createFriendMutation.isLoading || deleteFriendMutation.isLoading}
              variant={isFriend ? 'outline' : 'default'}
              className={`rounded-full px-6 h-10 ${
                isFriend
                  ? 'border-accent text-accent hover:bg-accent hover:text-black'
                  : 'bg-accent text-black hover:bg-accent-dark'
              } transition-all`}
            >
              {isFriend ? (
                <>
                  <UserCheck className="w-4 h-4 mr-2" />
                  Friends
                </>
              ) : (createFriendMutation.isLoading || deleteFriendMutation.isLoading) ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : existingFriendship && existingFriendship.status !== 'accepted' ? (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Requested
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Friend
                </>
              )}
            </Button>
          )}
        </motion.div>
      </div>

      {/* Upcoming Events Section */}
      {events.length > 0 && (
        <div className="px-6 pt-8">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-accent" />
            <h3 className="font-semibold text-gray-900">Attending Events</h3>
            <span className="text-sm text-gray-500">({events.length})</span>
          </div>

          <div className="space-y-3">
            {events.slice(0, 3).map((event: any) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => navigate(`/eventdetail?id=${event.id}`)}
                className="flex items-center gap-4 p-3 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <img
                  src={event.image_url || 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800'}
                  alt={event.title}
                  className="w-16 h-16 rounded-xl object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{event.title}</p>
                  <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{event.location}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Moments Section */}
      <div className="px-6 pt-8">
        <div className="flex items-center gap-2 mb-4">
          <Grid3X3 className="w-5 h-5 text-accent" />
          <h3 className="font-semibold text-gray-900">
            {isOwnProfile ? 'My Moments' : 'Moments'}
          </h3>
        </div>

        {moments.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {moments.map((moment: any, index: number) => (
              <MomentCard
                key={moment.id}
                moment={moment}
                index={index}
                onClick={() => setSelectedMoment(moment)}
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-50 rounded-2xl p-8 text-center"
          >
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Camera className="w-8 h-8 text-accent" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">No moments yet</h4>
            <p className="text-gray-500 text-sm">
              {isOwnProfile
                ? 'Join events and save photos from chats to create your moments'
                : 'This user hasn\'t shared any moments yet'}
            </p>
          </motion.div>
        )}
      </div>

      <MomentModal
        moment={selectedMoment}
        isOpen={!!selectedMoment}
        onClose={() => setSelectedMoment(null)}
      />

      <BottomNav currentPage="" />
    </div>
  );
}
