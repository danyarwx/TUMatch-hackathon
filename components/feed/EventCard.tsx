import React, { useState, useEffect } from 'react';
import { MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function EventCard({ event, onJoin, onTap, isJoined }) {
  const navigate = useNavigate();

  const handleAvatarClick = (e, userId) => {
    e.stopPropagation();
    navigate(createPageUrl('UserProfile') + `?id=${userId}`);
  };
  const [countdown, setCountdown] = useState('');
  const [isHappeningNow, setIsHappeningNow] = useState(false);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const start = new Date(event.start_time);
      const diff = start - now;

      if (diff <= 0) {
        setCountdown('Happening Now');
        setIsHappeningNow(true);
        return;
      }

      setIsHappeningNow(false);
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (hours > 24) {
        const days = Math.floor(hours / 24);
        setCountdown(`In ${days}d ${hours % 24}h`);
      } else if (hours > 0) {
        setCountdown(`In ${hours}h ${minutes}m`);
      } else {
        setCountdown(`In ${minutes}m`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [event.start_time]);

  const participants = event.participants || [];
  const participantCount = event.participant_count || participants.length || 0;
  const visibleParticipants = participants.slice(0, 3);
  const remainingCount = Math.max(0, participantCount - 3);

  return (
    <motion.div
      className="relative h-full w-full overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onTap}
    >
      {/* Background Image with blur gradient */}
      <div className="absolute inset-0">
        <img
          src={event.image_url || 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800'}
          alt={event.title}
          className="w-full h-full object-cover"
          style={{ filter: 'saturate(0.85) brightness(0.9)' }}
        />
        {/* Multi-layer gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(to top,
                rgba(0,0,0,0.85) 0%,
                rgba(0,0,0,0.7) 25%,
                rgba(0,0,0,0.3) 50%,
                rgba(0,0,0,0.15) 75%,
                rgba(0,0,0,0.25) 100%
              )
            `
          }}
        />
        {/* Additional blur layer at bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1/2"
          style={{
            backdropFilter: 'blur(2px)',
            WebkitBackdropFilter: 'blur(2px)',
            maskImage: 'linear-gradient(to top, black 0%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to top, black 0%, transparent 100%)'
          }}
        />
      </div>

      {/* Top Left Badges - Stacked vertically */}
      <div className="absolute top-16 left-4 flex flex-col gap-2 z-10">
        {/* Time Badge - Primary */}
        <div className={`px-4 py-2 rounded-full shadow-lg flex items-center gap-2 ${
          isHappeningNow
            ? 'bg-[#ffcc00]'
            : 'bg-white/95 backdrop-blur-sm'
        }`}>
          <Clock className={`w-4 h-4 ${isHappeningNow ? 'text-gray-900' : 'text-accent'}`} />
          <span className={`text-sm font-bold ${isHappeningNow ? 'text-gray-900' : 'text-gray-800'}`}>
            {countdown}
          </span>
        </div>

        {/* Location Badge - Secondary (outline style) */}
        <div className="px-4 py-2 rounded-full border-2 border-white/60 bg-black/20 backdrop-blur-sm flex items-center gap-2">
          <MapPin className="w-4 h-4 text-white" />
          <span className="text-sm font-medium text-white">{event.location}</span>
        </div>
      </div>

      {/* Bottom Content Card */}
      <div className="absolute bottom-24 left-0 right-0 px-4">
        <div className="space-y-3">
          {/* Title */}
          <h2 className="text-[22px] leading-tight font-bold text-white drop-shadow-lg">
            {event.title}
          </h2>

          {/* Description - max 2 lines */}
          <p className="text-white/85 text-[15px] leading-relaxed line-clamp-2">
            {event.description}
          </p>

          {/* Avatars Row */}
          <div className="flex items-center gap-3 pt-1">
            <div className="flex items-center">
              {visibleParticipants.map((p, i) => (
                <div
                  key={i}
                  onClick={(e) => handleAvatarClick(e, p.user_id)}
                  className="w-9 h-9 rounded-full border-2 border-white overflow-hidden shadow-md bg-gray-200 cursor-pointer transition-all duration-200 ease-out hover:-translate-y-1 hover:scale-[1.03] hover:shadow-lg hover:z-10 active:scale-95"
                  style={{
                    marginLeft: i > 0 ? '-10px' : '0',
                    zIndex: 3 - i,
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
              {remainingCount > 0 && (
                <div
                  className="w-9 h-9 rounded-full border-2 border-white bg-gray-800/80 backdrop-blur-sm flex items-center justify-center shadow-md"
                  style={{ marginLeft: '-10px' }}
                >
                  <span className="text-xs font-semibold text-white">+{remainingCount}</span>
                </div>
              )}
            </div>
            <span className="text-white/70 text-sm">
              {participantCount} {participantCount === 1 ? 'person' : 'people'} going
            </span>
          </div>

          {/* CTA Button */}
          <div className="pt-3">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onJoin(event);
              }}
              className={`w-full h-12 rounded-xl text-base font-semibold shadow-lg transition-all ${
                isJoined
                  ? 'bg-[#CFE2FF] text-[#1E67F5] border border-[#1E67F5]/20 hover:bg-[#BDD4F7]'
                  : 'bg-[#1E67F5] text-white hover:bg-[#1854D1]'
              }`}
            >
              {isJoined ? '✓ You Joined' : 'Join Event'}
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Swipe Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
        <div className="w-10 h-1 bg-white/40 rounded-full" />
      </div>
    </motion.div>
  );
}
