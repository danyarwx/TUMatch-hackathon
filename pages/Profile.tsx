import React, { useState } from 'react';
import { apiClient } from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import { Settings, Camera, Grid3X3, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import BottomNav from '@/components/navigation/BottomNav';
import MomentCard from '@/components/profile/MomentCard';
import MomentModal from '@/components/profile/MomentModal';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Profile() {
  const [selectedMoment, setSelectedMoment] = useState(null);
  const navigate = useNavigate();

  const { data: currentUser, isLoading: userLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => apiClient.getCurrentUser(),
  });

  const { data: moments = [], isLoading: momentsLoading } = useQuery({
    queryKey: ['moments', currentUser?.id],
    queryFn: () => currentUser?.id ? apiClient.getMoments(currentUser.id) : Promise.resolve([]),
    enabled: !!currentUser,
  });

  const { data: friendships = [] } = useQuery({
    queryKey: ['friendships', currentUser?.id],
    queryFn: () => currentUser?.id ? apiClient.getFriendships(currentUser.id) : Promise.resolve([]),
    enabled: !!currentUser,
  });

  const { data: allEvents = [] } = useQuery({
    queryKey: ['events'],
    queryFn: () => apiClient.getEvents(),
  });

  // Filter events created by current user
  const myEvents = allEvents.filter((event: any) => event.creator_id === currentUser?.id);

  if (userLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-accent/5 to-white pt-12 pb-6 px-6">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-xl font-bold text-gray-900">Profile</h1>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Profile Info */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col items-center"
        >
          {/* Avatar */}
          <div className="relative mb-4">
            <div className="w-28 h-28 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gray-100">
              <img
                src={currentUser?.profile_photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.full_name || 'user'}`}
                alt={currentUser?.full_name}
                className="w-full h-full object-cover"
              />
            </div>
            <button className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-accent flex items-center justify-center shadow-lg border-2 border-white">
              <Camera className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Name & Info */}
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            {currentUser?.full_name || 'TUM Student'}
          </h2>
          <p className="text-gray-500 text-sm mb-4">
            {currentUser?.department || 'TUM Student'}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-8 mb-6">
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900">{moments.length}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Moments</p>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900">{friendships.length}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Friends</p>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900">{myEvents.length}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Events</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-center w-full px-4">
            <button
              onClick={() => navigate(createPageUrl('MyEvents'))}
              className="flex items-center justify-center gap-2 px-5 h-12 rounded-xl bg-accent text-black font-medium text-sm shadow-sm hover:shadow-md active:scale-[0.97] transition-all"
              style={{ minWidth: '145px' }}
            >
              <Calendar className="w-5 h-5" />
              <span>My Events</span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Moments Section */}
      <div className="px-6 pt-8">
        <div className="flex items-center gap-2 mb-4">
          <Grid3X3 className="w-5 h-5 text-accent" />
          <h3 className="font-semibold text-gray-900">My Moments</h3>
        </div>

        {momentsLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="aspect-square bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : moments.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {moments.map((moment, index) => (
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
              Join events and save photos from chats to create your moments
            </p>
          </motion.div>
        )}
      </div>

      <MomentModal
        moment={selectedMoment}
        isOpen={!!selectedMoment}
        onClose={() => setSelectedMoment(null)}
      />

      <BottomNav currentPage="Profile" />
    </div>
  );
}
